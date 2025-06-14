const songs = [
  { title: "-> Там, где небо (Мария Зайцева, 2022)", file: "music/MARIA_Tam_Gde_Nebo.mp3" },
  { title: "-> Тернии (polnalyubvi feat. pyrokinesis, 2025)", file: "music/Polnalyubvi_Ternii.mp3" },
  { title: "-> Кэцхен (Канцлер Ги, 2008)", file: "music/Kancler_GI_Kechen.mp3" }
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
initPlayer();

function initPlayer() {
  resetShuffleQueue();
  setupEventListeners();
  loadSong(currentSongIndex);
  updateTimeDisplay(0, 0);
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

function resetShuffleQueue() {
  shuffledQueue = shuffleArray([...Array(songs.length).keys()]);
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadSong(index) {
  const songIndex = shuffledQueue[index];
  const song = songs[songIndex];
  
  // Плавное переключение трека
  audioPlayer.src = song.file;
  nowPlaying.textContent = song.title;
  resetTitleAnimation();
  
  // Сбрасываем прогресс
  if (!isPlaying) {
    updateProgressDisplay(0);
  }
}

function playSong() {
  audioPlayer.play().then(() => {
    isPlaying = true;
    playBtn.classList.add('active');
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  }).catch(console.error);
}

function pauseSong() {
  audioPlayer.pause();
  isPlaying = false;
  playBtn.classList.remove('active');
  playIcon.style.display = 'block';
  pauseIcon.style.display = 'none';
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % shuffledQueue.length;
  if (currentSongIndex === 0) resetShuffleQueue();
  loadSong(currentSongIndex);
  if (isPlaying) playSong();
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + shuffledQueue.length) % shuffledQueue.length;
  loadSong(currentSongIndex);
  if (isPlaying) playSong();
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

function handleProgressClick(e) {
  const rect = progressTrack.getBoundingClientRect();
  const offsetY = rect.bottom - (e.clientY || e.touches[0].clientY);
  const percent = Math.max(0, Math.min(1, offsetY / rect.height));
  audioPlayer.currentTime = percent * audioPlayer.duration;
}

function setupEventListeners() {
  // Кнопки управления
  playBtn.addEventListener('click', () => {
    if (!audioPlayer.src) loadSong(currentSongIndex);
    isPlaying ? pauseSong() : playSong();
  });
  
  nextBtn.addEventListener('click', nextSong);
  prevBtn.addEventListener('click', prevSong);
  repeatBtn.addEventListener('click', toggleRepeat);

  // Обработчики плеера
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

  // Управление прогресс-баром
  progressTrack.addEventListener('mousedown', (e) => {
    isDragging = true;
    handleProgressClick(e);
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) handleProgressClick(e);
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  progressTrack.addEventListener('touchstart', (e) => {
    isDragging = true;
    handleProgressClick(e);
  }, { passive: false });
  
  document.addEventListener('touchmove', (e) => {
    if (isDragging) handleProgressClick(e);
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
