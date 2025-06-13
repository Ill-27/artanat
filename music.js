// Список песен (добавьте свои треки)
const songs = [
  {
    title: "Там, где небо - Мария Зайцева",
    file: "music/Мария_Зайцева_Там_где_небо.mp3"
  },
  {
    title: "Название песни 2",
    file: "music/song2.mp3"
  },
  // Добавьте остальные песни в том же формате
];

// Элементы плеера
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const repeatBtn = document.getElementById('repeat-btn');
const volumeSlider = document.getElementById('volume-slider');
const nowPlaying = document.getElementById('now-playing');

// Переменные состояния
let currentSongIndex = 0;
let isPlaying = false;
let isRepeat = false;

// Инициализация плеера
function initPlayer() {
  // Загрузка случайной песни
  loadRandomSong();
  
  // Обработчики событий
  playBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', prevSong);
  nextBtn.addEventListener('click', nextSong);
  repeatBtn.addEventListener('click', toggleRepeat);
  volumeSlider.addEventListener('input', setVolume);
  
  // События аудио
  audioPlayer.addEventListener('ended', handleSongEnd);
  audioPlayer.addEventListener('timeupdate', updateProgress);
}

// Загрузка случайной песни
function loadRandomSong() {
  currentSongIndex = Math.floor(Math.random() * songs.length);
  const song = songs[currentSongIndex];
  audioPlayer.src = song.file;
  nowPlaying.textContent = song.title;
}

// Воспроизведение/пауза
function togglePlay() {
  if (isPlaying) {
    audioPlayer.pause();
    playBtn.textContent = '▶';
  } else {
    audioPlayer.play()
      .then(() => {
        playBtn.textContent = '⏸';
      })
      .catch(e => console.error("Ошибка воспроизведения:", e));
  }
  isPlaying = !isPlaying;
}

// Следующая песня
function nextSong() {
  loadRandomSong();
  if (isPlaying) audioPlayer.play();
}

// Предыдущая песня
function prevSong() {
  loadRandomSong();
  if (isPlaying) audioPlayer.play();
}

// Повтор
function toggleRepeat() {
  isRepeat = !isRepeat;
  repeatBtn.style.color = isRepeat ? '#ff0' : '#fff';
  audioPlayer.loop = isRepeat;
}

// Громкость
function setVolume() {
  audioPlayer.volume = volumeSlider.value;
}

// Окончание песни
function handleSongEnd() {
  if (!isRepeat) {
    nextSong();
  }
}

// Запуск плеера при загрузке страницы
window.addEventListener('DOMContentLoaded', initPlayer);
document.addEventListener('click', function() {
  audioPlayer.play().catch(e => console.log(e));
}, { once: true });
