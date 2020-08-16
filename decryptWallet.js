require('dotenv').config()
const crypto = require('crypto')
const fs = require('fs')

const password = process.env.SECRET_PASSWORD

const algorithm = 'aes-192-cbc'
const key = crypto.scryptSync(password, 'salt', 24)
const iv = Buffer.alloc(16)

const decipher = crypto.createDecipheriv(algorithm, key, iv)
const encrypted = fs.readFileSync('./wallet.sec')

let decrypted = decipher.update(encrypted, 'hex', 'utf8')
decrypted += decipher.final('utf8')
console.log(decrypted)
