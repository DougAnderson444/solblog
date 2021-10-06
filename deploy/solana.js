import {
    Keypair,
    Connection,
    BpfLoader,
    BPF_LOADER_PROGRAM_ID,
    PublicKey,
    LAMPORTS_PER_SOL,
    SystemProgram,
    TransactionInstruction,
    Transaction,
    sendAndConfirmTransaction,
} from "@solana/web3.js"
import bs58 from "bs58"

export default class Solana {
    constructor(config) {
        this.serviceUri = config.httpUri
        this.connection = new Connection(this.serviceUri, "confirmed")
        console.log("\nConnected to", this.serviceUri)
    }

    static getPublicKey(publicKey) {
        return typeof publicKey === "string"
            ? new PublicKey(publicKey)
            : publicKey
    }

    static getSigningAccount(privateKey) {
        const kp = Keypair.fromSecretKey(privateKey)
        return kp
    }

    async getAccountInfo(publicKey) {
        return await this.connection.getAccountInfo(
            Solana.getPublicKey(publicKey)
        )
    }

    async getAccountBalance(publicKey) {
        return await this.connection.getBalance(Solana.getPublicKey(publicKey))
    }

    async airDrop(account, lamports) {
        const signature = await this.connection.requestAirdrop(
            Solana.getPublicKey(account),
            lamports
        )
        await this.connection.confirmTransaction(signature)
    }

    async createSystemAccount() {
        let self = this
        let lamports = 1
        let account = new Keypair()

        console.log(
            `🤖 Keypair ${account.publicKey} created. Requesting Airdrop...`
        )
        await self.airDrop(Solana.getPublicKey(account.publicKey), lamports)
        return account
    }

    /**
     * Creates an account and adds lamports
     *
     * @param options   lamports: Number of lamports to add
     *                  entropy:  Secret key used to generate account keypair Buffer | Uint8Array | Array<number>
     * @returns Keypair that was created
     */
    async createAccount(options = { lamports: false, entropy: false }) {
        let self = this
        let lamports = options.lamports || LAMPORTS_PER_SOL * 4
        let account = options.entropy
            ? new Keypair(options.entropy)
            : new Keypair()

        let retries = 10

        console.log(
            `*** Keypair ${
                account.publicKey
            } created. Requesting Airdrop... ${lamports}lamports / ${
                lamports / LAMPORTS_PER_SOL
            }SOL`
        )
        await self.airDrop(Solana.getPublicKey(account.publicKey), lamports)

        for (;;) {
            await Solana._sleep(900)
            let balance = await self.getAccountBalance(
                Solana.getPublicKey(account.publicKey)
            )
            if (lamports == balance) {
                console.log(
                    `🪂 Airdrop success for ${account.publicKey} (balance: ${lamports})`
                )
                return account
            }
            if (--retries <= 0) {
                break
            }
            console.log(
                `--- Airdrop retry #${retries} for ${account.publicKey}`
            )
        }
        throw new Error(
            `Airdrop of ${lamports} failed for ${account.publicKey}`
        )
    }

    async createPayerAccount(program) {
        let self = this
        let dataLayouts = Solana.getDataLayouts()
        let fees = 0
        const { feeCalculator } = await self.connection.getRecentBlockhash()

        console.log({ feeCalculator })

        console.log("pgm length: ", program.length)

        const rentForExempt =
            await self.connection.getMinimumBalanceForRentExemption(
                program.length
            )

        console.log({ rentForExempt })

        // Calculate the cost to load the program
        const NUM_RETRIES = 500
        fees +=
            feeCalculator.lamportsPerSignature *
                (BpfLoader.getMinNumSignatures(program.length) + NUM_RETRIES) +
            rentForExempt

        // Calculate the cost to fund all state accounts
        for (let l = 0; l < dataLayouts.length; l++) {
            fees += await self.connection.getMinimumBalanceForRentExemption(
                dataLayouts[l].layout.span
            )
        }

        // Calculate the cost of sending the transactions
        fees += feeCalculator.lamportsPerSignature * 100 // wag

        // Fund a new payer via airdrop
        return await self.createAccount({ lamports: fees })
    }

    async deployProgram(program, layouts = false) {
        let self = this
        let dataLayouts = layouts || Solana.getDataLayouts()

        let payerAccount = await self.createPayerAccount(program)
        let deployAccounts = {
            payer: {
                publicKey: payerAccount.publicKey.toBase58(),
                privateKey: bs58.encode(payerAccount.secretKey),
                lamports: await self.getAccountBalance(payerAccount.publicKey),
            },
        }

        let programAccount = new Keypair()
        await BpfLoader.load(
            self.connection,
            payerAccount,
            programAccount,
            program,
            BPF_LOADER_PROGRAM_ID
        )
        let programId = programAccount.publicKey

        // Create all the state accounts
        let signers = [payerAccount]
        let transaction = new Transaction()
        for (let l = 0; l < dataLayouts.length; l++) {
            // TODO: push/pull seed from program?
            let seed = "same seed in rust & javascript"

            let stateAccount = await PublicKey.createWithSeed(
                payerAccount.publicKey,
                seed,
                programId
            )

            // signers.push(stateAccount); // stateAccount isn't a signer

            let space = dataLayouts[l].layout.span

            let lamports =
                await self.connection.getMinimumBalanceForRentExemption(
                    dataLayouts[l].layout.span
                )

            transaction.add(
                SystemProgram.createAccountWithSeed({
                    basePubkey: payerAccount.publicKey, // : PublicKey
                    // Base public key to use to derive the address of the created account. Must be the same as the base key used to create newAccountPubkey

                    fromPubkey: payerAccount.publicKey, // : PublicKey
                    // The account that will transfer lamports to the created account

                    lamports, // : number
                    // Amount of lamports to transfer to the created account

                    newAccountPubkey: stateAccount, // : PublicKey
                    // Public key of the created account. Must be pre-calculated with PublicKey.createWithSeed()

                    programId, // : PublicKey
                    // Public key of the program to assign as the owner of the created account

                    seed, // : string
                    // Seed to use to derive the address of the created account. Must be the same as the seed used to create newAccountPubkey

                    space, // : number
                    // Amount of space in bytes to allocate to the created account
                })
            )

            deployAccounts[dataLayouts[l].name] = {
                publicKey: stateAccount.toBase58(),
                lamports,
            }
        }

        await sendAndConfirmTransaction(self.connection, transaction, signers, {
            commitment: "singleGossip",
            preflightCommitment: "singleGossip",
        })

        return {
            programId: programAccount.publicKey.toBase58(),
            programAccounts: deployAccounts,
        }
    }

    async submitTransaction(options) {
        let self = this
        let instruction = new TransactionInstruction({
            keys: options.keys,
            programId: options.programId,
            data: options.data,
        })

        return await sendAndConfirmTransaction(
            self.connection,
            new Transaction().add(instruction),
            [options.payer],
            {
                commitment: "singleGossip",
                preflightCommitment: "singleGossip",
            }
        )
    }

    static async _sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
}
