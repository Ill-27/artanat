const jwt = require('jsonwebtoken')
const SECRET = 'твоя_секретная_строка'

module.exports = (req, res) => {
  const token = jwt.sign({ access: 'ok' }, SECRET, { expiresIn: '5m' })

  res.setHeader('Content-Type', 'application/json')
  res.status(200).send(JSON.stringify({ token }))
}
