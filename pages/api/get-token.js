import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const ua = req.headers['user-agent'];
  const token = jwt.sign(
    { ip, ua },
    process.env.JWT_SECRET,
    { expiresIn: '30s' }
  );
  res.status(200).json({ token });
}
