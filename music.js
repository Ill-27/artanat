// Список песен
const songs = [
  {
    title: "Там, где небо — Мария Зайцева",
    file: "music/song1.mp3"
  },
  {
    title: "Название песни 2",
    file: "music/song2.mp3"
  },
  // Добавь другие песни по той же структуре
];

// Элементы управления
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const repeatBtn = document.getElementById('repeat-btn');
const nowPlaying = document.getElementById('now-playing');

const progressTrack = document.getElementById('progress-track');
const progressFill = document.getElementById('progress-fill');
const progressThumb = document.getElementById('progress-thumb');
const progressTime = document.getElementById('progress-time');
const timeStart = document.getElementById('time-start');
const timeEnd = document.getElementById('time-end');

// Состояние
let currentSongIndex = 0;
let isPlaying = false;
let isRepeating = false;
let isDragging = false;

// Вспомогательные функции
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
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
    console.error("Ошибка воспроизведения:", err);
  });
}

// Пауза
function pauseSong() {
  audioPlayer.pause();
  isPlaying = false;
  playBtn.textContent = '▶';
}

// Обновление прогресса
function updateProgress() {
  const duration = audioPlayer.duration;
  const current = audioPlayer.currentTime;

  if (!isDragging && duration) {
    const percent = (current / duration) * 100;
    progressFill.style.height = `${percent}%`;
    progressThumb.style.bottom = `${percent}%`;
    progressTime.style.bottom = `${percent}%`;
    progressTime.textContent = formatTime(current);
    timeStart.textContent = '0:00';
    timeEnd.textContent = formatTime(duration);
  }
}

// Перемотка по клику
function seekFromClick(e) {
  const rect = progressTrack.getBoundingClientRect();
  const offsetY = e.clientY - rect.top;
  const height = rect.height;
  const percent = 1 - (offsetY / height);
  const seekTime = audioPlayer.duration * percent;
  audioPlayer.currentTime = seekTime;
}

// Перемотка с перетаскиванием
progressThumb.addEventListener('mousedown', () => isDragging = true);
document.addEventListener('mouseup', () => isDragging = false);

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const rect = progressTrack.getBoundingClientRect();
    let offsetY = e.clientY - rect.top;
    offsetY = Math.max(0, Math.min(offsetY, rect.height));
    const percent = 1 - (offsetY / rect.height);
    const seekTime = audioPlayer.duration * percent;
    progressFill.style.height = `${percent * 100}%`;
    progressThumb.style.bottom = `${percent * 100}%`;
    progressTime.style.bottom = `${percent * 100}%`;
    progressTime.textContent = formatTime(seekTime);
    audioPlayer.currentTime = seekTime;
  }
});

progressTrack.addEventListener('click', seekFromClick);

// Обработка окончания трека
audioPlayer.addEventListener('ended', () => {
  if (isRepeating) {
    playSong();
  } else {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    playSong();
  }
});

// Кнопки управления
playBtn.addEventListener('click', () => {
  if (!audioPlayer.src) loadSong(currentSongIndex);
  isPlaying ? pauseSong() : playSong();
});

prevBtn.addEventListener('click', () => {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex);
  playSong();
});

nextBtn.addEventListener('click', () => {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex);
  playSong();
});

repeatBtn.addEventListener('click', () => {
  isRepeating = !isRepeating;
  repeatBtn.style.color = isRepeating ? 'lime' : '#ff0';
});

// Обновление прогресса во времени
audioPlayer.addEventListener('timeupdate', updateProgress);

// Инициализация
window.addEventListener('DOMContentLoaded', () => {
  loadSong(currentSongIndex);
});
