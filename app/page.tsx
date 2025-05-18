'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function Home() {
  useEffect(() => {
    // === Защита от встраивания в iframe ===
    if (window !== window.top) {
      const allowedDomains = ['arterrii.ru', 'arterrii.vercel.app'];
      const referrer = document.referrer ? new URL(document.referrer).hostname : '';
      
      if (!allowedDomains.some(domain => referrer.includes(domain))) {
        window.top.location.href = window.location.href;
      }
    } else {
      if (window.location !== window.parent.location) {
        window.parent.location = window.location;
      }
    }

    // === Защита от DevTools ===
    function detectDevTools() {
      const devtools = /./;
      devtools.toString = function() {
        document.body.innerHTML = '<h1 style="color:white;text-align:center;padding-top:20%">Доступ запрещен</h1>';
        window.location.href = "about:blank";
        return '';
      };
      console.log('%c', devtools);
    }
    
    setInterval(detectDevTools, 1000);
    window.addEventListener('resize', function() {
      if(window.outerWidth - window.innerWidth > 100 || window.outerHeight - window.innerHeight > 100) {
        document.body.innerHTML = '<h1 style="color:white;text-align:center;padding-top:20%">Доступ запрещен</h1>';
        window.location.href = "about:blank";
      }
    });

    // === Запрет кэширования ===
    window.addEventListener('pageshow', function(event) {
      if (event.persisted) {
        window.location.reload();
      }
    });

    // Основной код Three.js
    const initThreeJS = () => {
      const THREE = (window as any).THREE;

      // Инициализация сцены, камеры и рендерера для логотипа
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        canvas: document.getElementById('logo-canvas'),
        alpha: true
      });
      renderer.setSize(210, 210);
      renderer.setPixelRatio(window.devicePixelRatio);

      camera.position.z = 8;

      const colors = [
        '#7F00FF', '#0000FF', '#00BFFF', 
        '#00FF80', '#FFFF00', '#FF6000', '#FF0000'
      ];

      let centerBall: any;
      let logoGroup: any;
      let smallBalls: any[] = [];
      let textMaterial: any;
      let isCursorActive = false;
      let whiteOverlayActive = false;
      let touchTimer: NodeJS.Timeout | null = null;
      const touchDuration = 500;

      const fontLoader = new THREE.FontLoader();
      fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.132.2/examples/fonts/helvetiker_regular.typeface.json', (font) => {
        createLogo(font);
      });

      function createLogo(font: any) {
        const textHeight = 0.5;
        const textSize = 0.2;
        const textParams = {
          font: font,
          size: textSize,
          height: textHeight,
          curveSegments: 12,
          bevelEnabled: false
        };

        textMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          emissive: 0xffffff,
          emissiveIntensity: 1,
          shininess: 100,
          transparent: true,
          opacity: 0.9
        });

        function create3DText(char: string, isUpsideDown = false) {
          const textGeo = new THREE.TextGeometry(char, textParams);
          textGeo.computeBoundingBox();
          const textMesh = new THREE.Mesh(textGeo, textMaterial);
          
          if (isUpsideDown) {
            textMesh.rotation.z = Math.PI;
          }
          
          return textMesh;
        }

        const radius = 2;
        logoGroup = new THREE.Group();

        const letters = [
          { char: 'A', angle: 0 },
          { char: 'T', angle: Math.PI / 2 },
          { char: 'A', angle: Math.PI, isUpsideDown: true },
          { char: 'T', angle: Math.PI * 1.5, isUpsideDown: true }
        ];

        letters.forEach((letter) => {
          const text = create3DText(letter.char, letter.isUpsideDown);
          text.position.set(
            Math.cos(letter.angle) * radius,
            Math.sin(letter.angle) * radius,
            0
          );
          text.rotation.z = letter.angle + Math.PI / 2;
          logoGroup.add(text);
        });

        scene.add(logoGroup);

        const centerBallGeometry = new THREE.SphereGeometry(0.7, 32, 32);
        const centerBallMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          emissive: 0xffffff,
          emissiveIntensity: 2,
          shininess: 100,
          transparent: true,
          opacity: 0.95
        });
        centerBall = new THREE.Mesh(centerBallGeometry, centerBallMaterial);
        scene.add(centerBall);

        const ballGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        
        colors.forEach((color, i) => {
          const ballMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(color),
            emissive: new THREE.Color(color),
            emissiveIntensity: 1.5,
            shininess: 50,
            transparent: true,
            opacity: 0.9
          });
          const ball = new THREE.Mesh(ballGeometry, ballMaterial);
          
          const angle = (i / colors.length) * Math.PI * 2;
          const distance = 4.5;
          ball.position.set(
            Math.cos(angle) * distance,
            Math.sin(angle) * distance,
            0
          );
          
          smallBalls.push(ball);
          scene.add(ball);
        });

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 2, 10);
        pointLight.position.set(0, 0, 2);
        scene.add(pointLight);

        const cursorRenderer = new THREE.WebGLRenderer({ 
          antialias: true,
          canvas: document.getElementById('cursor-canvas'),
          alpha: true
        });
        cursorRenderer.setSize(40, 40);
        cursorRenderer.setPixelRatio(window.devicePixelRatio);

        const cursorScene = new THREE.Scene();
        const cursorCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        cursorCamera.position.z = 8;

        function toggleWhiteOverlay() {
          whiteOverlayActive = !whiteOverlayActive;
          const overlay = document.getElementById('white-overlay');
          if (overlay) {
            overlay.style.display = whiteOverlayActive ? 'block' : 'none';
          }
        }

        document.addEventListener('mousemove', (e) => {
          if (!isCursorActive) {
            scene.remove(centerBall);
            isCursorActive = true;
            const cursorContainer = document.getElementById('cursor-container');
            if (cursorContainer) cursorContainer.style.display = 'block';
          }
          
          const cursorContainer = document.getElementById('cursor-container');
          if (cursorContainer) {
            cursorContainer.style.left = e.clientX + 'px';
            cursorContainer.style.top = e.clientY + 'px';
          }
          
          cursorScene.children = [];
          cursorScene.add(centerBall);
          cursorRenderer.render(cursorScene, cursorCamera);
        });

        document.addEventListener('mouseout', () => {
          if (isCursorActive) {
            cursorScene.remove(centerBall);
            scene.add(centerBall);
            isCursorActive = false;
            const cursorContainer = document.getElementById('cursor-container');
            if (cursorContainer) cursorContainer.style.display = 'none';
          }
        });

        document.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          toggleWhiteOverlay();
        });

        document.addEventListener('touchstart', (e) => {
          if (!isCursorActive) {
            scene.remove(centerBall);
            isCursorActive = true;
            const cursorContainer = document.getElementById('cursor-container');
            if (cursorContainer) cursorContainer.style.display = 'block';
          }
          
          touchTimer = setTimeout(() => {
            toggleWhiteOverlay();
          }, touchDuration);
          
          const touch = e.touches[0];
          const cursorContainer = document.getElementById('cursor-container');
          if (cursorContainer) {
            cursorContainer.style.left = touch.clientX + 'px';
            cursorContainer.style.top = touch.clientY + 'px';
          }
          
          cursorScene.children = [];
          cursorScene.add(centerBall);
          cursorRenderer.render(cursorScene, cursorCamera);
        });

        document.addEventListener('touchmove', (e) => {
          e.preventDefault();
          if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
          }
          
          const touch = e.touches[0];
          const cursorContainer = document.getElementById('cursor-container');
          if (cursorContainer) {
            cursorContainer.style.left = touch.clientX + 'px';
            cursorContainer.style.top = touch.clientY + 'px';
          }
          
          cursorScene.children = [];
          cursorScene.add(centerBall);
          cursorRenderer.render(cursorScene, cursorCamera);
        }, { passive: false });

        document.addEventListener('touchend', () => {
          if (isCursorActive) {
            cursorScene.remove(centerBall);
            scene.add(centerBall);
            isCursorActive = false;
            const cursorContainer = document.getElementById('cursor-container');
            if (cursorContainer) cursorContainer.style.display = 'none';
          }
          
          if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
          }
        });

        function animate() {
          requestAnimationFrame(animate);
          
          logoGroup.rotation.z += 0.005;
          
          if (!isCursorActive) {
            const pulse = 1 + Math.sin(Date.now() * 0.001) * 0.15;
            centerBall.scale.setScalar(pulse);
            centerBall.material.emissiveIntensity = 1 + Math.sin(Date.now() * 0.001) * 1;
          }
          
          textMaterial.emissiveIntensity = 0.8 + Math.sin(Date.now() * 0.0015) * 0.5;
          
          smallBalls.forEach((ball, i) => {
            const ballPulse = 0.8 + Math.sin(Date.now() * 0.001 + i) * 0.3;
            ball.scale.setScalar(ballPulse);
            ball.material.emissiveIntensity = 1 + Math.sin(Date.now() * 0.001 + i * 2) * 0.8;
            
            const angle = (i / colors.length) * Math.PI * 2 + Date.now() * 0.0007;
            const distance = 4.5 + Math.sin(Date.now() * 0.001 + i) * 0.4;
            ball.position.set(
              Math.cos(angle) * distance,
              Math.sin(angle) * distance,
              0
            );
          });
          
          renderer.render(scene, camera);
          
          if (isCursorActive) {
            const pulse = 1 + Math.sin(Date.now() * 0.001) * 0.15;
            centerBall.scale.setScalar(pulse);
            centerBall.material.emissiveIntensity = 1 + Math.sin(Date.now() * 0.001) * 1;
            cursorRenderer.render(cursorScene, cursorCamera);
          }
        }
        
        animate();
      }

      const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            console.error(`Ошибка при включении полноэкранного режима: ${err.message}`);
          });
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      };

      const telegramLink = document.getElementById('telegram-link');
      if (telegramLink) {
        telegramLink.addEventListener('click', () => {
          window.open('https://t.me/arterrii_ru', '_blank');
        });
      }

      const fullscreenToggle = document.getElementById('fullscreen-toggle');
      if (fullscreenToggle) {
        fullscreenToggle.addEventListener('click', toggleFullscreen);
      }

      document.addEventListener('fullscreenchange', () => {
        const btn = document.getElementById('fullscreen-toggle');
        if (btn) {
          btn.textContent = document.fullscreenElement ? '↖️' : '↘️';
          document.body.style.background = document.fullscreenElement ? '#000' : '';
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.fullscreenElement) {
          e.preventDefault();
        }
      });
    };

    // Загружаем Three.js и его зависимости
    const loadScripts = () => {
      if (!window.THREE) {
        const threeScript = document.createElement('script');
        threeScript.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js';
        threeScript.onload = () => {
          const fontLoaderScript = document.createElement('script');
          fontLoaderScript.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/loaders/FontLoader.js';
          
          const textGeometryScript = document.createElement('script');
          textGeometryScript.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/geometries/TextGeometry.js';
          textGeometryScript.onload = initThreeJS;
          
          document.body.appendChild(fontLoaderScript);
          document.body.appendChild(textGeometryScript);
        };
        document.body.appendChild(threeScript);
      } else {
        initThreeJS();
      }
    };

    loadScripts();
  }, []);

  return (
    <>
      <iframe id="background1" className="background-frame" src="/your_first_webgl_background.html"></iframe>
      <iframe id="background2" className="background-frame" src="/your_second_webgl_background.html"></iframe>
      
      <div id="white-overlay"></div>
      <div id="logo-container">
        <canvas id="logo-canvas"></canvas>
      </div>
      <div id="cursor-container">
        <canvas id="cursor-canvas"></canvas>
      </div>

      <div id="arterii-license">
        <div>© 2025 ARTERRII. Все права защищены</div>
        <div>Это цифровой арт-музей. Только для просмотра</div>
        <div>Копирование и использование запрещено</div>
      </div>

      <span className="telegram-btn" id="telegram-link" title="Telegram"></span>
      <span className="fullscreen-btn" id="fullscreen-toggle">↘</span>
    </>
  )
}
