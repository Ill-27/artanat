document.addEventListener('DOMContentLoaded', () => {
    // Проверка поддержки WebGL
    if (!window.WebGLRenderingContext || !document.createElement('canvas').getContext('webgl')) {
        alert('Ваш браузер не поддерживает WebGL. Пожалуйста, обновите браузер.');
        return;
    }

    // Инициализация Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    let renderer;
    
    try {
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            canvas: document.getElementById('logo-canvas'),
            alpha: true,
            powerPreference: "high-performance"
        });
    } catch (e) {
        console.error("WebGL initialization error:", e);
        return;
    }
    
    renderer.setSize(210, 210);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 8;

    // Цвета и объекты
    const colors = ['#7F00FF', '#0000FF', '#00BFFF', '#00FF80', '#FFFF00', '#FF6000', '#FF0000'];
    let centerBall, logoGroup, smallBalls = [], textMaterial;
    let whiteOverlayActive = false;
    const touchDuration = 1000;
    let touchTimer = null;
    let animationId = null;

    // Загрузка шрифта
    const fontLoader = new THREE.FontLoader();
    fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.132.2/examples/fonts/helvetiker_regular.typeface.json', 
        (font) => createLogo(font),
        (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
        (err) => console.error('Error loading font:', err)
    );

    function createLogo(font) {
        // Создание 3D-текста
        textMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 1,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });

        logoGroup = new THREE.Group();
        ['A', 'T', 'A', 'T'].forEach((char, i) => {
            const textGeo = new THREE.TextGeometry(char, {
                font: font,
                size: 0.2,
                height: 0.5,
                curveSegments: 12,
                bevelEnabled: false
            });
            const textMesh = new THREE.Mesh(textGeo, textMaterial);
            const angle = (i / 4) * Math.PI * 2;
            textMesh.position.set(Math.cos(angle) * 2, Math.sin(angle) * 2, 0);
            textMesh.rotation.z = angle + Math.PI / 2;
            if (i >= 2) textMesh.rotation.z += Math.PI;
            logoGroup.add(textMesh);
        });
        scene.add(logoGroup);

        // Центральный шар
        centerBall = new THREE.Mesh(
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
        scene.add(centerBall);

        // Маленькие шары
        colors.forEach((color, i) => {
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
            const angle = (i / colors.length) * Math.PI * 2;
            ball.position.set(Math.cos(angle) * 4.5, Math.sin(angle) * 4.5, 0);
            smallBalls.push(ball);
            scene.add(ball);
        });

        // Освещение
        scene.add(new THREE.AmbientLight(0x404040));
        const pointLight = new THREE.PointLight(0xffffff, 2, 10);
        pointLight.position.set(0, 0, 2);
        scene.add(pointLight);

        // Курсор (отдельная сцена)
        const cursorRenderer = new THREE.WebGLRenderer({ 
            antialias: true,
            canvas: document.getElementById('cursor-canvas'),
            alpha: true,
            powerPreference: "high-performance"
        });
        cursorRenderer.setSize(70, 70);
        cursorRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        const cursorScene = new THREE.Scene();
        const cursorCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        cursorCamera.position.z = 8;

        // Создаем шарик для курсора
        const cursorBall = new THREE.Mesh(
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
        cursorScene.add(cursorBall);

        // Анимация
        function animate() {
            if (document.hidden) return;
            
            animationId = requestAnimationFrame(animate);
            logoGroup.rotation.z += 0.005;
            
            const time = Date.now() * 0.001;
            const pulse = 1 + Math.sin(time) * 0.15;
            centerBall.scale.setScalar(pulse);
            centerBall.material.emissiveIntensity = 1 + Math.sin(time) * 1;
            textMaterial.emissiveIntensity = 0.8 + Math.sin(time * 1.5) * 0.5;
            
            smallBalls.forEach((ball, i) => {
                const ballPulse = 0.8 + Math.sin(time + i) * 0.3;
                ball.scale.setScalar(ballPulse);
                ball.material.emissiveIntensity = 1 + Math.sin(time + i * 2) * 0.8;
                const angle = (i / colors.length) * Math.PI * 2 + time * 0.7;
                ball.position.set(Math.cos(angle) * (4.5 + Math.sin(time + i) * 0.4), Math.sin(angle) * (4.5 + Math.sin(time + i) * 0.4), 0);
            });
            
            renderer.render(scene, camera);
            
            // Анимация курсора
            cursorBall.scale.setScalar(0.8 + Math.sin(time * 3) * 0.2);
            cursorBall.material.emissiveIntensity = 1 + Math.sin(time * 2) * 1;
            cursorRenderer.render(cursorScene, cursorCamera);
        }
        animate();

        // Позиционирование курсора
        function updateCursorPosition(x, y) {
            const cursor = document.getElementById('cursor-container');
            cursor.style.left = `${Math.max(35, Math.min(window.innerWidth - 35, x))}px`;
            cursor.style.top = `${Math.max(35, Math.min(window.innerHeight - 35, y))}px`;
        }

        // Обработчики событий
        document.addEventListener('mousemove', (e) => {
            updateCursorPosition(e.clientX, e.clientY);
        });

        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            updateCursorPosition(touch.clientX, touch.clientY);
        }, { passive: false });

        document.addEventListener('contextmenu', (e) => {
            if (e.target.id !== 'telegram-link' && e.target.id !== 'fullscreen-toggle') {
                e.preventDefault();
                toggleWhiteOverlay();
            }
        });

        document.addEventListener('touchstart', (e) => {
            if (e.target.id !== 'telegram-link' && e.target.id !== 'fullscreen-toggle') {
                e.preventDefault();
                const touch = e.touches[0];
                updateCursorPosition(touch.clientX, touch.clientY);
                touchTimer = setTimeout(() => {
                    toggleWhiteOverlay();
                }, touchDuration);
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (e.target.id !== 'telegram-link' && e.target.id !== 'fullscreen-toggle') {
                e.preventDefault();
                if (touchTimer) {
                    clearTimeout(touchTimer);
                    touchTimer = null;
                }
            }
        }, { passive: false });

        function toggleWhiteOverlay() {
            whiteOverlayActive = !whiteOverlayActive;
            document.getElementById('white-overlay').style.display = whiteOverlayActive ? 'block' : 'none';
        }

        // Полноэкранный режим
        document.getElementById('fullscreen-toggle').addEventListener('click', function(e) {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error('Fullscreen error:', err);
                });
            } else {
                document.exitFullscreen();
            }
        });

        // Telegram-кнопка
        document.getElementById('telegram-link').addEventListener('click', function(e) {
            window.open('https://t.me/arterrii_ru', '_blank');
        });

        // Отключаем выделение
        document.addEventListener('selectstart', (e) => {
            if (e.target.id !== 'telegram-link' && e.target.id !== 'fullscreen-toggle') {
                e.preventDefault();
                return false;
            }
        });

        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            cursorRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });

        // Очистка при скрытии страницы
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else {
                animate();
            }
        });

        // Инициализация позиции курсора
        updateCursorPosition(window.innerWidth / 2, window.innerHeight / 2);
    }
});
