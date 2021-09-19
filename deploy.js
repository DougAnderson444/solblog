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

    spawn.sync("solana-keygen", ["new", "--outfile", `${keyfileName}`], {
        stdio: "inherit",
    })

    let payerKeypair = await solana.createAccount({})
    console.log(`\n\n\⚙️ Created keypair.\n`)
    console.log(`\n\n\⚙️ Saving keypair. ${payerKeypairFile}\n`)
    fs.writeFileSync(
        payerKeypairFile,
        `[${Buffer.from(payerKeypair.secretKey.toString())}]`
    )
    spawn.sync(
        "anchor",
        [
            "deploy",
            "--provider.cluster",
            "Devnet",
            "--provider.wallet",
            `${keyfileName}`,
        ],
        { stdio: "inherit" }
    )

    console.log(`\n\n\⚙️  Deployed program to blockchain.\n\n`)
})()
