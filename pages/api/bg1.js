 import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  const auth = req.headers.authorization;

  // Проверка токена (любой кастомный токен, можно JWT, но начнем проще)
  if (auth !== `Bearer ${process.env.BG1_TOKEN}`) {
    return res.status(403).send('Access denied');
  }

  const filePath = path.join(process.cwd(), 'private/bg1.html');

  try {
    const html = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (err) {
    res.status(500).send('Failed to read bg1.html');
  }
}
