let songs = [];

async function loadSongs() {
  try {
    const response = await fetch('../data/songs.json');
    songs = await response.json();
    renderSongs();
    return songs;
  } catch (error) {
    console.error('Ошибка загрузки песен:', error);
    return [];
  }
}

function renderSongs(filter = '') {
  const songList = document.getElementById('song-list');
  if (!songList) return;

  const filtered = filter 
    ? songs.filter(song => 
        `${song.title} ${song.artist}`.toLowerCase().includes(filter.toLowerCase())
      )
    : songs;

  songList.innerHTML = filtered.map(song => `
    <div class="song-item" data-file="${song.file}">
      → <i>${song.title}</i> (${song.artist}, ${song.year})
    </div>
  `).join('');
}

// Для поиска (добавьте в index.html поле <input id="search">)
document.getElementById('search')?.addEventListener('input', (e) => {
  renderSongs(e.target.value);
});

export { loadSongs, songs };
