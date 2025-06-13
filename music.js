const playlist = [
  { title: "Там, где небо 1", src: "songs/song1.mp3" },
  { title: "Песня 2", src: "audio/track2.mp3" },
  { title: "Песня 3", src: "audio/track3.mp3" }
];

let currentTrackIndex = 0;

const audio = document.getElementById("audio-player");
const playPauseBtn = document.getElementById("play-pause-btn");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const volumeSlider = document.getElementById("volume-slider");
const nowPlaying = document.getElementById("now-playing");

function loadTrack(index) {
  const track = playlist[index];
  audio.src = track.src;
  nowPlaying.textContent = track.title;
  audio.load();
}

function playPause() {
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = "⏸";
  } else {
    audio.pause();
    playPauseBtn.textContent = "▶";
  }
}

function playNext() {
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  loadTrack(currentTrackIndex);
  audio.play();
  playPauseBtn.textContent = "⏸";
}

function playPrev() {
  currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrackIndex);
  audio.play();
  playPauseBtn.textContent = "⏸";
}

playPauseBtn.addEventListener("click", playPause);
nextBtn.addEventListener("click", playNext);
prevBtn.addEventListener("click", playPrev);

volumeSlider.addEventListener("input", () => {
  audio.volume = parseFloat(volumeSlider.value);
});

// Автоматически проигрывает следующую песню по окончании текущей
audio.addEventListener("ended", playNext);

// Начальная инициализация
window.addEventListener("DOMContentLoaded", () => {
  loadTrack(currentTrackIndex);
  audio.volume = parseFloat(volumeSlider.value);
});
