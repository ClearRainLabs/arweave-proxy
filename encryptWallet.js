require('dotenv').config()
const crypto = require('crypto')
const fs = require('fs')

const password = process.env.SECRET_PASSWORD

const algorithm = 'aes-192-cbc'
const key = crypto.scryptSync(password, 'salt', 24)
const iv = Buffer.alloc(16)

const cipher = crypto.createCipheriv(algorithm, key, iv)

const input = fs.createReadStream(process.env.WALLET_PATH)
const output = fs.createWriteStream('./wallet.sec')

input.pipe(cipher).pipe(output)
