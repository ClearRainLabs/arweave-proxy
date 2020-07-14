/*
    hooverd: A simple Arweave signing and dispatch server.

    After initilisation, a hooverd can be sent unsigned Arweave transactions
    which it will then prepare, sign, and dispatch to the network.

    Fields in the unsigned transaction can be ommited, making it extremely
    simple to integrate without needing an Arweave aware client to the server.
*/

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { arweave, wallet } = require('./utils')
const createCommunity = require('./routes/createCommunity')
const contractInteraction = require('./routes/contractInteraction')
const { validateCreate, validateInteraction } = require('./validators')

// const { isValidUpload } = require('clearrain')

// Set hooverd parameters.
const port = 1908

/**
async function handleRequest (req, res, next) {
  try {
    if (!isValidUpload(req.body)) {
      res.status(400).send({ error: 'Arweave Proxy Upload Service: Invalid transaction provided' })
      return
    }

    const tx = await arweave.createTransaction({ data: req.body.jwt }, wallet)

    const tags = req.body.tags

    Object.keys(tags).forEach(key => {
      tx.addTag(key, tags[key])
    })

    dispatchTX(tx, res)
  } catch (e) {
    console.log(e, 'THE ERROR')

    next(e)
  }
}

async function dispatchTX (tx, res) {
  // Manually set the transaction anchor, for now.
  const anchorId = await arweave.api.get('/tx_anchor').then(x => x.data)
  tx.last_tx = anchorId

  // Sign and dispatch the TX, forwarding the response code as our own.
  await arweave.transactions.sign(tx, wallet)
  const resp = await arweave.transactions.post(tx)

  const output = `Transaction ${tx.get('id')} dispatched to ` +
          `arweave.net with response: ${resp.status}.`
  console.log(output)

  res.status(resp.status).send(output)
}
*/

async function startServer () {
  console.log('Welcome to hooverd! 👋\n\nWe are...')

  // Print introductory information to the console.
  console.log(`...starting a server at http://localhost:${port}.`)

  const address = await arweave.wallets.jwkToAddress(wallet)
  const balance = arweave.ar.winstonToAr(await arweave.wallets.getBalance(address))
  console.log(`...using wallet ${address} (balance: ${balance} AR).`)

  const netInfo = await arweave.network.getInfo()
  console.log('...dispatching transactions to Arweave host,',
          `synchronised at block ${netInfo.height}.`)

  // Start the server itself.
  const app = express()
  app.use(cors())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))

  // app.post('/', handleRequest)
  app.post('/create-community', validateCreate(), createCommunity)
  app.post('/contract-interaction', validateInteraction(), contractInteraction)

  app.listen(port, (err) => {
    if (err) {
      return console.log('Server experienced error:', err)
    }

    console.log('...now ready to hoover data! 🚀🚀🚀\n')
  })
}

startServer()
