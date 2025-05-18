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

        const
