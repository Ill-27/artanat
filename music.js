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
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
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

// Форматирование времени
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Загрузка песни
function loadSong(index) {
  const song = songs[index];
  audioPlayer.src = song.file;
  nowPlaying.textContent = song.title;
  isPlaying = false;
  playBtn.textContent = '▶';
  progressFill.style.height = '0%';
  progressThumb.style.bottom = '0%';
  progressTime.style.bottom = '0%';
  timeStart.textContent = '0:00';
  timeEnd.textContent = '0:00';
}

// Воспроизведение
function playSong() {
  audioPlayer.play().then(() => {
    isPlaying = true;
    playBtn.textContent = '⏸';
  }).catch(err => {
    console.error("Ошибка при попытке воспроизведения:", err);
  });
}

// Пауза
function pauseSong() {
  audioPlayer.pause();
  isPlaying = false;
  playBtn.textContent = '▶';
}

// Play/Pause
playBtn.addEventListener('click', () => {
  if (!audioPlayer.src) {
    loadSong(currentSongIndex);
  }
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
});

// Предыдущая песня
prevBtn.addEventListener('click', () => {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex);
});

// Следующая песня
nextBtn.addEventListener('click', () => {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex);
});

// Обновление прогресса
audioPlayer.addEventListener('timeupdate', () => {
  if (audioPlayer.duration) {
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressFill.style.height = `${percent}%`;
    progressThumb.style.bottom = `${percent}%`;
    progressTime.style.bottom = `${percent}%`;
    progressTime.textContent = formatTime(audioPlayer.currentTime);
    timeEnd.textContent = formatTime(audioPlayer.duration);
  }
});

// Перемотка по клику
progressTrack.addEventListener('click', (e) => {
  const rect = progressTrack.getBoundingClientRect();
  const clickY = e.clientY - rect.top;
  const percent = 1 - (clickY / rect.height);
  audioPlayer.currentTime = percent * audioPlayer.duration;
});

// Конец песни
audioPlayer.addEventListener('ended', () => {
  if (isRepeating) {
    playSong();
  } else {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    playSong();
  }
});

// Инициализация
window.addEventListener('DOMContentLoaded', () => {
  loadSong(currentSongIndex);
});
