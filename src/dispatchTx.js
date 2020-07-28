const { wallet, arweave } = require('./utils')

async function dispatchTx (tx) {
  const anchorId = await arweave.api.get('/tx_anchor').then(x => x.data)
  tx.last_tx = anchorId

  // Sign and dispatch the TX, forwarding the response code as our own.
  await arweave.transactions.sign(tx, wallet)

  const resp = await arweave.transactions.post(tx)

  const output = `Transaction ${tx.get('id')} dispatched to ` +
                  `arweave.net with response: ${resp.status}.`
  console.log(output)

  return resp
}

module.exports = dispatchTx
