// api/bg1.js
import { createHash } from 'crypto'

export default function handler(req, res) {
  // Проверяем реферера (откуда пришел запрос)
  const allowedDomains = ['https://arterrii.ru', 'https://arterrii.vercel.app']
  const referer = req.headers.referer || ''
  const isValidReferer = allowedDomains.some(domain => referer.startsWith(domain))
  
  if (!isValidReferer) {
    return res.status(403).json({ error: 'Access denied' })
  }

  // Генерируем динамический контент с хешем для дополнительной защиты
  const contentHash = createHash('sha256').update(Date.now().toString()).digest('hex')
  
  // Ваш HTML с WebGL (вот пример для bg1)
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ARTERII SECURE STARFIELD</title>
    <style>
        body { 
            margin: 0; 
            overflow: hidden; 
            background: transparent;
            touch-action: none;
            user-select: none;
            font-family: 'Fira Code', monospace;
        }
        canvas { 
            display: block; 
            width: 100vw; 
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
        }
        #watermark {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400&display=swap" rel="stylesheet">
</head>
<body>
    <canvas id="starfield"></canvas>
    <div id="watermark"></div>

    <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/loaders/FontLoader.js"></script>
    <script nonce="${contentHash}">
    // ================= ЗАЩИТА ================= //
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('copy', e => {
        e.clipboardData.setData('text/plain', '© ARTERRII Protected Content');
        e.preventDefault();
    });

    // ================= WEBGL STARFIELD ================= //
    const canvas = document.getElementById('starfield');
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: false });

    if (!gl) {
        document.body.innerHTML = '<h1 style="color:red">WebGL not supported</h1>';
        throw new Error('WebGL not supported');
    }

    // [Остальной код bg1.html остается без изменений]
    </script>
</body>
</html>
`

  // Устанавливаем заголовки безопасности
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
  
  res.status(200).send(htmlContent)
}
