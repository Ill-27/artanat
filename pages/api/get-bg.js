import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { token, name } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    if (decoded.ip !== userIp || decoded.ua !== userAgent) {
      return res.status(403).send('Invalid token environment');
    }

    const filePath = path.join(process.cwd(), 'protected', `${name}.html`);
    const content = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(content);
  } catch (err) {
    res.status(403).send('Invalid or expired token');
  }
}
