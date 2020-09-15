const { validationResult } = require('express-validator')
const { wallet, arweave } = require('../utils')
const dispatchTx = require('../dispatchTx')
const showdown = require('showdown')

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

    const postTx = await arweave.createTransaction({ data: JSON.stringify(payload) }, wallet)
    postTx.addTag('App-Name', 'Outpost-Blog-Test-1')
    postTx.addTag('App-Version', '0.2.0')
    postTx.addTag('Community', communityTxId)
    postTx.addTag('DID', did)

    // TODO: keep trying post until it goes through
    const postRes = await dispatchTx(postTx)

    res.send({
      status: postRes.status,
      tx: postTx
    })
  } catch (e) {
    res.status(400).send({
      error: `Arweave Proxy Upload Service Error: ${e}`
    })
  }
}

module.exports = uploadPost
