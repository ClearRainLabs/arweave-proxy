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
const fileUpload = require('express-fileupload')
const { arweave, wallet } = require('./utils')
const createCommunity = require('./routes/createCommunity')
const contractInteraction = require('./routes/contractInteraction')
const uploadPost = require('./routes/blogPost')
const uploadImage = require('./routes/imageUpload')
const { validateCreate, validateInteraction, validateBlogPost } = require('./validators')

const port = process.env.PORT

async function startServer () {
  console.log('Welcome to the Arweave Upload Service! 👋\n\nWe are...')

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
  app.use(fileUpload())

  // app.post('/', handleRequest)
  app.post('/create-community', validateCreate(), createCommunity)
  app.post('/contract-interaction', validateInteraction(), contractInteraction)
  app.post('/blog-post', validateBlogPost(), uploadPost)
  app.post('/image-upload', uploadImage)

  app.listen(port, (err) => {
    if (err) {
      return console.log('Server experienced error:', err)
    }

    console.log('...now ready to hoover data! 🚀🚀🚀\n')
  })
}

startServer()
