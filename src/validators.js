const { body } = require('express-validator')

exports.validateCreate = () => {
  return [
    body('did', 'key \'did\' does not exist or is invalid').exists().contains('did:3:'),
    body('name', 'key \'name\' does not exist').exists(),
    body('isOpen', 'key \'isOpen\' does not exist').exists().isBoolean()
  ]
}

exports.validateInteraction = () => {
  return [
    body('jwt', 'key \'jwt\' is invalid or does not exist').exists().isJWT(),
    body('contractId', 'key \'contractId\' is invalid or does not exist').exists()
  ]
}