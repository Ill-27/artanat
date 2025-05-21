// api/generate-token/index.js
import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  const secret = process.env.JWT_SECRET;
  const token = jwt.sign(
    { 
      exp: Math.floor(Date.now() / 1000) + (60 * 5), // 5 минут жизни
      origin: req.headers.origin 
    }, 
    secret
  );
  
  res.status(200).json({ token });
}
