// Cache DOM Elements (Conditionally present depending on index.html vs lyrics.html)
const homeView = document.getElementById('homeView');
const lyricsView = document.getElementById('lyricsView');
const songsGrid = document.getElementById('songsGrid');
const btnBack = document.getElementById('btnBack');

const coverPhoto = document.getElementById('coverPhoto');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const lyricsContent = document.getElementById('lyricsContent');
const btnPlayDetails = document.getElementById('btnPlayDetails');

// Search & History Elements
const searchInput = document.getElementById('searchInput');
const btnClearSearch = document.getElementById('btnClearSearch');
const btnToggleHistory = document.getElementById('btnToggleHistory');
const btnCloseHistory = document.getElementById('btnCloseHistory');
const historySidebar = document.getElementById('historySidebar');
const historyList = document.getElementById('historyList');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// Audio Player Bar Elements
const audioPlayerBar = document.getElementById('audioPlayerBar');
const playerCover = document.getElementById('playerCover');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const btnPlayPause = document.getElementById('btnPlayPause');
const iconPlay = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');
const playerCurrentTime = document.getElementById('playerCurrentTime');
const playerTimeline = document.getElementById('playerTimeline');
const playerDuration = document.getElementById('playerDuration');
const playerVolume = document.getElementById('playerVolume');
const visualizerCanvas = document.getElementById('visualizerCanvas');

// Audio Playback State & Engine
const audio = new Audio();
audio.crossOrigin = 'anonymous'; // Allow CORS for audio visualizer analysis

let audioCtx = null;
let analyser = null;
let source = null;
let visualizerActive = false;
let currentPlayingSong = null;

// Fallback local playlist of top popular songs (if API fails)
const FALLBACK_PLAYLIST = [
  {
    id: "hello_adele",
    title: "Hello",
    artist: "Adele",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/bf/fb/1b/bffb1b2f-8700-1c6f-c6ad-6bfcc00b3d6f/886445574163.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview113/v4/8d/a1/d1/8da1d1e9-9b1f-5e5d-0394-f0b31944fc33/mzaf_2951821599170878612.std.aac.p.m4a",
    lyrics: null
  },
  {
    id: "shape_of_you",
    title: "Shape of You",
    artist: "Ed Sheeran",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/c6/eb/e6/c6ebe6be-572f-53c0-3e2b-24016a67f706/886446304670.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/21/df/07/21df0747-d5d1-d222-6b95-eb2e59178229/mzaf_8435889601369796677.std.aac.p.m4a",
    lyrics: null
  },
  {
    id: "bad_guy",
    title: "Bad Guy",
    artist: "Billie Eilish",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/91/9f/f0/919ff085-f5f4-3453-61b6-be75a9a83858/19UMGIM16405.rgb.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/f7/a1/9d/f7a19d84-c5a4-5690-ca1a-a5518b52f1f3/mzaf_5527237976722883395.std.aac.p.m4a",
    lyrics: null
  },
  {
    id: "blank_space",
    title: "Blank Space",
    artist: "Taylor Swift",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/f4/38/c8/f438c823-1d01-e2e7-de72-005d548325a8/14UMGIM22368.rgb.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/10/a5/d3/10a5d3f4-3759-9946-b68a-21fc9239d5ee/mzaf_2080351327110996163.std.aac.p.m4a",
    lyrics: null
  },
  {
    id: "blinding_lights",
    title: "Blinding Lights",
    artist: "The Weeknd",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1a/df/76/1adf7687-df50-cf3b-7419-7561be84ad3e/19UMGIM92209.rgb.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/1a/df/76/1adf7687-df50-cf3b-7419-7561be84ad3e/mzaf_10014023796587421115.std.aac.p.m4a",
    lyrics: null
  },
  {
    id: "flowers_miley",
    title: "Flowers",
    artist: "Miley Cyrus",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d9/b4/d2/d9b4d241-d8ec-8fcf-5c8e-a2b16e8ea3cc/196589718428.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview123/v4/0d/3c/6f/0d3c6f66-1c25-bf7d-2b99-9bf8547a46ad/mzaf_4091390494532675988.std.aac.p.m4a",
    lyrics: null
  },
  {
    id: "as_it_was",
    title: "As It Was",
    artist: "Harry Styles",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ec/3b/b6/ec3bb6c2-0749-3665-27a9-519889445100/886449980833.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/66/1b/ec/661beca1-b84f-e2cc-b11c-c7662cfbd4fb/mzaf_6388417757916960100.std.aac.p.m4a",
    lyrics: null
  },
  {
    id: "love_yourself",
    title: "Love Yourself",
    artist: "Justin Bieber",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b4/64/79/b46479b1-bf50-1df6-48ee-590fb0a3a416/15UMGIM26767.rgb.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/bf/25/68/bf2568e2-f703-9d10-db44-e224dbec257f/mzaf_782298980186937213.std.aac.p.m4a",
    lyrics: null
  },
  {
    id: "uptown_funk",
    title: "Uptown Funk",
    artist: "Mark Ronson",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/05/21/df/0521dfb3-7649-43c3-3d44-be1f22d99d3e/886444910603.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/05/21/df/0521dfb3-7649-43c3-3d44-be1f22d99d3e/mzaf_6195537553531393699.std.aac.p.m4a",
    lyrics: null
  },
  {
    id: "someone_you_loved",
    title: "Someone You Loved",
    artist: "Lewis Capaldi",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/91/4e/c3/914ec370-1793-cae9-f06a-ff553a1a9e69/18UMGIM78364.rgb.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview114/v4/91/4e/c3/914ec370-1793-cae9-f06a-ff553a1a9e69/mzaf_10526707833077755106.std.aac.p.m4a",
    lyrics: null
  }
];

// Fetch Top Playlist from iTunes Store Charts on Load
async function loadLibraryData() {
  if (!homeView) return; // Only execute on the Home Library view

  try {
    const response = await fetch('https://itunes.apple.com/us/rss/topsongs/limit=10/json');
    if (!response.ok) throw new Error('iTunes Charts Fetch Failed');

    const data = await response.json();
    const chartSongs = data.feed.entry;

    if (!chartSongs || !chartSongs.length) {
      throw new Error('No songs found in feed');
    }

    // Map to normalized SONG format
    const dynamicSongs = chartSongs.map(song => {
      const images = song['im:image'];
      const rawImg = images && images.length ? images[images.length - 1].label : '';
      const highResArt = rawImg.replace(/\/\d+x\d+/, '/600x600');

      let previewUrl = '';
      if (song.link && song.link.length) {
        const audioLink = song.link.find(l => l.attributes && l.attributes.title === "Preview");
        if (audioLink) previewUrl = audioLink.attributes.href;
      } else if (song.link && song.link.attributes && song.link.attributes.title === "Preview") {
        previewUrl = song.link.attributes.href;
      }

      return {
        id: song.id.attributes['im:id'],
        title: song['im:name'].label,
        artist: song['im:artist'].label,
        artworkUrl: highResArt,
        previewUrl: previewUrl,
        lyrics: null
      };
    });

    renderLibraryGrid(dynamicSongs);
  } catch (err) {
    console.warn("Could not retrieve iTunes top playlist. Loading fallback library view:", err);
    renderLibraryGrid(FALLBACK_PLAYLIST);
  }
}

// Render Song Cards Grid
function renderLibraryGrid(playlist) {
  if (!songsGrid) return;
  songsGrid.innerHTML = "";
  songsGrid.classList.remove('hidden'); // Show the grid when results are ready

  playlist.forEach(song => {
    const tile = document.createElement('div');
    tile.className = 'song-tile';
    tile.innerHTML = `
      <img class="tile-cover" crossorigin="anonymous" src="${song.artworkUrl || 'https://placehold.co/600x600/100c1e/ffffff?text=' + encodeURIComponent(song.title)}" alt="${song.title}">
      <div class="tile-meta">
        <h3 class="tile-title">${song.title}</h3>
        <p class="tile-artist">${song.artist}</p>
      </div>
    `;

    tile.addEventListener('click', () => {
      // Navigate to lyrics.html with track variables passed as query parameters
      const params = new URLSearchParams();
      params.set('id', song.id);
      params.set('title', song.title);
      params.set('artist', song.artist);
      params.set('artwork', song.artworkUrl);
      params.set('preview', song.previewUrl || '');
      window.location.href = `lyrics.html?${params.toString()}`;
    });

    songsGrid.appendChild(tile);
  });
}

// Search songs using iTunes Search API via JSONP (Dynamic Script Tags)
function searchSongs(query) {
  if (!songsGrid) return;

  songsGrid.classList.remove('hidden'); // Reveal grid while loading
  songsGrid.innerHTML = `
    <div class="loader-container">
      <div class="spinner"></div>
      <p>Searching for "${query}" on iTunes...</p>
    </div>
  `;

  const callbackName = 'itunesCallback_' + Math.round(1000000 * Math.random());

  window[callbackName] = function (data) {
    // Cleanup JSONP artifacts
    delete window[callbackName];
    const script = document.getElementById(callbackName);
    if (script) script.remove();

    const results = data.results;

    if (!results || results.length === 0) {
      songsGrid.innerHTML = `
        <div class="error-container">
          <h3 class="error-title">No Results Found</h3>
          <p class="error-desc">We couldn't find any songs matching "${query}". Try refining your search.</p>
        </div>
      `;
      return;
    }

    // Sort results by how closely they match the query
    const lowerQuery = query.toLowerCase();
    results.sort((a, b) => {
      const getScore = (track) => {
        const title = (track.trackName || '').toLowerCase();
        const artist = (track.artistName || '').toLowerCase();

        let score = 0;

        // Title matching scoring
        if (title === lowerQuery) {
          score += 100;
        } else if (title.startsWith(lowerQuery + ' ')) {
          score += 80;
        } else if (title.startsWith(lowerQuery)) {
          score += 70;
        } else if (title.includes(lowerQuery)) {
          score += 40;
        }

        // Artist matching scoring
        if (artist === lowerQuery) {
          score += 90;
        } else if (artist.startsWith(lowerQuery + ' ')) {
          score += 60;
        } else if (artist.startsWith(lowerQuery)) {
          score += 50;
        } else if (artist.includes(lowerQuery)) {
          score += 30;
        }

        return score;
      };

      return getScore(b) - getScore(a);
    });

    const mapped = results.map(track => ({
      id: track.trackId,
      title: track.trackName,
      artist: track.artistName,
      artworkUrl: track.artworkUrl100 ? track.artworkUrl100.replace('100x100', '600x600') : '',
      previewUrl: track.previewUrl,
      lyrics: null
    }));

    renderLibraryGrid(mapped);
  };

  // Create dynamic script tag for JSONP request
  const scriptTag = document.createElement('script');
  scriptTag.id = callbackName;
  scriptTag.src = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=18&callback=${callbackName}`;

  scriptTag.onerror = function () {
    delete window[callbackName];
    scriptTag.remove();
    songsGrid.innerHTML = `
      <div class="error-container">
        <h3 class="error-title">Search Error</h3>
        <p class="error-desc">There was an issue retrieving search results. Please check your internet connection.</p>
      </div>
    `;
  };

  document.body.appendChild(scriptTag);
}

// Search keydown listener
if (searchInput) {
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = searchInput.value.trim();
      if (val) {
        searchSongs(val);
        btnClearSearch.classList.remove('hidden');
      }
    }
  });

  searchInput.addEventListener('input', () => {
    if (searchInput.value.trim() === "") {
      btnClearSearch.classList.add('hidden');
      // Hide the grid when search is cleared — home page is clean by default
      if (songsGrid) {
        songsGrid.classList.add('hidden');
        songsGrid.innerHTML = '';
      }
    } else {
      btnClearSearch.classList.remove('hidden');
    }
  });
}

// Clear Search Handler
if (btnClearSearch) {
  btnClearSearch.addEventListener('click', () => {
    searchInput.value = "";
    btnClearSearch.classList.add('hidden');
    // Hide the grid when search is cleared
    if (songsGrid) {
      songsGrid.classList.add('hidden');
      songsGrid.innerHTML = '';
    }
  });
}

// Recently Viewed Sidebar History Storage
function getHistory() {
  const data = localStorage.getItem('lyrica_history');
  return data ? JSON.parse(data) : [];
}

function addToHistory(song) {
  let list = getHistory();
  // Remove duplicate
  list = list.filter(item => String(item.id) !== String(song.id) && item.title !== song.title);
  // Unshift new item
  list.unshift({
    id: song.id,
    title: song.title,
    artist: song.artist,
    artworkUrl: song.artworkUrl,
    previewUrl: song.previewUrl
  });
  // Cap at 15 items
  if (list.length > 15) list.pop();
  localStorage.setItem('lyrica_history', JSON.stringify(list));
  renderHistoryUI();
}

function renderHistoryUI() {
  if (!historyList) return;
  const list = getHistory();

  if (list.length === 0) {
    historyList.innerHTML = `<p class="empty-history">No songs viewed yet</p>`;
    return;
  }

  historyList.innerHTML = "";
  list.forEach(song => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <img class="history-item-cover" src="${song.artworkUrl || 'https://placehold.co/100x100/100c1e/ffffff?text=Cover'}" alt="Cover">
      <div class="history-item-meta">
        <h4 class="history-item-title">${song.title}</h4>
        <p class="history-item-artist">${song.artist}</p>
      </div>
    `;
    item.addEventListener('click', () => {
      closeSidebar();
      // Redirect to the clicked history track page
      const params = new URLSearchParams();
      params.set('id', song.id);
      params.set('title', song.title);
      params.set('artist', song.artist);
      params.set('artwork', song.artworkUrl);
      params.set('preview', song.previewUrl || '');
      window.location.href = `lyrics.html?${params.toString()}`;
    });
    historyList.appendChild(item);
  });
}

function toggleSidebar() {
  if (!historySidebar) return;
  const isClosed = historySidebar.classList.contains('closed');
  if (isClosed) {
    openSidebar();
  } else {
    closeSidebar();
  }
}

function openSidebar() {
  if (!historySidebar) return;
  historySidebar.classList.remove('closed');
  sidebarOverlay.classList.remove('hidden');
  renderHistoryUI();
}

function closeSidebar() {
  if (!historySidebar) return;
  historySidebar.classList.add('closed');
  sidebarOverlay.classList.add('hidden');
}

if (btnToggleHistory) btnToggleHistory.addEventListener('click', toggleSidebar);
if (btnCloseHistory) btnCloseHistory.addEventListener('click', closeSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

// Parse Query Parameters on lyrics.html View Load
async function loadLyricsFromQuery() {
  if (!lyricsView) return; // Only execute on lyrics page

  const params = new URLSearchParams(window.location.search);
  const song = {
    id: params.get('id'),
    title: params.get('title') || 'Unknown Title',
    artist: params.get('artist') || 'Unknown Artist',
    artworkUrl: params.get('artwork') || '',
    previewUrl: params.get('preview') || '',
    lyrics: null
  };

  if (!params.get('id') && song.title === 'Unknown Title') {
    lyricsContent.innerHTML = `
      <div class="error-container">
        <h3 class="error-title">No Song Selected</h3>
        <p class="error-desc">Please go back to the library and select a song.</p>
      </div>
    `;
    return;
  }

  // Populate metadata titles & attributes
  songTitle.textContent = song.title;
  artistName.textContent = song.artist;
  songTitle.setAttribute('data-song-id', song.id);
  songTitle.setAttribute('data-preview-url', song.previewUrl);

  // Save to recently viewed history sidebar log
  addToHistory(song);

  // Setup onload and crossorigin BEFORE setting src to prevent race conditions and CORS cache issues
  if (song.artworkUrl) {
    coverPhoto.crossOrigin = 'anonymous';
    coverPhoto.onload = () => {
      extractAndApplyColors(coverPhoto);
    };
    coverPhoto.onerror = () => {
      console.warn("Cover photo load failed, applying fallback background");
      document.body.style.backgroundImage = 'linear-gradient(-45deg, #090714, #15102a)';
    };

    // Apply cover artwork with cache buster query parameter to bypass non-CORS cached images
    const busterUrl = song.artworkUrl ? song.artworkUrl + (song.artworkUrl.includes('?') ? '&' : '?') + 'cors=1' : '';
    coverPhoto.src = busterUrl;
    coverPhoto.alt = `${song.title} Cover Photo`;
  } else {
    document.body.style.backgroundImage = 'linear-gradient(-45deg, #090714, #15102a)';
    coverPhoto.src = 'https://placehold.co/600x600/100c1e/ffffff?text=No+Cover';
  }

  // Load lyrics dynamically
  lyricsContent.innerHTML = `
    <div class="loader-container">
      <div class="spinner"></div>
      <p>Searching lyrics for "${song.title}" from database...</p>
    </div>
  `;

  try {
    const lyrics = await fetchLyrics(song);
    if (lyrics) {
      lyricsContent.textContent = lyrics;
    } else {
      showNoLyricsError(song.title, song.artist);
    }
  } catch (e) {
    showNoLyricsError(song.title, song.artist);
  }

  // Sync the detail play button UI immediately on load
  updateDetailsPlayButtonUI();
}

// Asynchronously Fetch Lyrics and Metadata from Backend Database
async function fetchLyrics(song) {
  try {
    const params = new URLSearchParams();
    params.set('artist', song.artist);
    params.set('title', song.title);
    if (song.id) params.set('itunesId', song.id);
    if (song.artworkUrl) params.set('artworkUrl', song.artworkUrl);
    if (song.previewUrl) params.set('previewUrl', song.previewUrl);

    const res = await fetch(`/api/songs/lyrics?${params.toString()}`);
    if (!res.ok) throw new Error("Backend API error");

    const data = await res.json();
    return data.lyrics ? data.lyrics.trim() : null;
  } catch (err) {
    console.warn(`Could not fetch lyrics for ${song.title} from backend:`, err);
    return null;
  }
}

function showNoLyricsError(title, artist) {
  lyricsContent.innerHTML = `
    <div class="error-container">
      <h3 class="error-title">Lyrics Not Found</h3>
      <p class="error-desc">We couldn't locate public lyrics for "${title}" by ${artist} on Lyrics.ovh.</p>
      <button id="btnAddLyrics" class="add-lyrics-btn">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Add Lyrics</span>
      </button>
    </div>
  `;

  const btnAddLyrics = document.getElementById('btnAddLyrics');
  if (btnAddLyrics) {
    btnAddLyrics.onclick = () => {
      showAddLyricsForm(title, artist);
    };
  }
}

function showAddLyricsForm(title, artist) {
  lyricsContent.innerHTML = `
    <div class="add-lyrics-form-container">
      <h3 class="form-title">Add Lyrics for "${title}"</h3>
      <p class="form-subtitle">Type or paste the lyrics for this song below.</p>
      <textarea id="lyricsInputText" class="lyrics-input-textarea" placeholder="Enter lyrics here..." rows="12"></textarea>
      <div class="form-actions">
        <button id="btnSaveLyrics" class="save-lyrics-btn">Save Lyrics</button>
        <button id="btnCancelAdd" class="cancel-lyrics-btn">Cancel</button>
      </div>
    </div>
  `;

  const btnSaveLyrics = document.getElementById('btnSaveLyrics');
  const btnCancelAdd = document.getElementById('btnCancelAdd');
  const lyricsInputText = document.getElementById('lyricsInputText');

  if (btnCancelAdd) {
    btnCancelAdd.onclick = () => {
      showNoLyricsError(title, artist);
    };
  }

  if (btnSaveLyrics) {
    btnSaveLyrics.onclick = async () => {
      const customLyrics = lyricsInputText.value.trim();
      if (!customLyrics) {
        alert("Please enter some lyrics first!");
        return;
      }

      btnSaveLyrics.disabled = true;
      btnSaveLyrics.textContent = "Saving...";

      const success = await saveLyricsToBackend(title, artist, customLyrics);

      if (success) {
        lyricsContent.textContent = customLyrics;
      } else {
        alert("Failed to save lyrics. Please try again.");
        btnSaveLyrics.disabled = false;
        btnSaveLyrics.textContent = "Save Lyrics";
      }
    };
  }
}

async function saveLyricsToBackend(title, artist, lyrics) {
  try {
    const params = new URLSearchParams(window.location.search);
    const itunesId = params.get('id');
    const artworkUrl = params.get('artwork') || '';
    const previewUrl = params.get('preview') || '';

    const res = await fetch(`/api/songs/lyrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        artist,
        title,
        itunesId,
        artworkUrl,
        previewUrl,
        lyrics
      })
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to save custom lyrics to database:", err);
    return false;
  }
}

// Extract Colors & Set Animated Gradient
function extractAndApplyColors(imgEl) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 5;
    canvas.height = 5;

    ctx.drawImage(imgEl, 0, 0, 5, 5);
    const imgData = ctx.getImageData(0, 0, 5, 5).data;

    const coordinates = [
      { idx: 24 }, // (1,1)
      { idx: 72 }, // (3,3)
      { idx: 64 }, // (1,3)
      { idx: 32 }, // (3,1)
      { idx: 48 }  // (2,2)
    ];

    const candidates = coordinates.map(c => {
      const r = imgData[c.idx], g = imgData[c.idx + 1], b = imgData[c.idx + 2];
      const hsl = rgbToHsl(r, g, b);
      return { h: hsl.h, s: hsl.s, l: hsl.l };
    });

    let bestPair = [candidates[0], candidates[1]];
    let maxDifference = -1;

    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        let hueDiff = Math.abs(candidates[i].h - candidates[j].h);
        if (hueDiff > 180) hueDiff = 360 - hueDiff;
        const satDiff = Math.abs(candidates[i].s - candidates[j].s);
        const lightDiff = Math.abs(candidates[i].l - candidates[j].l);

        const difference = hueDiff * 1.0 + satDiff * 1.5 + lightDiff * 2.5;
        if (difference > maxDifference) {
          maxDifference = difference;
          bestPair = [candidates[i], candidates[j]];
        }
      }
    }

    // If the two selected colors are too similar, shift the second one dynamically
    if (maxDifference < 15) {
      bestPair[1].h = (bestPair[0].h + 40) % 360;
      bestPair[1].s = Math.min(bestPair[0].s + 15, 100);
      bestPair[1].l = bestPair[0].l > 50 ? Math.max(bestPair[0].l - 20, 0) : Math.min(bestPair[0].l + 20, 100);
    }

    const color1 = `hsl(${bestPair[0].h}, ${bestPair[0].s}%, ${bestPair[0].l}%)`;
    const color2 = `hsl(${bestPair[1].h}, ${bestPair[1].s}%, ${bestPair[1].l}%)`;

    document.body.style.backgroundImage = `linear-gradient(-45deg, ${color1}, ${color2})`;

    // Adjust text contrast dynamically based on average background lightness
    const avgLightness = (bestPair[0].l + bestPair[1].l) / 2;
    if (avgLightness > 55) {
      // Light background: use dark text
      document.body.style.setProperty('--text-color', '#100c1e');
      document.body.style.setProperty('--text-color-muted', 'rgba(16, 12, 30, 0.65)');
      document.body.style.setProperty('--text-color-lyrics', 'rgba(16, 12, 30, 0.88)');
      document.body.style.setProperty('--back-btn-color', 'rgba(16, 12, 30, 0.6)');
      document.body.style.setProperty('--spinner-border', 'rgba(16, 12, 30, 0.15)');
      document.body.style.setProperty('--spinner-top', '#100c1e');
    } else {
      // Dark background: use light text (clear inline properties to use css fallbacks)
      document.body.style.removeProperty('--text-color');
      document.body.style.removeProperty('--text-color-muted');
      document.body.style.removeProperty('--text-color-lyrics');
      document.body.style.removeProperty('--back-btn-color');
      document.body.style.removeProperty('--spinner-border');
      document.body.style.removeProperty('--spinner-top');
    }
  } catch (e) {
    console.warn("Color extraction failed, using fallback dark gradient:", e);
    document.body.style.backgroundImage = 'linear-gradient(-45deg, #090714, #15102a)';

    // Clear theme properties in fallback
    document.body.style.removeProperty('--text-color');
    document.body.style.removeProperty('--text-color-muted');
    document.body.style.removeProperty('--text-color-lyrics');
    document.body.style.removeProperty('--back-btn-color');
    document.body.style.removeProperty('--spinner-border');
    document.body.style.removeProperty('--spinner-top');
  }
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Persistent Audio Player State Management
function savePlayerState() {
  if (!currentPlayingSong) return;

  const state = {
    song: currentPlayingSong,
    currentTime: audio.currentTime,
    volume: audio.volume,
    isPlaying: !audio.paused
  };
  localStorage.setItem('lyrica_player_state', JSON.stringify(state));
}

function loadPlayerState() {
  const data = localStorage.getItem('lyrica_player_state');
  if (!data) return;

  try {
    const state = JSON.parse(data);
    if (!state || !state.song) return;

    currentPlayingSong = state.song;
    audio.src = state.song.previewUrl;
    audio.volume = state.volume;
    playerVolume.value = state.volume;

    // Restore playback head once loaded
    const targetTime = state.currentTime;
    audio.addEventListener('loadedmetadata', function onLoaded() {
      audio.currentTime = targetTime;
      audio.removeEventListener('loadedmetadata', onLoaded);
    });

    // Update player UI elements
    playerCover.src = state.song.artworkUrl || 'https://placehold.co/100x100/100c1e/ffffff?text=Cover';
    playerTitle.textContent = state.song.title;
    playerArtist.textContent = state.song.artist;

    // Show player bar
    audioPlayerBar.classList.remove('hidden');

    // Sync buttons
    updatePlayPauseUI(false); // Paused by default to satisfy browser autoplay security
  } catch (e) {
    console.warn("Failed to load player state:", e);
  }
}

// Audio Player Functions
function loadAndPlayPreview(song) {
  if (!song.previewUrl) {
    alert("Audio preview not available for this song.");
    return;
  }

  currentPlayingSong = song;
  audio.src = song.previewUrl;

  playerCover.src = song.artworkUrl || 'https://placehold.co/100x100/100c1e/ffffff?text=Cover';
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;

  audioPlayerBar.classList.remove('hidden');

  initAudioCtx();

  audio.play()
    .then(() => {
      updatePlayPauseUI(true);
      updateDetailsPlayButtonUI();
    })
    .catch(err => {
      console.warn("Autoplay block or preview load failed:", err);
    });
}

function togglePlayPause() {
  if (audio.paused) {
    initAudioCtx();
    audio.play()
      .then(() => {
        updatePlayPauseUI(true);
        updateDetailsPlayButtonUI();
      })
      .catch(e => console.warn(e));
  } else {
    audio.pause();
    updatePlayPauseUI(false);
    updateDetailsPlayButtonUI();
  }
}

function updatePlayPauseUI(isPlaying) {
  if (isPlaying) {
    iconPlay.classList.add('hidden');
    iconPause.classList.remove('hidden');
  } else {
    iconPlay.classList.remove('hidden');
    iconPause.classList.add('hidden');
  }
}

function updateDetailsPlayButtonUI() {
  if (!btnPlayDetails) return;
  const activeSongId = songTitle.getAttribute('data-song-id');

  const span = btnPlayDetails.querySelector('span');
  const svg = btnPlayDetails.querySelector('svg');

  if (currentPlayingSong && String(currentPlayingSong.id) === String(activeSongId) && !audio.paused) {
    span.textContent = "Pause Preview";
    svg.innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
  } else {
    span.textContent = "Play Preview";
    svg.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
  }
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Audio Player Event Listeners
audio.addEventListener('timeupdate', () => {
  if (!isNaN(audio.duration)) {
    const percent = (audio.currentTime / audio.duration) * 100;
    playerTimeline.value = percent;
    playerCurrentTime.textContent = formatTime(audio.currentTime);
  }
});

audio.addEventListener('loadedmetadata', () => {
  playerDuration.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
  updatePlayPauseUI(false);
  updateDetailsPlayButtonUI();
  playerTimeline.value = 0;
  playerCurrentTime.textContent = "0:00";
});

audio.addEventListener('play', savePlayerState);
audio.addEventListener('pause', savePlayerState);
audio.addEventListener('volumechange', savePlayerState);

playerTimeline.addEventListener('input', () => {
  if (!isNaN(audio.duration)) {
    audio.currentTime = (playerTimeline.value / 100) * audio.duration;
  }
});

playerVolume.addEventListener('input', () => {
  audio.volume = playerVolume.value;
});

if (btnPlayPause) btnPlayPause.addEventListener('click', togglePlayPause);

// Detail Screen "Play Preview" Button Trigger
if (btnPlayDetails) {
  btnPlayDetails.addEventListener('click', () => {
    const activeSongId = songTitle.getAttribute('data-song-id');
    const activePreviewUrl = songTitle.getAttribute('data-preview-url');

    if (currentPlayingSong && String(currentPlayingSong.id) === String(activeSongId)) {
      togglePlayPause();
    } else {
      const activeSong = {
        id: activeSongId,
        title: songTitle.textContent,
        artist: artistName.textContent,
        artworkUrl: coverPhoto.src.replace(/\?cors=1$/, ''),
        previewUrl: activePreviewUrl
      };
      loadAndPlayPreview(activeSong);
    }
  });
}

// Save state on unload/page navigation
window.addEventListener('pagehide', savePlayerState);
window.addEventListener('beforeunload', savePlayerState);

// Web Audio API and Dynamic Canvas Visualizer
function initAudioCtx() {
  if (audioCtx) return;

  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64; // Small and clean visualizer
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    startVisualizerLoop();
  } catch (err) {
    console.warn("Could not create Web Audio context. Falling back to simulated visualizer:", err);
    startSimulatedVisualizer();
  }
}

function startVisualizerLoop() {
  if (visualizerActive) return;
  visualizerActive = true;

  const ctx = visualizerCanvas.getContext('2d');
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    requestAnimationFrame(draw);

    if (!audio.paused) {
      analyser.getByteFrequencyData(dataArray);
    } else {
      for (let i = 0; i < bufferLength; i++) {
        dataArray[i] = Math.max(dataArray[i] - 5, 0); // Decay
      }
    }

    ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

    const barWidth = (visualizerCanvas.width / bufferLength) * 1.6;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * visualizerCanvas.height * 0.9;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + (dataArray[i] / 255) * 0.75})`;
      ctx.fillRect(x, visualizerCanvas.height - barHeight, barWidth - 2, barHeight);

      x += barWidth;
    }
  }

  draw();
}

function startSimulatedVisualizer() {
  if (visualizerActive) return;
  visualizerActive = true;

  const ctx = visualizerCanvas.getContext('2d');
  let angle = 0;

  function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

    const numBars = 16;
    const barWidth = visualizerCanvas.width / numBars;

    for (let i = 0; i < numBars; i++) {
      let amp = 0;
      if (!audio.paused) {
        amp = Math.sin(angle + i * 0.4) * 0.4 + 0.6;
        amp += Math.cos(angle * 1.5 - i * 0.2) * 0.2;
        amp = Math.max(amp * visualizerCanvas.height * 0.85, 2);
      } else {
        amp = 2; // Flat line
      }

      ctx.fillStyle = `rgba(255, 255, 255, ${audio.paused ? 0.15 : 0.4 + (amp / visualizerCanvas.height) * 0.4})`;
      ctx.fillRect(i * barWidth, visualizerCanvas.height - amp, barWidth - 2, amp);
    }

    if (!audio.paused) {
      angle += 0.15;
    }
  }

  draw();
}

// Run Init on Load
window.addEventListener('DOMContentLoaded', () => {
  loadPlayerState();  // Restore bottom player state if active
  loadLyricsFromQuery(); // Parse query (will return immediately on index.html)
  renderHistoryUI();  // Initial history load
});
