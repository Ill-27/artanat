document.addEventListener('DOMContentLoaded', function() {
  // 1. Инициализация сцены
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 20;
  
  const renderer = new THREE.WebGLRenderer({ 
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Создаем контейнер для водяных знаков
  const watermarkContainer = document.createElement('div');
  watermarkContainer.id = 'watermark-container';
  document.body.appendChild(watermarkContainer);
  watermarkContainer.appendChild(renderer.domElement);

  // 2. Параметры водяных знаков
  const watermarkConfig = {
    columns: 12,
    rows: 8,
    baseSize: 0.15,
    speed: 0.01,
    drift: 0.03,
    opacity: 0.6,
    colors: [new THREE.Color(1, 1, 1)], // Белый цвет
    updateInterval: 50
  };

  // 3. Класс водяного знака (остальной код без изменений)
  class SeamlessWatermark {
    constructor(font) {
      this.font = font;
      this.meshes = [];
      this.timeElements = [];
      this.lastUpdate = 0;
      this.initSeamlessGrid();
      this.setupProtection();
    }
    
    initSeamlessGrid() {
      const texts = [
        'Artanat', 'artanat.ru', 
        this.generateId(),
        'v.2.1.6.25'
      ];
      
      const columnWidth = 80 / watermarkConfig.columns;
      const rowHeight = 60 / watermarkConfig.rows;
      
      for (let col = 0; col < watermarkConfig.columns; col++) {
        for (let row = 0; row < watermarkConfig.rows * 1.5; row++) {
          const isTime = (col % 3 === 0 && row % 5 === 0);
          const text = isTime ? this.getCurrentTime() : 
                     texts[Math.floor(Math.random() * texts.length)];
          
          this.createWatermark(
            text,
            -40 + col * columnWidth + (Math.random() - 0.5) * columnWidth * 0.8,
            30 - row * rowHeight * 0.6 + (Math.random() - 0.5) * rowHeight * 0.4,
            isTime
          );
        }
      }
    }
    
    createWatermark(text, x, y, isTime) {
      const size = watermarkConfig.baseSize * (0.8 + Math.random() * 0.5);
      const color = watermarkConfig.colors[
        Math.floor(Math.random() * watermarkConfig.colors.length)
      ].clone();
      
      const geometry = new THREE.TextGeometry(text, {
        font: this.font,
        size: size,
        height: 0.01,
        curveSegments: 4
      });
      
      this.addSubtleNoise(geometry);
      
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: watermarkConfig.opacity * (0.9 + Math.random() * 0.2),
        blending: THREE.NormalBlending
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.set(x, y, (Math.random() - 0.5) * 20);
      
      mesh.userData = {
        speed: watermarkConfig.speed * (0.8 + Math.random() * 0.4),
        drift: watermarkConfig.drift * (0.5 + Math.random()),
        phase: Math.random() * Math.PI * 2,
        isTime: isTime,
        originalText: text,
        color: color,
        size: size,
        initialY: y
      };
      
      scene.add(mesh);
      this.meshes.push(mesh);
      if (isTime) this.timeElements.push(mesh);
    }
    
    addSubtleNoise(geometry) {
      const position = geometry.attributes.position;
      const noiseIntensity = 0.03;
      
      for (let i = 0; i < position.count; i++) {
        position.setZ(i, (Math.random() - 0.5) * noiseIntensity);
      }
      position.needsUpdate = true;
    }
    
    update(deltaTime) {
      if (deltaTime - this.lastUpdate > watermarkConfig.updateInterval) {
        const timeStr = this.getCurrentTime();
        this.timeElements.forEach(mesh => {
          this.updateText(mesh, timeStr);
        });
        this.lastUpdate = deltaTime;
      }
      
      this.meshes.forEach(mesh => {
        this.animateWatermark(mesh, deltaTime);
      });
    }
    
    updateText(mesh, newText) {
      mesh.geometry.dispose();
      mesh.geometry = new THREE.TextGeometry(newText, {
        font: this.font,
        size: mesh.userData.size,
        height: 0.01,
        curveSegments: 4
      });
      this.addSubtleNoise(mesh.geometry);
      mesh.userData.originalText = newText;
    }
    
    animateWatermark(mesh, time) {
      const ud = mesh.userData;
      
      mesh.position.y -= ud.speed;
      mesh.position.x += Math.cos(time * 0.001 + ud.phase) * ud.drift * 0.3;
      
      if (mesh.position.y < -30) {
        mesh.position.y = 30;
        mesh.position.x = ud.initialY + (Math.random() - 0.5) * 5;
      }
      
      mesh.material.opacity = watermarkConfig.opacity * 
        (0.9 + Math.sin(time * 0.003 + ud.phase) * 0.1);
      
      if (Math.random() > 0.98) {
        mesh.material.color.offsetHSL(0, (Math.random() - 0.5) * 0.05, 0);
      }
    }
    
    getCurrentTime() {
      const now = new Date();
      return now.toLocaleTimeString('ru-RU', { hour12: false });
    }
    
    generateId() {
      return 'ID-' + Array.from({length: 12}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('');
    }
    
    setupProtection() {
      setInterval(() => {
        if (!document.body.contains(renderer.domElement)) {
          document.body.prepend(renderer.domElement);
        }
      }, 1000);
      
      document.addEventListener('copy', (e) => {
        e.clipboardData.setData('text/plain', '© ARTANAT Protected Content');
        e.preventDefault();
      });
      
      document.body.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'PrintScreen' || e.key === 's')) {
          e.preventDefault();
        }
      });
    }
  }

  // 4. Загрузка шрифта и инициализация
  new THREE.FontLoader().load(
    'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/fonts/helvetiker_regular.typeface.json', 
    (font) => {
      const watermarkSystem = new SeamlessWatermark(font);
      
      let lastTime = 0;
      function animate(currentTime) {
        requestAnimationFrame(animate);
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        watermarkSystem.update(currentTime);
        renderer.render(scene, camera);
      }
      
      animate(0);
    }
  );

  // 5. Адаптивность
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
