import fs from "fs"
import path from "path"
import bs58 from "bs58"
import spawn from "cross-spawn"
import { fileURLToPath } from "url"
import { dirname } from "path"
import Solana from "./deploy/solana.js"
import { setUncaughtExceptionCaptureCallback } from "process"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SLASH = path.sep
const PAYER = "payer"

const dappConfigFile = path.resolve(
    `${__dirname}${SLASH}deploy${SLASH}dapp-config.json`
)

const solConfigFile = path.resolve(
    `${__dirname}${SLASH}deploy${SLASH}solana-config.json`
)

const programAuthorityKeyfileName = `deploy/programauthority-keypair.json`
const programAuthorityKeypairFile = path.resolve(
    `${__dirname}${SLASH}${programAuthorityKeyfileName}`
)

const programKeyfileName = `target/deploy/solblog-keypair.json`
const programKeypairFile = path.resolve(
    `${__dirname}${SLASH}${programKeyfileName}`
)

let programKeypair
let programId
try {
    programKeypair = readKeyfile(programKeypairFile)

    programId = programKeypair.publicKey.toString()
    console.log({ programId })
} catch (error) {
    console.log(
        `\n\n\ *** Note:*** Did you remember to FIRST
            \n\n1. run 'anchor build' ? 
            \n2. paste the
            \n\n\  
            solana address -k ./target/deploy/solblog-keypair.json
            \n\n\ as declare_id("....) in the lib.rs
            \n3. THEN run npm run deploy?
            \n\n`
    )
}

const networks = JSON.parse(fs.readFileSync(solConfigFile, "utf8"))
let config = networks.development.config
let solana = new Solana(config)

// Unpopulated dappConfig
let dappConfig = {
    httpUri: config.httpUri,
    contracts: {},
    accounts: [],
    wallets: [],
    programInfo: null,
}

if (fs.existsSync(dappConfigFile)) {
    dappConfig = JSON.parse(fs.readFileSync(dappConfigFile, "utf8"))
}

export function readKeyfile(keypairFile) {
    let kf = fs.readFileSync(keypairFile)
    let parsed = JSON.parse(kf.toString())
    kf = new Uint8Array(parsed)
    const keypair = Solana.getSigningAccount(kf)
    return keypair
}

;(async () => {
    console.log(`\n\n\⚙️ Deploying program...\n`)

    let method
    let programAuthorityKeypair

    if (!fs.existsSync(programAuthorityKeypairFile)) {
        // make sure keys will match

        console.log(
            `\n\n\ *** Note:*** Did you remember to FIRST
            \n\n1. run 'anchor build' ? 
            \n2. paste the
            \n\n\  
                    solana address -k ./target/deploy/solblog-keypair.json
            \n\n\ as declare_id("....) in the lib.rs
            \n3. THEN run npm run deploy?
            \n\n`
        )

        spawn.sync("anchor", ["build"], { stdio: "inherit" })

        console.log(`\n\n\ Note: Generating key and using Anchor deploy \n\n`)

        programAuthorityKeypair = await solana.createAccount()
        console.log(`\n\n\⚙️ Created keypair.\n`)
        console.log(`\n\n\⚙️ Saving keypair. ${programAuthorityKeypairFile}\n`)
        fs.writeFileSync(
            programAuthorityKeypairFile,
            `[${Buffer.from(programAuthorityKeypair.secretKey.toString())}]`
        )

        // fund another account
        await solana.airDrop(
            Solana.getPublicKey(dappConfig.wallets[0].publicKey),
            1000000000
        )

        // CLI: solana airdrop --url devnet 1 <recipientaddress>
        // solana airdrop --url devnet 1 FxfJzcXQVfHhPkudanTRuxCi9bda1XoDockbxYL8Hndm
        let walletLamports = await solana.getAccountBalance(
            Solana.getPublicKey(dappConfig.wallets[0].publicKey)
        )

        console.log(
            `\n\n\⚙️ also Airdroped ${walletLamports} to ${dappConfig.wallets[0].publicKey}.\n\n`
        )

        method = ["deploy"]
    } else {
        programAuthorityKeypair = readKeyfile(programAuthorityKeypairFile)
        // already have a keypair and programId, upgrade it instead of deploying new one
        console.log(`\n\n\⚙️ Upgrading program.\n`)
        method = [
            "upgrade",
            "target/deploy/solblog.so",
            "--program-id",
            programId,
        ]
    }

    spawn.sync(
        "anchor",
        [
            ...method,
            "--provider.cluster",
            "Devnet",
            "--provider.wallet",
            `${programAuthorityKeypairFile}`,
        ],
        { stdio: "inherit" }
    )

    console.log(
        `\n\n\⚙️ ${method[0]}'d program to blockchain using programAuthority: ${programAuthorityKeypair.publicKey}.\n\n`
    )

    let programAuthorityLamports = await solana.getAccountBalance(
        Solana.getPublicKey(programAuthorityKeypair.publicKey)
    )

    dappConfig.programInfo = {
        programId,
        programAccounts: {
            payer: {
                publicKey: programAuthorityKeypair.publicKey.toString(),
                privateKey: programAuthorityKeypair.secretKey.toString(),
                lamports: programAuthorityLamports,
            },
        },
    }

    fs.writeFileSync(
        dappConfigFile,
        JSON.stringify(dappConfig, null, "\t"),
        "utf8"
    )
})()
