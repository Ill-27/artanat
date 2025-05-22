class CursorAnimation {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.renderer = null;
        this.cursorBall = null;
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            canvas: document.getElementById('cursor-canvas'),
            alpha: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(70, 70);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.camera.position.z = 8;

        // Создаем шарик для курсора
        this.cursorBall = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 32, 32),
            new THREE.MeshPhongMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 2,
                shininess: 100,
                transparent: true,
                opacity: 0.95
            })
        );
        this.scene.add(this.cursorBall);

        this.animate();
    }

    animate() {
        if (document.hidden) return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        const time = Date.now() * 0.001;
        
        // Анимация курсора
        this.cursorBall.scale.setScalar(0.8 + Math.sin(time * 3) * 0.2);
        this.cursorBall.material.emissiveIntensity = 1 + Math.sin(time * 2) * 1;
        this.renderer.render(this.scene, this.camera);
    }

    stop() {
        cancelAnimationFrame(this.animationId);
    }

    updatePosition(x, y) {
        const cursor = document.getElementById('cursor-container');
        cursor.style.left = `${Math.max(35, Math.min(window.innerWidth - 35, x))}px`;
        cursor.style.top = `${Math.max(35, Math.min(window.innerHeight - 35, y))}px`;
    }
}

// Экспорт для использования в main.js
const cursorAnimation = new CursorAnimation();
