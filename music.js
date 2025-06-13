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
const repeatBtn = document.getElementById('repeat-btn');
const volumeSlider = document.getElementById('volume-slider');
const nowPlaying = document.getElementById('now-playing');

// Состояние
let currentSongIndex = 0;
let isPlaying = false;
let isRepeating = false;

// Загрузка песни (без воспроизведения!)
function loadSong(index) {
  const song = songs[index];
  audioPlayer.src = song.file;
  nowPlaying.textContent = song.title;
  isPlaying = false;
  playBtn.textContent = '▶'; // Обновим кнопку
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

// Кнопка Play/Pause
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

// Повтор
repeatBtn.addEventListener('click', () => {
  isRepeating = !isRepeating;
  repeatBtn.style.color = isRepeating ? 'lime' : '#ff0';
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

// Инициализация — просто загружаем песню, НО НЕ ИГРАЕМ!
document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('audio-player');
  const volumeSlider = document.getElementById('volume-slider');

  volumeSlider.addEventListener('input', () => {
    audio.volume = parseFloat(volumeSlider.value);
  });
});
