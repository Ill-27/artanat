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

const progressTrack = document.getElementById('progress-track');
const progressFill = document.getElementById('progress-fill');
const progressThumb = document.getElementById('progress-thumb');
const timeCurrent = document.getElementById('time-start');
const timeDuration = document.getElementById('time-end');

// Инициализация времени
timeCurrent.classList.add('current');
timeDuration.classList.add('duration');

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
  
  // Обновляем название песни с плавной анимацией
  nowPlaying.style.animation = 'none';
  nowPlaying.offsetHeight; // Trigger reflow
  nowPlaying.textContent = song.title;
  nowPlaying.style.animation = 'fadeInUp 1s ease-out forwards, scrollTitle 20s linear infinite';
  
  if (isPlaying) {
    playSong();
  }
}

function playSong() {
  audioPlayer.play().then(() => {
    isPlaying = true;
    playBtn.classList.add('playing');
  }).catch(err => {
    console.error("Ошибка воспроизведения:", err);
  });
}

function pauseSong() {
  audioPlayer.pause();
  isPlaying = false;
  playBtn.classList.remove('playing');
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

// Обработчики кнопок
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

// Обработчики событий плеера
audioPlayer.addEventListener('ended', () => {
  if (isRepeating) {
    audioPlayer.currentTime = 0;
    playSong();
  } else {
    nextSong();
  }
});

audioPlayer.addEventListener('timeupdate', () => {
  if (audioPlayer.duration && !isDragging) {
    updateProgressDisplay(audioPlayer.currentTime / audioPlayer.duration);
  }
});

// Управление прогресс-баром
function startDrag(e) {
  isDragging = true;
  handleDrag(e);
}

function handleDrag(e) {
  if (!isDragging) return;
  
  const clientY = e.clientY || e.touches[0].clientY;
  const rect = progressTrack.getBoundingClientRect();
  const offsetY = rect.bottom - clientY;
  const percent = Math.max(0, Math.min(1, offsetY / rect.height));
  
  audioPlayer.currentTime = percent * audioPlayer.duration;
  updateProgressDisplay(percent);
}

function endDrag() {
  isDragging = false;
}

function updateProgressDisplay(percent) {
  const fillHeight = percent * 100;
  progressFill.style.height = `${fillHeight}%`;
  progressThumb.style.bottom = `${fillHeight}%`;
  
  // Обновляем текущее время
  timeCurrent.textContent = formatTime(audioPlayer.currentTime);
  timeCurrent.style.bottom = `${fillHeight}%`;
  
  // Обновляем общее время
  if (!isDragging) {
    timeDuration.textContent = formatTime(audioPlayer.duration);
  }
}

// Инициализация событий перетаскивания
progressTrack.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', handleDrag);
document.addEventListener('mouseup', endDrag);

progressTrack.addEventListener('touchstart', (e) => {
  startDrag(e.touches[0]);
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  if (isDragging) handleDrag(e.touches[0]);
}, { passive: false });

document.addEventListener('touchend', endDrag);

// Запуск плеера
window.addEventListener('DOMContentLoaded', () => {
  resetShuffleQueue();
  currentSongIndex = 0;
  loadSong(currentSongIndex);
  
  // Инициализация времени
  timeCurrent.textContent = '0:00';
  timeDuration.textContent = '0:00';
});

// Горячие клавиши
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    playBtn.click();
  } else if (e.code === 'ArrowRight') {
    nextBtn.click();
  } else if (e.code === 'ArrowLeft') {
    prevBtn.click();
  } else if (e.code === 'KeyR') {
    repeatBtn.click();
  }
});
