// pages/api/fon.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'protected', 'bg1.html');
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(content);
  } catch (err) {
    res.status(500).send('Not found');
  }
}
