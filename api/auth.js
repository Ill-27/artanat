const { generateToken } = require('./_auth');

module.exports = (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ua = req.headers['user-agent'] || '';
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.send(generateToken(ip, ua));
  } catch (error) {
    res.status(500).send('Auth error');
  }
};
