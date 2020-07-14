const { validationResult } = require('express-validator')
const { createContractFromTx } = require('smartweave')
const { wallet, arweave } = require('../utils')

const CONTRACT_SRC = process.env.CONTRACT_SRC

async function createCommunity (req, res) {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() })
      return
    }

    const { did, name, isOpen } = req.body

    const initState = createInitState(did, name, isOpen)

    const txId = await createContractFromTx(arweave, wallet, CONTRACT_SRC, JSON.stringify(initState))

    res.send(txId)
  } catch (e) {
    res.status(400).send({
      error: `Arweave Proxy Upload Service Error: ${e}`
    })
  }
}

function createInitState (did, name, isOpen) {
  return {
    name,
    isOpen,
    owner: did,
    admins: { did: true },
    moderators: {},
    members: {},
    children: {},
    nonces: {}
  }
}

module.exports = createCommunity
