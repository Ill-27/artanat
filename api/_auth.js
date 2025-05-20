const { createHmac } = require('crypto');

// Используем фиксированный секрет для стабильности работы
const SECRET_KEY = process.env.JWT_SECRET || 'arterrii-pro-max-secure-key';
const TOKEN_LIFETIME = 5 * 60 * 1000; // 5 минут

function generateToken(ip, ua) {
  const header = { alg: 'HS256', typ: 'JWT', ver: 2 };
  const payload = {
    ip: createHmac('sha256', SECRET_KEY).update(ip).digest('hex'),
    ua: createHmac('sha256', SECRET_KEY).update(ua).digest('hex'),
    exp: Date.now() + TOKEN_LIFETIME,
    iss: 'arterrii-protected-content'
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', SECRET_KEY)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function validateToken(token, ip, ua) {
  if (!token) return false;
  
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !signature) return false;

    const checkSig = createHmac('sha256', SECRET_KEY)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (signature !== checkSig) return false;

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    if (!payload || payload.exp < Date.now()) return false;

    const ipHash = createHmac('sha256', SECRET_KEY).update(ip).digest('hex');
    const uaHash = createHmac('sha256', SECRET_KEY).update(ua).digest('hex');
    
    return payload.ip === ipHash && payload.ua === uaHash;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

module.exports = { generateToken, validateToken, SECRET_KEY };
