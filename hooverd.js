/*
    hooverd: A simple Arweave signing and dispatch server.

    After initilisation, a hooverd can be sent unsigned Arweave transactions
    which it will then prepare, sign, and dispatch to the network.

    Fields in the unsigned transaction can be ommited, making it extremely
    simple to integrate without needing an Arweave aware client to the server.
*/

// Include dependencies.
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const Arweave = require('arweave/node')
const argv = require('yargs').argv
const { createComSchema } = require('./schemas')

async function start () {
  // Set Arweave parameters from commandline or defaults.
  const arweave_port = argv.arweavePort ? argv.arweavePort : 443
  const arweave_host = argv.arweaveHost ? argv.arweaveHost : 'arweave.net'
  const arweave_protocol = argv.arweaveProtocol ? argv.arweaveProtocol : 'https'

  // Set hooverd parameters.
  const port = argv.port ? argv.port : 1908

  const walletPath = process.env.WALLET_PATH || argv.walletFile

  if(!walletPath) {
      console.log("ERROR: Please specify a wallet file to load using argument " +
          "'--wallet-file <PATH>'.")
      process.exit()
  }

  const raw_wallet = fs.readFileSync(walletPath);
  const wallet = JSON.parse(raw_wallet);

  const arweave = Arweave.init({
      host: arweave_host, // Hostname or IP address for a Arweave node
      port: arweave_port,
      protocol: arweave_protocol
  })

  async function handleRequest(req, res) {
      try {
            const value = createComSchema.validate(req.body)

            if (value.error) throw new Error(value.error)

            let tx = await arweave.createTransaction({ data: JSON.stringify(req.body.data) }, wallet)

            const tags = req.body.tags

            Object.keys(tags).forEach(key => {
                tx.addTag(key, tags[key])
            })

            console.log(req.body, 'TX LOOKS GOOD')

            // dispatchTX(tx, res)
      } catch (e) {
        console.log(e, 'THE ERROR')
        res.status(400).send(e)
      }
  }

  async function dispatchTX(tx, res) {
      // Manually set the transaction anchor, for now.
      const anchor_id = await arweave.api.get('/tx_anchor').then(x => x.data)
      tx.last_tx = anchor_id

      // Sign and dispatch the TX, forwarding the response code as our own.
      await arweave.transactions.sign(tx, wallet)
      let resp = await arweave.transactions.post(tx);

      let output = `Transaction ${tx.get('id')} dispatched to ` +
          `${arweave_host}:${arweave_port} with response: ${resp.status}.`
      console.log(output)

      res.status(resp.status).send(output)
  }

  async function startServer() {
      console.log("Welcome to hooverd! 👋\n\nWe are...")

      // Print introductory information to the console.
      console.log(`...starting a server at http://localhost:${port}.`)

      const address = await arweave.wallets.jwkToAddress(wallet)
      let balance = arweave.ar.winstonToAr(await arweave.wallets.getBalance(address))
      console.log(`...using wallet ${address} (balance: ${balance} AR).`)

      let net_info = await arweave.network.getInfo()
      console.log("...dispatching transactions to Arweave host at",
          `${arweave_host}:${arweave_port},`,
          `synchronised at block ${net_info.height}.`)

      // Start the server itself.
      const app = express()
      app.use(cors())
      app.use(bodyParser.json())
      app.use(bodyParser.urlencoded({
          extended: true
      }))

      app.post('/', handleRequest)

      app.listen(port, (err) => {
          if (err) {
              return console.log('Server experienced error:', err)
          }

          console.log("...now ready to hoover data! 🚀🚀🚀\n")
      })

  }

  startServer()
}

start()
