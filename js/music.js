// ===== Конфигурация плеера =====
const songs = []; // Песни будут загружаться из songs.json
let shuffledQueue = [];
let currentSongIndex = 0;
let isPlaying = false;
let isRepeating = false;
let isDragging = false;

// Элементы DOM
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const repeatBtn = document.getElementById('repeat-btn');
const nowPlaying = document.getElementById('now-playing');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const progressFill = document.getElementById('progress-fill');
const songList = document.getElementById('song-list');
const searchInput = document.getElementById('search');

// ===== Инициализация плеера =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadSongs(); // Загружаем песни из JSON
  if (songs.length > 0) {
    resetShuffleQueue();
    loadSong(currentSongIndex);
  }
  setupEventListeners();
});

// ===== Загрузка песен из JSON =====
async function loadSongs() {
  try {
    const response = await fetch('data/songs.json');
    const data = await response.json();
    songs.push(...data);
    renderSongs();
  } catch (error) {
    console.error('Ошибка загрузки песен:', error);
    nowPlaying.textContent = 'Ошибка загрузки списка песен';
  }
}

// ===== Отображение списка песен =====
function renderSongs(filter = '') {
  if (!songList) return;

  const filtered = filter
    ? songs.filter(song =>
        `${song.title} ${song.artist}`.toLowerCase().includes(filter.toLowerCase())
    : songs;

  songList.innerHTML = filtered.map((song, index) => `
    <div class="song-item" data-index="${index}">
      → <i>${song.title}</i> (${song.artist}, ${song.year})
    </div>
  `).join('');

  // Обработчик клика по песне
  document.querySelectorAll('.song-item').forEach(item => {
    item.addEventListener('click', () => {
      currentSongIndex = shuffledQueue.indexOf(Number(item.dataset.index));
      loadSong(currentSongIndex);
      if (!isPlaying) togglePlay();
    });
  });
}

// ===== Управление плеером =====
function loadSong(index) {
  const song = songs[shuffledQueue[index]];
  audioPlayer.src = song.file;
  nowPlaying.innerHTML = `Сейчас играет: → <i>${song.title}</i> (${song.artist}, ${song.year})`;
  if (isPlaying) audioPlayer.play().catch(console.error);
}

function togglePlay() {
  if (!audioPlayer.src) loadSong(currentSongIndex);
  isPlaying ? audioPlayer.pause() : audioPlayer.play().catch(console.error);
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % shuffledQueue.length;
  if (currentSongIndex === 0) resetShuffleQueue();
  loadSong(currentSongIndex);
  if (isPlaying) audioPlayer.play().catch(console.error);
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + shuffledQueue.length) % shuffledQueue.length;
  loadSong(currentSongIndex);
  if (isPlaying) audioPlayer.play().catch(console.error);
}

function resetShuffleQueue() {
  shuffledQueue = [...Array(songs.length).keys()].sort(() => Math.random() - 0.5);
}

// ===== Обработчики событий =====
function setupEventListeners() {
  // Кнопки управления
  playBtn.addEventListener('click', togglePlay);
  nextBtn.addEventListener('click', nextSong);
  prevBtn.addEventListener('click', prevSong);
  repeatBtn.addEventListener('click', () => {
    isRepeating = !isRepeating;
    repeatBtn.classList.toggle('active', isRepeating);
  });

  // Состояние плеера
  audioPlayer.addEventListener('play', () => {
    isPlaying = true;
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  });

  audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  });

  audioPlayer.addEventListener('ended', () => {
    if (isRepeating) {
      audioPlayer.currentTime = 0;
      audioPlayer.play();
    } else {
      nextSong();
    }
  });

  // Поиск
  searchInput?.addEventListener('input', (e) => {
    renderSongs(e.target.value);
  });

  // Горячие клавиши
  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'Space': e.preventDefault(); togglePlay(); break;
      case 'ArrowRight': nextSong(); break;
      case 'ArrowLeft': prevSong(); break;
    }
  });
}
