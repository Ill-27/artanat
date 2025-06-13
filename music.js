// Список песен
const songs = [
  {
    title: "Там, где небо — Мария Зайцева",
    file: "music/song1.mp3"
  },
  {
    title: "Название песни 2",
    file: "music/song2.mp3"
  }
];

// Элементы управления
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const repeatBtn = document.getElementById('repeat-btn');
const volumeSlider = document.getElementById('volume-slider');
const nowPlaying = document.getElementById('now-playing');

// Прогресс-бар и время
const progressTrack = document.querySelector('.progress-track');
const progressFill = document.querySelector('.progress-fill');
const progressThumb = document.querySelector('.progress-thumb');
const timeStart = document.getElementById('time-start');
const timeCurrent = document.getElementById('time-current');
const timeEnd = document.getElementById('time-end');

// Tooltip таймкод
const tooltip = document.createElement('div');
tooltip.classList.add('progress-tooltip');
progressTrack.appendChild(tooltip);

// Состояние
let currentSongIndex = 0;
let isPlaying = false;
let isRepeating = false;
let isDragging = false;

// Форматирование времени
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

// Загрузка песни
function loadSong(index) {
  const song = songs[index];
  audioPlayer.src = song.file;
  nowPlaying.innerHTML = `<span>${song.title}</span>`;
  isPlaying = false;
  playBtn.textContent = '▶';
}

// Воспроизведение
function playSong() {
  audioPlayer.play().then(() => {
    isPlaying = true;
    playBtn.textContent = '⏸';
  }).catch(err => {
    console.error("Ошибка при воспроизведении:", err);
  });
}

// Пауза
function pauseSong() {
  audioPlayer.pause();
  isPlaying = false;
  playBtn.textContent = '▶';
}

// Кнопки управления
playBtn.addEventListener('click', () => {
  if (!audioPlayer.src) loadSong(currentSongIndex);
  isPlaying ? pauseSong() : playSong();
});

prevBtn.addEventListener('click', () => {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex);
});

nextBtn.addEventListener('click', () => {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex);
});

repeatBtn.addEventListener('click', () => {
  isRepeating = !isRepeating;
  repeatBtn.style.color = isRepeating ? 'white' : '#888';
});

// Обработка конца песни
audioPlayer.addEventListener('ended', () => {
  if (isRepeating) {
    playSong();
  } else {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
  }
});

// Громкость
volumeSlider.addEventListener('input', () => {
  audioPlayer.volume = parseFloat(volumeSlider.value);
});

// Обновление прогресса
audioPlayer.addEventListener('timeupdate', () => {
  if (!isDragging) {
    const percent = audioPlayer.currentTime / audioPlayer.duration;
    const fillHeight = percent * 100;
    progressFill.style.height = `${fillHeight}%`;
    progressThumb.style.bottom = `${fillHeight}%`;
    timeCurrent.textContent = formatTime(audioPlayer.currentTime);
    timeEnd.textContent = formatTime(audioPlayer.duration);
  }
});

// Перемотка по прогресс-бару
function updateProgressFromClientY(clientY) {
  const rect = progressTrack.getBoundingClientRect();
  const offsetY = clientY - rect.top;
  const percent = 1 - offsetY / rect.height;
  const clamped = Math.max(0, Math.min(1, percent));
  const newTime = clamped * audioPlayer.duration;
  audioPlayer.currentTime = newTime;
  const fillHeight = clamped * 100;
  progressFill.style.height = `${fillHeight}%`;
  progressThumb.style.bottom = `${fillHeight}%`;
  timeCurrent.textContent = formatTime(newTime);
}

// Tooltip таймкод при наведении
function updateTooltipTime(clientY) {
  const rect = progressTrack.getBoundingClientRect();
  const offsetY = clientY - rect.top;
  const percent = 1 - offsetY / rect.height;
  const clamped = Math.max(0, Math.min(1, percent));
  const time = clamped * audioPlayer.duration;

  tooltip.textContent = formatTime(time);
  tooltip.style.bottom = `${clamped * 100 + 6}%`;
}

// События мыши и касания
progressThumb.addEventListener('mousedown', (e) => {
  isDragging = true;
  tooltip.style.display = 'block';
  updateTooltipTime(e.clientY);
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    updateProgressFromClientY(e.clientY);
    updateTooltipTime(e.clientY);
  }
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    tooltip.style.display = 'none';
  }
});

// Touch
progressThumb.addEventListener('touchstart', (e) => {
  isDragging = true;
  tooltip.style.display = 'block';
  updateTooltipTime(e.touches[0].clientY);
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  if (isDragging && e.touches.length) {
    updateProgressFromClientY(e.touches[0].clientY);
    updateTooltipTime(e.touches[0].clientY);
  }
}, { passive: false });

document.addEventListener('touchend', () => {
  if (isDragging) {
    isDragging = false;
    tooltip.style.display = 'none';
  }
});

// Клик по прогрессу
progressTrack.addEventListener('click', (e) => {
  updateProgressFromClientY(e.clientY);
});

// Инициализация
window.addEventListener('DOMContentLoaded', () => {
  loadSong(currentSongIndex);
  audioPlayer.volume = parseFloat(volumeSlider.value);
  timeStart.textContent = '0:00';
  timeCurrent.textContent = '0:00';
});
