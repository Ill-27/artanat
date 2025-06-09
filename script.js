document.addEventListener('DOMContentLoaded', () => {
    // Проверка поддержки WebGL
    if (!window.WebGLRenderingContext || !document.createElement('canvas').getContext('webgl')) {
        alert('Ваш браузер не поддерживает WebGL. Пожалуйста, обновите браузер.');
        return;
    }

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
