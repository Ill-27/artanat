// Инициализация Three.js
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

// Цвета и объекты
const colors = ['#7F00FF', '#0000FF', '#00BFFF', '#00FF80', '#FFFF00', '#FF6000', '#FF0000'];
let centerBall, logoGroup, smallBalls = [], textMaterial;
let isCursorActive = false, whiteOverlayActive = false, touchTimer = null;
const touchDuration = 500;

// Загрузка шрифта
const fontLoader = new THREE.FontLoader();
fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.132.2/examples/fonts/helvetiker_regular.typeface.json', createLogo);

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

    // Курсор
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

    // Анимация
    function animate() {
        requestAnimationFrame(animate);
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
        if (isCursorActive) cursorRenderer.render(cursorScene, cursorCamera);
    }
    animate();

    // Обработчики событий
    document.addEventListener('mousemove', (e) => {
        if (!isCursorActive) {
            scene.remove(centerBall);
            isCursorActive = true;
            document.getElementById('cursor-container').style.display = 'block';
        }
        document.getElementById('cursor-container').style.left = `${e.clientX}px`;
        document.getElementById('cursor-container').style.top = `${e.clientY}px`;
        cursorScene.children = [];
        cursorScene.add(centerBall);
        cursorRenderer.render(cursorScene, cursorCamera);
    });

    document.addEventListener('mouseout', () => {
        if (isCursorActive) {
            cursorScene.remove(centerBall);
            scene.add(centerBall);
            isCursorActive = false;
            document.getElementById('cursor-container').style.display = 'none';
        }
    });

    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        whiteOverlayActive = !whiteOverlayActive;
        document.getElementById('white-overlay').style.display = whiteOverlayActive ? 'block' : 'none';
    });

    // Полноэкранный режим
    document.getElementById('fullscreen-toggle').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    // Telegram-кнопка
    document.getElementById('telegram-link').addEventListener('click', () => {
        window.open('https://t.me/arterrii_ru', '_blank');
    });
}
