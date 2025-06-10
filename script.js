// ===== Окно с правилами =====
document.addEventListener('DOMContentLoaded', function() {
  const searchBox = document.querySelector('.search-box');
  const rulesModal = document.getElementById('rules-modal');
  const agreeCheckbox = document.getElementById('agree-checkbox');
  const continueButton = document.getElementById('continue-button');
  const contentSection = document.getElementById('contentSection');
  
  // Обработчик ввода в поисковую строку
  searchBox.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value.trim() !== '') {
      e.preventDefault();
      showRulesModal();
    }
  });
  
  // Показ модального окна с правилами
  function showRulesModal() {
    rulesModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
  }
  
  // Обработчик изменения состояния чекбокса
  agreeCheckbox.addEventListener('change', function() {
    continueButton.disabled = !this.checked;
  });
  
  // Обработчик кнопки "Продолжить"
  continueButton.addEventListener('click', function() {
    rulesModal.style.display = 'none';
    document.body.style.overflow = ''; // Восстанавливаем прокрутку
    
    // Показываем результаты поиска
    document.getElementById('searchQuery').textContent = searchBox.value;
    contentSection.style.display = 'flex';
    
    // Анимация появления контента
    setTimeout(() => {
      document.querySelector('.content-container').classList.add('active');
    }, 50);
  });
  
  // Закрытие модального окна при клике вне его
  rulesModal.addEventListener('click', function(e) {
    if (e.target === this) {
      searchBox.value = ''; // Очищаем поисковую строку
      rulesModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
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

// ===== ПОИСК =====
const searchBox = document.querySelector('.search-box');
searchBox.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    const query = this.value.trim();
    if (query) {
      document.getElementById('searchQuery').textContent = query;
      document.getElementById('contentSection').style.display = 'flex';
      document.getElementById('contentContainer').classList.add('active');
    }
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.getElementById('contentSection').style.display = 'none';
    document.getElementById('contentContainer').classList.remove('active');
    searchBox.value = '';
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 300);
  }
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
