const jwt = require('jsonwebtoken')
const SECRET = 'ArTERRII_3D-ProT3ct!on_Key_89d2@r0Wz'

module.exports = (req, res) => {
  const token = jwt.sign({ access: 'ok' }, SECRET, { expiresIn: '5m' })

  res.setHeader('Content-Type', 'application/json')
  res.status(200).send(JSON.stringify({ token }))
}
