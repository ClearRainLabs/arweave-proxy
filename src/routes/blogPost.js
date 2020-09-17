const { validationResult } = require('express-validator')
const { wallet, arweave } = require('../utils')
const dispatchTx = require('../dispatchTx')
const showdown = require('showdown')
const crypto = require('crypto')

const converter = new showdown.Converter()

async function uploadPost (req, res) {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() })
      return
    }

    const { payload, did, communityTxId } = req.body

    payload.postData.postText = converter.makeHtml(payload.postData.postText.replace(/\\/g, '<br/>'))

    setFeaturedImage(payload)

    const encrypted = encryptUpload(JSON.stringify(payload))

    const postTx = await arweave.createTransaction({ data: encrypted }, wallet)
    postTx.addTag('App-Name', 'Outpost-Blog-Test-3')
    postTx.addTag('App-Version', '0.2.0')
    postTx.addTag('Community', communityTxId)
    postTx.addTag('DID', did)

    // TODO: keep trying post until it goes through
    const postRes = await dispatchTx(postTx)

    const txData = {
      ...payload,
      txId: postTx.id
    }

    res.send({
      status: postRes.status,
      tx: txData
    })
  } catch (e) {
    res.status(400).send({
      error: `Arweave Proxy Upload Service Error: ${e}`
    })
  }
}

const setFeaturedImage = (payload) => {
  const imgRegex = /<img[^>]+src="http([^">]+)/

  const featuredImg = payload.postData.postText.match(imgRegex)[0].split(/src="/)[1]
  payload.featuredImg = featuredImg

  console.log(payload.featuredImg, 'THE FEATURED IMAGE')
}

const encryptUpload = (uploadData) => {
  const ENCRYPTION_PHRASE = process.env.ENCRYPTION_PHRASE

  const key = crypto.createHash('sha256').update(ENCRYPTION_PHRASE).digest('base64').substr(0, 32)
  const resizedIV = Buffer.allocUnsafe(16)

  const iv = crypto
    .createHash('sha256')
    .update('myHashedIV') // TODO: random iv that is shared with server and whoever else may access it
    .digest()

  iv.copy(resizedIV)

  const cipher = crypto.createCipheriv('aes256', key, resizedIV)

  let encrypted = cipher.update(uploadData, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  return encrypted
}

module.exports = uploadPost
