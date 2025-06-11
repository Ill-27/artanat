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

// CSS-защита от выделения (с исключением для полей ввода)
const antiSelectionStyle = document.createElement('style');
antiSelectionStyle.textContent = `
    *:not(input):not(textarea):not([contenteditable="true"]):not(.allow-selection) {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
    }
`;
document.head.appendChild(antiSelectionStyle);

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
    
    setTimeout(() => {
        document.getElementById('scrollHint').style.display = 'block';
    }, 500);
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

// DMCA
document.getElementById('dmcaLink').addEventListener('click', function(e) {
    e.preventDefault();
    var content = document.getElementById('dmcaContent');
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
});

// Вращение логотипа
const refreshIcon = document.getElementById('refreshButton');
let rotation = 0;
let velocity = 0;
let isSpinning = false;

function spin() {
  if (!isSpinning) return;
  rotation += velocity;
  refreshIcon.style.transform = `rotate(${rotation}deg)`;
  velocity *= 0.997;
  if (Math.abs(velocity) < 0.05) {
    isSpinning = false;
    velocity = 0;
    return;
  }
  requestAnimationFrame(spin);
}

function windUp() {
  velocity += 5;
  if (!isSpinning) {
    isSpinning = true;
    spin();
  }
}

refreshIcon.addEventListener('click', windUp);
refreshIcon.addEventListener('touchstart', (e) => {
  e.preventDefault();
  windUp();
}, { passive: false });

// THREE.JS инициализация
const canvas = document.getElementById('threeDCanvas');
const scene3d = new THREE.Scene();
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

// 3D плоскость для текстового блока
const textGeometry = new THREE.PlaneGeometry(5, 3);
const textMaterial = new THREE.MeshBasicMaterial({ 
  color: 0xffffff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.5
});
const textPlane = new THREE.Mesh(textGeometry, textMaterial);
scene3d.add(textPlane);

// Анимация
function animate() {
  requestAnimationFrame(animate);
  textPlane.rotation.x += 0.005;
  textPlane.rotation.y += 0.01;
  renderer.render(scene3d, camera);
}
animate();

// Обработчик скролла для 3D эффекта
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = Math.min(Math.max(scrollY / maxScroll, 0), 1);
  
  document.getElementById('scene').style.transform = `
    rotateX(${scrollPercent * 30}deg)
    rotateY(${scrollPercent * 15}deg)
    translateZ(${scrollPercent * -100}px)
  `;
  
  camera.position.z = 5 - scrollPercent * 7;
  camera.position.y = scrollPercent * 5;
}, { passive: true });

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
