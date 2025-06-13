const songs = [
  { title: "Там, где небо — Мария Зайцева", file: "music/song1.mp3" },
  { title: "Название песни 2", file: "music/song2.mp3" },
  { title: "Название песни 3", file: "music/song3.mp3" }
];

let shuffledQueue = [];
let currentSongIndex = 0;
let isPlaying = false;
let isRepeating = false;
let isDragging = false;

const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const repeatBtn = document.getElementById('repeat-btn');
const nowPlaying = document.getElementById('now-playing');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');

const progressTrack = document.getElementById('progress-track');
const progressFill = document.getElementById('progress-fill');
const progressThumb = document.getElementById('progress-thumb');
const timeCurrent = document.getElementById('time-start');
const timeDuration = document.getElementById('time-end');

// Инициализация
function init() {
  resetShuffleQueue();
  setupEventListeners();
  loadSong(currentSongIndex);
  updateTimeDisplay(0, 0);
}

function resetShuffleQueue() {
  shuffledQueue = [...Array(songs.length).keys()];
  for (let i = shuffledQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledQueue[i], shuffledQueue[j]] = [shuffledQueue[j], shuffledQueue[i]];
  }
}

function loadSong(index) {
  const songIndex = shuffledQueue[index];
  const song = songs[songIndex];
  audioPlayer.src = song.file;
  
  // Устанавливаем дублированное название для бесшовной анимации
  const titles = document.querySelectorAll('.vertical-title');
  titles.forEach(el => el.textContent = song.title);
  
  resetTitleAnimation();
  
  if (isPlaying) {
    audioPlayer.play().catch(console.error);
  }
}

function resetTitleAnimation() {
  const container = document.querySelector('.vertical-title-container');
  container.style.animation = 'none';
  container.offsetHeight;
  container.style.animation = 'scrollTitle 20s linear infinite';
}

function playSong() {
  audioPlayer.play()
    .then(() => {
      isPlaying = true;
      playBtn.classList.add('active');
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    })
    .catch(console.error);
}

function pauseSong() {
  audioPlayer.pause();
  isPlaying = false;
  playBtn.classList.remove('active');
  playIcon.style.display = 'block';
  pauseIcon.style.display = 'none';
}

function nextSong() {
  if (isRepeating) {
    audioPlayer.currentTime = 0;
    playSong();
  } else {
    currentSongIndex = (currentSongIndex + 1) % shuffledQueue.length;
    if (currentSongIndex === 0) resetShuffleQueue();
    loadSong(currentSongIndex);
    if (isPlaying) playSong();
  }
}

function prevSong() {
  if (isRepeating) {
    audioPlayer.currentTime = 0;
    playSong();
  } else {
    currentSongIndex = (currentSongIndex - 1 + shuffledQueue.length) % shuffledQueue.length;
    loadSong(currentSongIndex);
    if (isPlaying) playSong();
  }
}

function toggleRepeat() {
  isRepeating = !isRepeating;
  repeatBtn.classList.toggle('active', isRepeating);
}

function updateProgressDisplay(percent) {
  const fillHeight = percent * 100;
  progressFill.style.height = `${fillHeight}%`;
  progressThumb.style.bottom = `${fillHeight}%`;
  timeCurrent.style.bottom = `${fillHeight}%`;
}

function updateTimeDisplay(current, duration) {
  timeCurrent.textContent = formatTime(current);
  timeDuration.textContent = formatTime(duration);
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

function handleProgressInteraction(e) {
  const rect = progressTrack.getBoundingClientRect();
  const clientY = e.clientY || e.touches[0].clientY;
  const offsetY = rect.bottom - clientY;
  const percent = Math.max(0, Math.min(1, offsetY / rect.height));
  
  audioPlayer.currentTime = percent * audioPlayer.duration;
  updateProgressDisplay(percent);
}

function setupEventListeners() {
  playBtn.addEventListener('click', () => {
    if (!audioPlayer.src) loadSong(currentSongIndex);
    isPlaying ? pauseSong() : playSong();
  });
  
  nextBtn.addEventListener('click', nextSong);
  prevBtn.addEventListener('click', prevSong);
  repeatBtn.addEventListener('click', toggleRepeat);

  audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration && !isDragging) {
      const percent = audioPlayer.currentTime / audioPlayer.duration;
      updateProgressDisplay(percent);
      updateTimeDisplay(audioPlayer.currentTime, audioPlayer.duration);
    }
  });

  audioPlayer.addEventListener('ended', () => {
    if (isRepeating) {
      audioPlayer.currentTime = 0;
      playSong();
    } else {
      nextSong();
    }
  });

  // Прогресс-бар
  progressTrack.addEventListener('mousedown', (e) => {
    isDragging = true;
    handleProgressInteraction(e);
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) handleProgressInteraction(e);
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  progressTrack.addEventListener('touchstart', (e) => {
    isDragging = true;
    handleProgressInteraction(e);
  }, { passive: false });
  
  document.addEventListener('touchmove', (e) => {
    if (isDragging) handleProgressInteraction(e);
  }, { passive: false });
  
  document.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Горячие клавиши
  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'Space': e.preventDefault(); playBtn.click(); break;
      case 'ArrowRight': nextBtn.click(); break;
      case 'ArrowLeft': prevBtn.click(); break;
      case 'KeyR': repeatBtn.click(); break;
    }
  });
}

// Запуск плеера
window.addEventListener('DOMContentLoaded', init);
