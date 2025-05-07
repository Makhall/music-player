let player;
let playerReady = false;
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isLoop = false;
let playlist = [];

// Load from localStorage if exists
const savedPlaylist = localStorage.getItem("playlist");
if (savedPlaylist) {
  playlist = JSON.parse(savedPlaylist);
} else {
  // Default fallback
  playlist = [{ id: "98zHKN-xSHk", title: "Blue", artist: "Yung Kai" }];
  localStorage.setItem("playlist", JSON.stringify(playlist));
}
renderPlaylist();

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "300",
    width: "500",
    videoId: playlist[currentIndex].id,
    events: {
      onReady: () => {
        playerReady = true;
        fetchLyrics();
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.ENDED) {
          isLoop ? playCurrent() : nextSong();
        }
      },
    },
  });
}

function playCurrent() {
  player.loadVideoById(playlist[currentIndex].id);
  isPlaying = true;
  fetchLyrics();
  renderPlaylist();
}

function togglePlayPause() {
  if (!playerReady) {
    alert("Player is not ready yet!");
    return;
  }
  isPlaying ? player.pauseVideo() : player.playVideo();
  isPlaying = !isPlaying;
}

function nextSong() {
  currentIndex = isShuffle
    ? Math.floor(Math.random() * playlist.length)
    : (currentIndex + 1) % playlist.length;
  playCurrent();
}

function prevSong() {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  playCurrent();
}

function volumeUp() {
  player.setVolume(Math.min(player.getVolume() + 10, 100));
}

function volumeDown() {
  player.setVolume(Math.max(player.getVolume() - 10, 0));
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  alert("Shuffle " + (isShuffle ? "On" : "Off"));
}

function toggleLoop() {
  isLoop = !isLoop;
  alert("Loop " + (isLoop ? "On" : "Off"));
}

function fetchLyrics() {
  const { title, artist } = playlist[currentIndex];
  fetch(
    `https://api.lyrics.ovh/v1/${encodeURIComponent(
      artist
    )}/${encodeURIComponent(title)}`
  )
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("lyrics").innerText =
        data.lyrics || "Lyrics not found.";
    })
    .catch(() => {
      document.getElementById("lyrics").innerText = "Lyrics not found.";
    });
}

// 🔍 YouTube Search Integration
const apiKey = "AIzaSyBwtOmA3srCeufoBv2C6SgWoVowKVNCrec"; // replace this with your real API key

function searchYouTube() {
  const query = document.getElementById("searchQuery").value;
  if (!query) return alert("Please enter a search term.");

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    query
  )}&type=video&maxResults=5&key=${apiKey}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => showSearchResults(data.items))
    .catch((err) => console.error("YouTube Search Error:", err));
}

function showSearchResults(results) {
  const list = document.getElementById("searchResults");
  list.innerHTML = "";

  results.forEach((item) => {
    const videoId = item.id.videoId;
    const title = item.snippet.title;
    const artist = title.split("-")[0].trim();

    const li = document.createElement("li");
    li.innerHTML = `
          <strong>${title}</strong><br>
          Artist: ${artist}<br>
          <button onclick="addToPlaylist('${videoId}', \`${title.replace(
      /'/g,
      "\\'"
    )}\`, \`${artist.replace(/'/g, "\\'")}\`)">➕ Add to Playlist</button>
        `;
    list.appendChild(li);
  });
}

function addToPlaylist(id, title, artist) {
  playlist.push({ id, title, artist });
  localStorage.setItem("playlist", JSON.stringify(playlist)); // save
  renderPlaylist();
  alert(`Added "${title}" to playlist.`);

  // Optional: auto play
  if (playlist.length === 1) {
    currentIndex = 0;
    playCurrent();
  }
}

function clearPlaylist() {
  if (!confirm("Are you sure you want to clear your playlist?")) return;

  playlist = [];
  localStorage.removeItem("playlist");

  // Stop player
  if (player) {
    player.stopVideo();
  }

  currentIndex = 0;
  isPlaying = false;

  alert("Playlist cleared.");
}

function renderPlaylist() {
  const list = document.getElementById("playlistDisplay");
  list.innerHTML = "";

  playlist.forEach((song, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
    ${index === currentIndex ? "▶️" : "🎵"}
    <strong>${song.title}</strong> by ${song.artist}
    <button onclick="playFromIndex(${index})">Play</button>
  `;
    list.appendChild(li);
  });
}
function playFromIndex(index) {
  currentIndex = index;
  playCurrent();
}
