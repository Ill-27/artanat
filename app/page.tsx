'use client'; // Это нужно для использования хуков и обработчиков событий

import { useEffect } from 'react';
import './globals.css';

export default function Home() {
  useEffect(() => {
    // Функция для переключения полноэкранного режима
    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        // Вход в полноэкранный режим
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Ошибка при включении полноэкранного режима: ${err.message}`);
        });
      } else {
        // Выход из полноэкранного режима
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    };

    // Обработчик изменения полноэкранного режима
    const handleFullscreenChange = () => {
      const btn = document.getElementById('fullscreen-toggle');
      if (document.fullscreenElement) {
        if (btn) btn.textContent = '↖️';
        document.body.style.background = '#000'; // Сохраняем черный фон
      } else {
        if (btn) btn.textContent = '↘️';
      }
    };

    // Назначение обработчика клика
    const fullscreenBtn = document.getElementById('fullscreen-toggle');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    // Защита от случайного выхода (кроме клика по нашей кнопке)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.fullscreenElement) {
        e.preventDefault(); // Блокируем выход по Escape
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);

    // Поддержка различных префиксов браузеров
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    // Очистка при размонтировании компонента
    return () => {
      if (fullscreenBtn) {
        fullscreenBtn.removeEventListener('click', toggleFullscreen);
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <>
      <div id="arterii-license">
        <div>© 2025 ARTERRII. Все права защищены</div>
        <div>Это цифровой арт-музей. Только для просмотра</div>
        <div>Копирование и использование запрещено</div>
      </div>

      <span className="fullscreen-btn" id="fullscreen-toggle">↘</span>
    </>
  );
}
