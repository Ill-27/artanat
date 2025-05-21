// api/bg1.js

const jwt = require('jsonwebtoken')

const SECRET = 'твоя_секретная_строка'

module.exports = (req, res) => {
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '')

  try {
    jwt.verify(token, SECRET)
  } catch (err) {
    res.status(401).send('Unauthorized')
    return
  }

  // HTML-код фона (минифицированный)
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>bg1</title></head><body><script>/* твой WebGL код здесь */</script></body></html>`

  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).send(html)
}
