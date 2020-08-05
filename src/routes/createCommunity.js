const { validationResult } = require('express-validator')
const { createContractFromTx } = require('smartweave')
const { wallet, arweave } = require('../utils')
const { CONTRACT_SRC } = require('outpost-protocol')

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

    console.log(`Created a community at ${txId}`)

    res.send(txId)
  } catch (e) {
    res.status(400).send({
      error: `Arweave Proxy Upload Service Error: ${e}`
    })
  }
}

function createInitState (did, name, isOpen) {
  const initState = {
    name,
    isOpen,
    owner: did,
    admins: {},
    moderators: {},
    members: {},
    children: {},
    nonces: {}
  }

  initState.admins[did] = true
  initState.moderators[did] = true
  initState.members[did] = true

  return initState
}

module.exports = createCommunity
