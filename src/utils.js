const Arweave = require('arweave/node')

// init Arweave js
const arweave = Arweave.init({
  host: 'arweave.net',
  protocol: 'https',
  port: 443
})

const rawWallet = process.env.RAW_WALLET

if (!rawWallet) {
  console.log('ERROR: Please specify a wallet file to load using argument ' +
          "'--wallet-file <PATH>'.")
  process.exit()
}

const wallet = JSON.parse(rawWallet)

module.exports = {
  arweave,
  wallet
}
