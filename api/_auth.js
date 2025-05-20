const { createHmac } = require('crypto');

// Генерация ключа на основе времени развёртывания
const SECRET_KEY = createHmac('sha256', process.env.VERCEL_GIT_COMMIT_SHA || Date.now().toString())
                  .update(process.env.JWT_SECRET || 'default-arterrii-secret')
                  .digest('hex');

module.exports = {
  generateToken: () => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = { exp: Math.floor(Date.now() / 1000) + 300 }; // 5 мин
    
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', SECRET_KEY)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  },

  validateToken: (token) => {
    try {
      const [header, payload, signature] = token.split('.');
      const checkSig = createHmac('sha256', SECRET_KEY)
        .update(`${header}.${payload}`)
        .digest('base64url');
      
      return signature === checkSig;
    } catch {
      return false;
    }
  }
};
