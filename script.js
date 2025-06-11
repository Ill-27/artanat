// Блокировка копирования, вырезания и контекстного меню
document.addEventListener('copy', (e) => e.preventDefault());
document.addEventListener('cut', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Блокировка выделения (кроме интерактивных элементов)
document.addEventListener('selectstart', (e) => {
    const target = e.target;
    if (
        !target.isContentEditable && 
        target.tagName !== 'INPUT' && 
        target.tagName !== 'TEXTAREA' && 
        !target.classList.contains('allow-selection')
    ) {
        e.preventDefault();
    }
});

// Блокировка drag & drop (кроме интерактивных элементов)
document.addEventListener('dragstart', (e) => {
    const target = e.target;
    if (
        target.tagName !== 'INPUT' && 
        target.tagName !== 'TEXTAREA'
    ) {
        e.preventDefault();
    }
});

// Функция для получения текущего времени в московском часовом поясе (формат HHmmss)
function getMoscowTime() {
    const now = new Date();
    const moscowOffset = 3 * 60 * 60 * 1000;
    const moscowTime = new Date(now.getTime() + moscowOffset);
    const hours = String(moscowTime.getUTCHours()).padStart(2, '0');
    const minutes = String(moscowTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(moscowTime.getUTCSeconds()).padStart(2, '0');
    return hours + minutes + seconds;
}

const CONFIG = {
    welcomeMessages: [
        "[www.artanat.ru] #Добро пожаловать в Артанат - город искусства...",
        "Загрузка арт-пространства v2.1.6.25...",
        "> Привет, гость " + getMoscowTime() + "! Это Соль, AI-гид Артаната.", 
        "> Куда полетим сейчас?",
    ],
    accessCodes: {
        "arterii2024": "gallery.html",
        "salt": "salt-project.html"
    },
    defaultResponse: "> Ошибка: в наших фондах такого нет"
};

async function typeText(element, text, isError = false) {
    element.innerHTML = '';
    element.classList.add('typing');
    if(isError) element.classList.add('error-message');
    
    for (let i = 0; i < text.length; i++) {
        element.innerHTML = text.substring(0, i+1);
        await new Promise(r => setTimeout(r, 20 + Math.random() * 50));
    }
    
    element.classList.remove('typing');
    return new Promise(r => setTimeout(r, 300));
}

async function loadContent(pageUrl) {
    try {
        const response = await fetch(pageUrl);
        const content = await response.text();
        
        document.getElementById('terminal-output').style.opacity = 0;
        setTimeout(() => {
            document.getElementById('content-container').innerHTML = content;
            document.getElementById('content-container').style.display = 'block';
            document.getElementById('terminal-output').style.display = 'none';
        }, 500);
    } catch (error) {
        const response = document.createElement('div');
        await typeText(response, "> Ошибка загрузки экспоната / коллекции", true);
        document.getElementById('terminal-output').appendChild(response);
    }
}

async function initTerminal() {
    const output = document.getElementById('terminal-output');
    
    CONFIG.welcomeMessages[2] = "> Привет, гость " + getMoscowTime() + "! Это Соль, AI-гид Артаната.";
    
    for (const msg of CONFIG.welcomeMessages) {
        const line = document.createElement('div');
        output.appendChild(line);
        await typeText(line, msg);
    }
    
    document.querySelector('.input-line').style.display = 'flex';
    document.getElementById('command-input').focus();
    
    // Показываем подсказку только после появления строки ввода
    setTimeout(() => {
        const scrollHint = document.createElement('div');
        scrollHint.className = 'scroll-hint';
        scrollHint.textContent = 'введите название нужного экспоната или коллекции';
        document.querySelector('.search-container').appendChild(scrollHint);
        
        setTimeout(() => {
            scrollHint.style.opacity = '1';
        }, 500);
    }, 1000);
}

function setupInput() {
    const input = document.getElementById('command-input');
    const rulesModal = document.getElementById('rules-modal');
    const agreeCheckbox = document.getElementById('agree-checkbox');
    const continueButton = document.getElementById('continue-button');
    
    input.addEventListener('keypress', async function(e) {
        if(e.key === 'Enter') {
            const code = input.value.trim();
            const response = document.createElement('div');
            document.getElementById('terminal-output').appendChild(response);
            
            if(CONFIG.accessCodes[code]) {
                rulesModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                continueButton.onclick = function() {
                    if(agreeCheckbox.checked) {
                        rulesModal.style.display = 'none';
                        document.body.style.overflow = '';
                        loadContent(CONFIG.accessCodes[code]);
                    }
                };
            } else {
                await typeText(response, CONFIG.defaultResponse, true);
                input.value = '';
            }
        }
    });
    
    agreeCheckbox.addEventListener('change', function() {
        continueButton.disabled = !this.checked;
    });
}

// ===== 3D ВРАЩЕНИЕ СЦЕНЫ =====
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotation = { x: 0, y: 0 };
const sceneElement = document.getElementById('scene');

sceneElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

sceneElement.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;
    
    rotation.y += deltaX * 0.005;
    rotation.x += deltaY * 0.005;
    
    sceneElement.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

sceneElement.addEventListener('mouseup', () => {
    isDragging = false;
});

sceneElement.addEventListener('mouseleave', () => {
    isDragging = false;
});

// Для touch устройств
sceneElement.addEventListener('touchstart', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    e.preventDefault();
}, { passive: false });

sceneElement.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;
    
    rotation.y += deltaX * 0.005;
    rotation.x += deltaY * 0.005;
    
    sceneElement.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    e.preventDefault();
}, { passive: false });

sceneElement.addEventListener('touchend', () => {
    isDragging = false;
});

// ===== THREE.JS ИНИЦИАЛИЗАЦИЯ =====
const canvas = document.getElementById('threeDCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== ВРАЩЕНИЕ ЛОГОТИПА =====
const refreshIcon = document.getElementById('refreshButton');
let iconRotation = 0;
let iconVelocity = 0;
let isIconSpinning = false;

function spinIcon() {
    if (!isIconSpinning) return;

    iconRotation += iconVelocity;
    refreshIcon.style.transform = `rotate(${iconRotation}deg)`;
    iconVelocity *= 0.997;

    if (Math.abs(iconVelocity) < 0.05) {
        isIconSpinning = false;
        iconVelocity = 0;
        return;
    }

    requestAnimationFrame(spinIcon);
}

function windUpIcon() {
    iconVelocity += 5;
    if (!isIconSpinning) {
        isIconSpinning = true;
        spinIcon();
    }
}

refreshIcon.addEventListener('click', windUpIcon);
refreshIcon.addEventListener('touchstart', (e) => {
    e.preventDefault();
    windUpIcon();
}, { passive: false });

// ===== DMCA =====
document.getElementById('dmcaLink').addEventListener('click', function(e) {
    e.preventDefault();
    var content = document.getElementById('dmcaContent');
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
});

// ===== ПОЛНОЭКРАННЫЙ РЕЖИМ =====
document.getElementById('fullscreen-toggle').addEventListener('click', function() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen();
    }
});

// ===== TELEGRAM-КНОПКА =====
document.getElementById('telegram-link').addEventListener('click', function() {
    window.open('https://t.me/arterrii_ru', '_blank');
});

window.onload = function() {
    setTimeout(initTerminal, 500);
    setupInput();
    
    document.addEventListener('click', function(e) {
        if(e.target.id === 'back-button') {
            document.getElementById('content-container').style.display = 'none';
            document.getElementById('content-container').innerHTML = '';
            document.getElementById('terminal-output').style.display = 'block';
            document.getElementById('terminal-output').style.opacity = 1;
            document.getElementById('command-input').focus();
        }
    });
};
