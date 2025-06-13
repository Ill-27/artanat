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
  // Добавляй другие песни по структуре
];

// Элементы управления
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const nowPlaying = document.getElementById('now-playing');
const progressFilled = document.getElementById('progressFilled');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const bottomTime = document.querySelector('.bottom-time');
const progressTrack = document.querySelector('.progress-track');

let currentSongIndex = 0;
let isPlaying = false;
let isDragging = false;

// Загрузка песни
function loadSong(index) {
  const song = songs[index];
  audioPlayer.src = song.file;
  nowPlaying.innerHTML = `<span class="scrolling-text">${song.title}</span>`;
  playBtn.textContent = '▶';
  isPlaying = false;
}

// Обновление времени и прогресса
function updateProgress() {
  if (!isDragging && audioPlayer.duration) {
    const percent = audioPlayer.currentTime / audioPlayer.duration;
    progressFilled.style.height = `${percent * 100}%`;
    const minutes = Math.floor(audioPlayer.currentTime / 60);
    const seconds = Math.floor(audioPlayer.currentTime % 60).toString().padStart(2, '0');
    currentTimeEl.textContent = `${minutes}:${seconds}`;
    positionCurrentTime();
  }
}

// Позиционирование текущего времени слева от ползунка
function positionCurrentTime() {
  const percent = audioPlayer.currentTime / audioPlayer.duration;
  const height = progressTrack.clientHeight;
  const offset = (1 - percent) * height;
  currentTimeEl.style.top = `${offset - 8}px`; // немного выше центра линии
}

// Формат времени
function formatTime(sec) {
  const min = Math.floor(sec / 60);
  const secPart = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${min}:${secPart}`;
}

// Воспроизведение и пауза
function playSong() {
  audioPlayer.play().then(() => {
    isPlaying = true;
    playBtn.textContent = '⏸';
  }).catch(err => {
    console.error("Ошибка при воспроизведении:", err);
  });
}

function pauseSong() {
  audioPlayer.pause();
  isPlaying = false;
  playBtn.textContent = '▶';
}

// Управление кнопками
playBtn.addEventListener('click', () => {
  if (!audioPlayer.src) loadSong(currentSongIndex);
  isPlaying ? pauseSong() : playSong();
});

prevBtn.addEventListener('click', () => {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex);
  if (isPlaying) playSong();
});

nextBtn.addEventListener('click', () => {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex);
  if (isPlaying) playSong();
});

// Обновление прогресса
audioPlayer.addEventListener('timeupdate', updateProgress);

audioPlayer.addEventListener('loadedmetadata', () => {
  bottomTime.textContent = formatTime(audioPlayer.duration);
  durationEl.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener('ended', () => {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex);
  playSong();
});

// Поддержка мыши и касания
function handleSeek(clientY) {
  const rect = progressTrack.getBoundingClientRect();
  const offsetY = clientY - rect.top;
  const percent = 1 - (offsetY / rect.height);
  const clamped = Math.max(0, Math.min(1, percent));

  if (audioPlayer.duration) {
    audioPlayer.currentTime = clamped * audioPlayer.duration;
  }
}

progressTrack.addEventListener('mousedown', (e) => {
  isDragging = true;
  handleSeek(e.clientY);
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) handleSeek(e.clientY);
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

progressTrack.addEventListener('touchstart', (e) => {
  isDragging = true;
  handleSeek(e.touches[0].clientY);
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (isDragging) handleSeek(e.touches[0].clientY);
}, { passive: true });

document.addEventListener('touchend', () => {
  isDragging = false;
});

// Запуск при загрузке
window.addEventListener('DOMContentLoaded', () => {
  loadSong(currentSongIndex);
});
