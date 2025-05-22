class LogoAnimation {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.renderer = null;
        this.colors = ['#7F00FF', '#0000FF', '#00BFFF', '#00FF80', '#FFFF00', '#FF6000', '#FF0000'];
        this.centerBall = null;
        this.logoGroup = null;
        this.smallBalls = [];
        this.textMaterial = null;
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            canvas: document.getElementById('logo-canvas'),
            alpha: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(140, 140);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.camera.position.z = 8;

        const fontLoader = new THREE.FontLoader();
        fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.132.2/examples/fonts/helvetiker_regular.typeface.json', 
            (font) => this.createLogo(font),
            (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
            (err) => console.error('Error loading font:', err)
        );
    }

    createLogo(font) {
        // Создание 3D-текста
        this.textMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 1,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });

        this.logoGroup = new THREE.Group();
        ['A', 'T', 'A', 'T'].forEach((char, i) => {
            const textGeo = new THREE.TextGeometry(char, {
                font: font,
                size: 0.2,
                height: 0.5,
                curveSegments: 12,
                bevelEnabled: false
            });
            const textMesh = new THREE.Mesh(textGeo, this.textMaterial);
            const angle = (i / 4) * Math.PI * 2;
            textMesh.position.set(Math.cos(angle) * 2, Math.sin(angle) * 2, 0);
            textMesh.rotation.z = angle + Math.PI / 2;
            if (i >= 2) textMesh.rotation.z += Math.PI;
            this.logoGroup.add(textMesh);
        });
        this.scene.add(this.logoGroup);

        // Центральный шар
        this.centerBall = new THREE.Mesh(
            new THREE.SphereGeometry(0.7, 32, 32),
            new THREE.MeshPhongMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 2,
                shininess: 100,
                transparent: true,
                opacity: 0.95
            })
        );
        this.scene.add(this.centerBall);

        // Маленькие шары
        this.colors.forEach((color, i) => {
            const ball = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 16, 16),
                new THREE.MeshPhongMaterial({
                    color: new THREE.Color(color),
                    emissive: new THREE.Color(color),
                    emissiveIntensity: 1.5,
                    shininess: 50,
                    transparent: true,
                    opacity: 0.9
                })
            );
            const angle = (i / this.colors.length) * Math.PI * 2;
            ball.position.set(Math.cos(angle) * 4.5, Math.sin(angle) * 4.5, 0);
            this.smallBalls.push(ball);
            this.scene.add(ball);
        });

        // Освещение
        this.scene.add(new THREE.AmbientLight(0x404040));
        const pointLight = new THREE.PointLight(0xffffff, 2, 10);
        pointLight.position.set(0, 0, 2);
        this.scene.add(pointLight);

        this.animate();
    }

    animate() {
        if (document.hidden) return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        this.logoGroup.rotation.z += 0.005;
        
        const time = Date.now() * 0.001;
        const pulse = 1 + Math.sin(time) * 0.15;
        this.centerBall.scale.setScalar(pulse);
        this.centerBall.material.emissiveIntensity = 1 + Math.sin(time) * 1;
        this.textMaterial.emissiveIntensity = 0.8 + Math.sin(time * 1.5) * 0.5;
        
        this.smallBalls.forEach((ball, i) => {
            const ballPulse = 0.8 + Math.sin(time + i) * 0.3;
            ball.scale.setScalar(ballPulse);
            ball.material.emissiveIntensity = 1 + Math.sin(time + i * 2) * 0.8;
            const angle = (i / this.colors.length) * Math.PI * 2 + time * 0.7;
            ball.position.set(
                Math.cos(angle) * (4.5 + Math.sin(time + i) * 0.4),
                Math.sin(angle) * (4.5 + Math.sin(time + i) * 0.4),
                0
            );
        });
        
        this.renderer.render(this.scene, this.camera);
    }

    stop() {
        cancelAnimationFrame(this.animationId);
    }
}

// Экспорт для использования в main.js
const logoAnimation = new LogoAnimation();
