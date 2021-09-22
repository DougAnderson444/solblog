const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const SLASH = path.sep

export const keyfileName = `deploy/payer-keypair.json`
export const programKeyfileName = `target/deploy/solblog-keypair.json`
export const programKeypairFile = path.resolve(
    `${__dirname}${SLASH}${programKeyfileName}`
)
