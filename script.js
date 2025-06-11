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
    // Создаем дату с текущим временем UTC
    const now = new Date();
    
    // Московский часовой пояс UTC+3
    const moscowOffset = 3 * 60 * 60 * 1000;
    const moscowTime = new Date(now.getTime() + moscowOffset);
    
    // Получаем часы, минуты, секунды
    const hours = String(moscowTime.getUTCHours()).padStart(2, '0');
    const minutes = String(moscowTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(moscowTime.getUTCSeconds()).padStart(2, '0');
    // Возвращаем время в формате HHmmss
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
    
    // Обновляем время в приветственном сообщении
    CONFIG.welcomeMessages[2] = "> Привет, гость " + getMoscowTime() + "! Это Соль, AI-гид Артаната.";
    
    for (const msg of CONFIG.welcomeMessages) {
        const line = document.createElement('div');
        output.appendChild(line);
        await typeText(line, msg);
    }
    
    document.querySelector('.input-line').style.display = 'flex';
    document.getElementById('command-input').focus();
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
                // Показываем модальное окно с правилами
                rulesModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                // Ждем, пока пользователь согласится с правилами
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
    
    // Обработчик изменения состояния чекбокса
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

// ===== DMCA =====
document.getElementById('dmcaLink').addEventListener('click', function(e) {
    e.preventDefault();
    var content = document.getElementById('dmcaContent');
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
});

// ===== Вращение логотипа =====
const refreshIcon = document.getElementById('refreshButton');

let rotation = 0;
let velocity = 0;
let isSpinning = false;

// Основной цикл вращения с инерцией
function spin() {
  if (!isSpinning) return;

  rotation += velocity;
  refreshIcon.style.transform = `rotate(${rotation}deg)`;

  velocity *= 0.997; // трение/замедление

  if (Math.abs(velocity) < 0.05) {
    isSpinning = false;
    velocity = 0;
    return;
  }

  requestAnimationFrame(spin);
}

// Функция "завода"
function windUp() {
  velocity += 5; // каждая активация прибавляет скорость

  if (!isSpinning) {
    isSpinning = true;
    spin();
  }
}

// Мышь
refreshIcon.addEventListener('click', windUp);

// Тач
refreshIcon.addEventListener('touchstart', (e) => {
  e.preventDefault(); // чтобы не прокручивалась страница
  windUp();
}, { passive: false });

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

// ===== ПЕРЕМЕННЫЕ ДЛЯ АНИМАЦИИ =====
const clock = new THREE.Clock();
let targetRotation = { x: 0, y: 0, z: 0 };
let currentRotation = { x: 0, y: 0, z: 0 };
let scrollPercent = 0;
let targetCameraPos = { y: 0, z: 5 };
let currentCameraPos = { y: 0, z: 5 };

// ===== АНИМАЦИЯ =====
function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

function animate() {
  const elapsedTime = clock.getElapsedTime();

  currentRotation.x = lerp(currentRotation.x, targetRotation.x, 0.05);
  currentRotation.y = lerp(currentRotation.y, targetRotation.y, 0.05);
  currentRotation.z = lerp(currentRotation.z, targetRotation.z, 0.05);

  currentCameraPos.y = lerp(currentCameraPos.y, targetCameraPos.y, 0.1);
  currentCameraPos.z = lerp(currentCameraPos.z, targetCameraPos.z, 0.1);
  camera.position.y = currentCameraPos.y;
  camera.position.z = currentCameraPos.z;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// ===== ОБРАБОТКА СКРОЛЛА =====
let lastScrollTime = 0;
let isScrolling = false;

function handleScroll() {
  const now = Date.now();
  if (now - lastScrollTime < 16) return;
  lastScrollTime = now;

  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  scrollPercent = Math.min(Math.max(scrollY / maxScroll, 0), 1);

  document.getElementById('scene').style.transform = `rotateX(${360 - scrollPercent * 360}deg)`;
  targetCameraPos.y = scrollPercent * 5;
  targetCameraPos.z = 5 - scrollPercent * 7;
  targetRotation.z = scrollPercent * 0.5;
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    isScrolling = entry.isIntersecting;
  });
}, { threshold: 0.1 });

observer.observe(document.querySelector('.container'));

window.addEventListener('scroll', () => {
  if (!isScrolling) return;
  requestAnimationFrame(handleScroll);
}, { passive: true });

// ===== ОБРАБОТКА РАЗМЕРА ЭКРАНА =====
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 100);
});

// ===== ПОЛНОЭКРАННЫЙ РЕЖИМ =====
document.getElementById('fullscreen-toggle').addEventListener('click', function(e) {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error('Fullscreen error:', err);
    });
  } else {
    document.exitFullscreen();
  }
});

// ===== TELEGRAM-КНОПКА =====
document.getElementById('telegram-link').addEventListener('click', function(e) {
  window.open('https://t.me/arterrii_ru', '_blank');
});

// ===== ОТКЛЮЧЕНИЕ ВЫДЕЛЕНИЯ =====
document.addEventListener('selectstart', (e) => {
  if (e.target.id !== 'telegram-link' && e.target.id !== 'fullscreen-toggle') {
    e.preventDefault();
    return false;
  }
});

// ===== ПРИ ПЕРЕРИСОВКЕ ОБНОВЛЕНИЕ PIXEL RATIO =====
window.addEventListener('resize', () => {
  logoAnimation?.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  cursorAnimation?.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
