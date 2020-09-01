const { wallet, arweave } = require('../utils')
const { validationResult } = require('express-validator')
const dispatchTx = require('../dispatchTx')

async function uploadImage (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.')
  }

  if (!req.files.image) {
    return res.status(400).send('Must upload file with name `image`')
  }

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() })
    return
  }

  const { data, mimetype } = req.files.image

  const imgTx = await arweave.createTransaction({ data }, wallet)
  imgTx.addTag('App-Name', 'Outpost-Image')
  imgTx.addTag('Content-Type', mimetype)
  imgTx.addTag('DID', req.body.did)

  const postRes = await dispatchTx(imgTx)

  res.send({
    status: postRes.status,
    tx: imgTx
  })
}

module.exports = uploadImage
