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

const keyfileName = `deploy/payer-keypair.json`
const payerKeypairFile = path.resolve(`${__dirname}${SLASH}${keyfileName}`)

;(async () => {
    console.log(`\n\n\⚙️ Deploying program...\n`)

    const networks = JSON.parse(fs.readFileSync(solConfigFile, "utf8"))
    let config = networks.development.config
    let solana = new Solana(config)

    let method

    if (!fs.existsSync(payerKeypairFile)) {
        console.log(`\n\n\ Note: Generating key and using Anchor deploy \n\n`)

        let payerKeypair = await solana.createAccount({})
        console.log(`\n\n\⚙️ Created keypair.\n`)
        console.log(`\n\n\⚙️ Saving keypair. ${payerKeypairFile}\n`)
        fs.writeFileSync(
            payerKeypairFile,
            `[${Buffer.from(payerKeypair.secretKey.toString())}]`
        )

        method = ["deploy"]
    } else {
        // already have a keypair and programId, upgrade it instead of deploying new one
        console.log(`\n\n\⚙️ Upgrading program.\n`)
        method = [
            "upgrade",
            "target/deploy/solblog.so",
            "--program-id",
            "3v1Y5wFi4fn3wij7W6hJztdYoLgVqR9a4n8ARpaGNqW9",
        ]
    }

    spawn.sync(
        "anchor",
        [
            ...method,
            "--provider.cluster",
            "Devnet",
            "--provider.wallet",
            `${keyfileName}`,
        ],
        { stdio: "inherit" }
    )

    console.log(`\n\n\⚙️ ${method[0]}'d program to blockchain.\n\n`)
})()
