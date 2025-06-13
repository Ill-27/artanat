const songs = [
  { title: "Там, где небо — Мария Зайцева", file: "music/song1.mp3" },
  { title: "Название песни 2", file: "music/song2.mp3" },
  { title: "Название песни 3", file: "music/song3.mp3" }
];

let shuffledQueue = [];
let currentSongIndex = 0;
let isPlaying = false;
let isRepeating = false;

const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const repeatBtn = document.getElementById('repeat-btn');
const nowPlaying = document.getElementById('now-playing');

const progressTrack = document.getElementById('progress-track');
const progressFill = document.getElementById('progress-fill');
const progressThumb = document.getElementById('progress-thumb');
const timeStart = document.getElementById('time-start');
const timeEnd = document.getElementById('time-end');

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function resetShuffleQueue() {
  shuffledQueue = shuffleArray([...Array(songs.length).keys()]);
}

function loadSong(index) {
  const songIndex = shuffledQueue[index];
  const song = songs[songIndex];
  audioPlayer.src = song.file;
  
  // Обновляем название песни с анимацией
  nowPlaying.style.animation = 'none';
  nowPlaying.offsetHeight; // Trigger reflow
  nowPlaying.textContent = song.title;
  nowPlaying.style.animation = 'fadeInUp 1s ease-out forwards, scrollTitle 15s linear infinite';
  
  if (isPlaying) {
    playSong();
  } else {
    playBtn.textContent = '▶';
  }
}

function playSong() {
  audioPlayer.play().then(() => {
    isPlaying = true;
    playBtn.textContent = '⏸';
  }).catch(err => {
    console.error("Ошибка воспроизведения:", err);
  });
}

function pauseSong() {
  audioPlayer.pause();
  isPlaying = false;
  playBtn.textContent = '▶';
}

function nextSong() {
  if (isRepeating) {
    audioPlayer.currentTime = 0;
    playSong();
  } else {
    currentSongIndex++;
    if (currentSongIndex >= shuffledQueue.length) {
      resetShuffleQueue();
      currentSongIndex = 0;
    }
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

playBtn.addEventListener('click', () => {
  if (!audioPlayer.src) loadSong(currentSongIndex);
  isPlaying ? pauseSong() : playSong();
});

nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);

repeatBtn.addEventListener('click', () => {
  isRepeating = !isRepeating;
  repeatBtn.classList.toggle('active', isRepeating);
});

audioPlayer.addEventListener('ended', () => {
  if (isRepeating) {
    audioPlayer.currentTime = 0;
    playSong();
  } else {
    nextSong();
  }
});

audioPlayer.addEventListener('timeupdate', () => {
  if (audioPlayer.duration) {
    const percent = audioPlayer.currentTime / audioPlayer.duration;
    const fillHeight = percent * 100;
    progressFill.style.height = `${fillHeight}%`;
    progressThumb.style.bottom = `${fillHeight}%`;
    timeStart.textContent = formatTime(audioPlayer.currentTime);
    timeEnd.textContent = formatTime(audioPlayer.duration);
  }
});

// Плавное управление ползунком без зажима
let isDragging = false;

progressTrack.addEventListener('mousedown', (e) => {
  isDragging = true;
  updateProgress(e.clientY);
});

progressTrack.addEventListener('mousemove', (e) => {
  if (isDragging) {
    updateProgress(e.clientY);
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

progressTrack.addEventListener('touchstart', (e) => {
  isDragging = true;
  updateProgress(e.touches[0].clientY);
  e.preventDefault();
}, { passive: false });

progressTrack.addEventListener('touchmove', (e) => {
  if (isDragging) {
    updateProgress(e.touches[0].clientY);
    e.preventDefault();
  }
}, { passive: false });

document.addEventListener('touchend', () => {
  isDragging = false;
});

function updateProgress(clientY) {
  const rect = progressTrack.getBoundingClientRect();
  let offsetY = rect.bottom - clientY;
  offsetY = Math.max(0, Math.min(rect.height, offsetY));
  const percent = offsetY / rect.height;
  
  audioPlayer.currentTime = percent * audioPlayer.duration;
  progressFill.style.height = `${percent * 100}%`;
  progressThumb.style.bottom = `${percent * 100}%`;
}

window.addEventListener('DOMContentLoaded', () => {
  resetShuffleQueue();
  currentSongIndex = 0;
  loadSong(currentSongIndex);
  
  // Инициализация времени
  timeStart.textContent = '0:00';
  timeEnd.textContent = '0:00';
});
