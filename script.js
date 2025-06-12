// ===== ЗАЩИТА ОТ КОПИРОВАНИЯ =====
document.addEventListener('copy', (e) => e.preventDefault());
document.addEventListener('cut', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());

document.addEventListener('selectstart', (e) => {
    const t = e.target;
    if (!t.isContentEditable && t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA' && !t.classList.contains('allow-selection')) {
        e.preventDefault();
    }
});

document.addEventListener('dragstart', (e) => {
    const t = e.target;
    if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
});

// ===== БАЗА ДАННЫХ ЭКСПОНАТОВ =====
const EXHIBITS_DB = {
    "статуя1": {
        type: "3d",
        title: "Древняя статуя",
        glb: "/models/exhibit1/model.glb",
        usdz: "/models/exhibit1/model.usdz",
        poster: "/models/exhibit1/poster.jpg",
        description: "Артефакт III века до н.э., найденный в 2023 году"
    },
    "видео1": {
        type: "video",
        title: "Процесс реставрации",
        src: "/videos/restoration.mp4",
        description: "Документальная съемка 2024 года"
    }
    // Добавляйте новые экспонаты по этому шаблону
};

// ===== КОНФИГУРАЦИЯ =====
const CONFIG = {
    welcomeMessages: [
        "[www.artanat.ru] #Добро пожаловать в Артанат - город искусства...",
        "Загрузка арт-пространства v3.0...",
        `> Привет, гость ${getMoscowTime()}! Это Соль, AI-гид Артаната.`, 
        "> Введите название экспоната:"
    ],
    defaultResponse: "> Ошибка: экспонат не найден в наших фондах"
};

// ===== ОСНОВНЫЕ ФУНКЦИИ =====

// Получение московского времени
function getMoscowTime() {
    const now = new Date();
    const moscowTime = new Date(now.getTime() + 3 * 3600 * 1000);
    return `${String(moscowTime.getUTCHours()).padStart(2, '0')}${String(moscowTime.getUTCMinutes()).padStart(2, '0')}`;
}

// Анимация печати текста
async function typeText(element, text, isError = false) {
    element.innerHTML = '';
    if (isError) element.classList.add('error-message');
    
    for (let i = 0; i < text.length; i++) {
        element.innerHTML = text.substring(0, i+1);
        await new Promise(r => setTimeout(r, 20 + Math.random() * 30));
    }
    
    if (isError) element.classList.remove('error-message');
    return new Promise(r => setTimeout(r, 200));
}

// Показ экспоната
function showExhibit(exhibitName) {
    const exhibit = EXHIBITS_DB[exhibitName.toLowerCase()];
    if (!exhibit) return;

    const modal = document.getElementById('exhibit-modal');
    const modelContainer = document.getElementById('model-container');
    const videoPlayer = document.getElementById('video-player');
    const modelViewer = document.getElementById('model-viewer');
    const exhibitTitle = document.getElementById('exhibit-title');
    const exhibitDesc = document.getElementById('exhibit-description');

    // Устанавливаем заголовок и описание
    exhibitTitle.textContent = exhibit.title;
    exhibitDesc.textContent = exhibit.description;

    // Настраиваем контент
    modelContainer.style.display = 'none';
    videoPlayer.style.display = 'none';

    if (exhibit.type === "3d") {
        modelViewer.src = exhibit.glb;
        modelViewer.poster = exhibit.poster;
        modelViewer.setAttribute('ios-src', exhibit.usdz);
        modelContainer.style.display = 'block';
    } else if (exhibit.type === "video") {
        videoPlayer.src = exhibit.src;
        videoPlayer.style.display = 'block';
    }

    modal.style.display = 'block';
}

// Инициализация терминала
async function initTerminal() {
    const output = document.getElementById('terminal-output');
    
    for (const msg of CONFIG.welcomeMessages) {
        const line = document.createElement('div');
        output.appendChild(line);
        await typeText(line, msg);
    }
    
    document.querySelector('.input-line').style.display = 'flex';
    document.getElementById('command-input').focus();
    document.getElementById('scrollHint').style.display = 'block';
}

// Настройка обработки ввода
function setupInput() {
    const input = document.getElementById('command-input');
    const rulesModal = document.getElementById('rules-modal');
    const agreeCheckbox = document.getElementById('agree-checkbox');
    const continueButton = document.getElementById('continue-button');
    
    input.addEventListener('keypress', async function(e) {
        if (e.key === 'Enter') {
            const query = input.value.trim();
            const response = document.createElement('div');
            document.getElementById('terminal-output').appendChild(response);
            
            if (EXHIBITS_DB[query.toLowerCase()]) {
                rulesModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                continueButton.onclick = function() {
                    if (agreeCheckbox.checked) {
                        rulesModal.style.display = 'none';
                        document.body.style.overflow = '';
                        showExhibit(query);
                        input.value = '';
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

// ===== ВРАЩЕНИЕ ЛОГОТИПА =====
const refreshIcon = document.getElementById('refreshButton');
let rotation = 0;
let velocity = 0;
let isSpinning = false;

function spin() {
    if (!isSpinning) return;
    rotation += velocity;
    refreshIcon.style.transform = `rotate(${rotation}deg)`;
    velocity *= 0.997;
    if (Math.abs(velocity) < 0.05) isSpinning = false;
    else requestAnimationFrame(spin);
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

// ===== УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ =====
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('exhibit-modal').style.display = 'none';
    const videoPlayer = document.getElementById('video-player');
    if (videoPlayer) videoPlayer.pause();
});

// ===== ПОЛНОЭКРАННЫЙ РЕЖИМ =====
document.getElementById('fullscreen-toggle').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(console.error);
    } else {
        document.exitFullscreen();
    }
});

// ===== КНОПКА TELEGRAM =====
document.getElementById('telegram-link').addEventListener('click', () => {
    window.open('https://t.me/arterrii_ru', '_blank');
});

// ===== DMCA =====
document.getElementById('dmcaLink').addEventListener('click', function(e) {
    e.preventDefault();
    const content = document.getElementById('dmcaContent');
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
});

// ===== ЗАПУСК ПРИ ЗАГРУЗКЕ =====
window.onload = function() {
    setTimeout(initTerminal, 500);
    setupInput();
    
    document.addEventListener('click', function(e) {
        if (e.target.id === 'back-button') {
            document.getElementById('content-container').style.display = 'none';
            document.getElementById('terminal-output').style.display = 'block';
            document.getElementById('command-input').focus();
        }
    });
};
