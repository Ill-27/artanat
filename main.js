document.addEventListener('DOMContentLoaded', () => {
    // Проверка поддержки WebGL
    if (!window.WebGLRenderingContext || !document.createElement('canvas').getContext('webgl')) {
        alert('Ваш браузер не поддерживает WebGL. Пожалуйста, обновите браузер.');
        return;
    }

    let whiteOverlayActive = false;
    const touchDuration = 1000;
    let touchTimer = null;

    // Обработчики событий мыши
    document.addEventListener('mousemove', (e) => {
        cursorAnimation.updatePosition(e.clientX, e.clientY);
    });

    // Обработчики событий касания
    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        cursorAnimation.updatePosition(touch.clientX, touch.clientY);
    }, { passive: false });

    // Обработка правой кнопки мыши и долгого нажатия
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
            cursorAnimation.updatePosition(touch.clientX, touch.clientY);
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
        logoAnimation.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        cursorAnimation.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Очистка при скрытии страницы
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            logoAnimation.stop();
            cursorAnimation.stop();
        } else {
            logoAnimation.animate();
            cursorAnimation.animate();
        }
    });

    // Инициализация позиции курсора
    cursorAnimation.updatePosition(window.innerWidth / 2, window.innerHeight / 2);
});

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
