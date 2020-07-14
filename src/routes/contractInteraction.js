const { validationResult } = require('express-validator')
const { interactWrite } = require('smartweave')
const { wallet, arweave } = require('../utils')

const CONTRACT_ID = process.env.CONTRACT_ID

async function contractInteraction (req, res) {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() })
      return
    }

    const { jwt } = req.body

    // test the interaction

    const tx = await interactWrite(arweave, wallet, CONTRACT_ID, jwt)

    res.send(tx)
  } catch (e) {
    res.status(400).send({
      error: `Arweave Proxy Upload Service Error: ${e}`
    })
  }
}

module.exports = contractInteraction
