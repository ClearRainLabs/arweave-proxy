const { validationResult } = require('express-validator')
const { interactWrite } = require('smartweave')
const { wallet, arweave } = require('../utils')

async function contractInteraction (req, res) {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() })
      return
    }

    const { jwt, communityTxId } = req.body

    // make sure the db holds the contract Id
    // test the interaction

    const txId = await interactWrite(arweave, wallet, communityTxId, jwt)

    console.log(`Interacted with contract ${communityTxId} at tx ${txId}`)

    res.send(txId)
  } catch (e) {
    res.status(400).send({
      error: `Arweave Proxy Upload Service Error: ${e}`
    })
  }
}

module.exports = contractInteraction
