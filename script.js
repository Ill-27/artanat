// Получаем элемент кнопки
        const refreshButton = document.getElementById('refreshButton');

// Добавляем обработчик клика
        refreshButton.addEventListener('click', function() {
            // Вращаем иконку
            this.style.transform = 'rotate(360deg)';
            
            // Обновляем страницу после завершения анимации
            setTimeout(() => {
                window.location.reload();
            }, 500); // 500ms = длительность анимации
        });

document.addEventListener('DOMContentLoaded', () => {
    // Проверка поддержки WebGL
    if (!window.WebGLRenderingContext || !document.createElement('canvas').getContext('webgl')) {
        alert('Ваш браузер не поддерживает WebGL. Пожалуйста, обновите браузер.');
        return;
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
        logoAnimation.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        cursorAnimation.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
