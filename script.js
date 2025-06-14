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

// ===== ОСНОВНЫЕ НАСТРОЙКИ =====
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
    defaultResponse: "> Ошибка: в наших фондах такого нет."
};

// Печатает текст как в терминале
async function typeText(element, text, isError = false) {
    element.innerHTML = ''; // Очищаем элемент
  // Печатаем по одной букве с задержкой
    element.classList.add('typing');
    if(isError) element.classList.add('error-message');
    
    for (let i = 0; i < text.length; i++) {
        element.innerHTML = text.substring(0, i+1);
        await new Promise(r => setTimeout(r, 20 + Math.random() * 50));
    }
    
    element.classList.remove('typing');
    return new Promise(r => setTimeout(r, 300));
}

// Загружает контент страницы
async function loadContent(pageUrl) {
    try {
        const response = await fetch(pageUrl); // Запрашиваем страницу
        const content = await response.text();
        // Показываем загруженный контент
        document.getElementById('terminal-output').style.opacity = 0;
        setTimeout(() => {
            document.getElementById('content-container').innerHTML = content;
            document.getElementById('content-container').style.display = 'block';
            document.getElementById('terminal-output').style.display = 'none';
        }, 500);
    } catch (error) {
        // Если ошибка - показываем сообщение
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
    document.getElementById('scrollHint').style.display = 'block';
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

// DMCA - самый эффективный вариант с анимацией цвета
document.getElementById('dmcaLink').addEventListener('click', function(e) {
    e.preventDefault();
    
    const defaultText = document.getElementById('defaultText');
    const dmcaText = document.getElementById('dmcaText');
    const dmcaLink = document.getElementById('dmcaLink');
    
    if (defaultText.style.display === 'none') {
        // Возвращаемся к исходному тексту
        defaultText.style.display = 'block';
        dmcaText.style.display = 'none';
        dmcaLink.style.color = ''; // Возвращаем исходный цвет
        dmcaLink.style.textDecoration = 'underline'; // Возвращаем подчеркивание
    } else {
        // Показываем текст DMCA
        defaultText.style.display = 'none';
        dmcaText.style.display = 'block';
        dmcaLink.style.color = 'red'; // Меняем цвет на красный
        dmcaLink.style.textDecoration = 'none'; // Убираем подчеркивание
    }
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
