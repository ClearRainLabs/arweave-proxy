const Arweave = require('arweave/node')
const fs = require('fs')

// init Arweave js
const arweave = Arweave.init({
  host: 'arweave.net',
  protocol: 'https',
  port: 443
})

// init wallet
const walletPath = process.env.WALLET_PATH

if (!walletPath) {
  console.log('ERROR: Please specify a wallet file to load using argument ' +
          "'--wallet-file <PATH>'.")
  process.exit()
}

const rawWallet = fs.readFileSync(walletPath)
const wallet = JSON.parse(rawWallet)

module.exports = {
  arweave,
  wallet
}
