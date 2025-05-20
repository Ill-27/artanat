const { generateToken } = require('./_auth');

module.exports = (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.connection.remoteAddress;
    const ua = req.headers['user-agent'] || '';
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    res.send(generateToken(ip, ua));
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).send('Auth error');
  }
};
