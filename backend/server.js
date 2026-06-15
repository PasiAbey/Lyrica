const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'lyrics_db.json');

app.use(cors());
app.use(express.json());

// Helper to read local JSON database file
async function readDatabase() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // If the file does not exist, return an empty list
    return [];
  }
}

// Helper to write changes to local JSON database file
async function writeDatabase(data) {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to local JSON database:', err);
  }
}

// Helper to escape special regex characters for safe matching
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * GET /api/songs
 * Returns a list of all stored songs in the local database (sorted newest first)
 */
app.get('/api/songs', async (req, res) => {
  try {
    const songs = await readDatabase();
    // Sort by save date descending
    songs.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    res.json(songs);
  } catch (err) {
    console.error('Error fetching songs from database:', err);
    res.status(500).json({ error: 'Failed to fetch songs from database' });
  }
});

/**
 * GET /api/songs/lyrics
 * Queries the local JSON database. If not found locally, fetches from the external
 * Lyrics.ovh API, stores the metadata and lyrics in the JSON file, and returns it.
 */
app.get('/api/songs/lyrics', async (req, res) => {
  const { artist, title, itunesId, artworkUrl, previewUrl } = req.query;

  if (!artist || !title) {
    return res.status(400).json({ error: 'artist and title query parameters are required' });
  }

  try {
    const songs = await readDatabase();
    let song = null;

    // 1. Try to find the song by its unique iTunes ID if provided
    if (itunesId) {
      song = songs.find(s => String(s.itunesId) === String(itunesId));
    }

    // 2. Fallback: Search by Artist & Title (case-insensitive)
    if (!song) {
      const artistRegex = new RegExp('^' + escapeRegExp(artist) + '$', 'i');
      const titleRegex = new RegExp('^' + escapeRegExp(title) + '$', 'i');
      song = songs.find(s => artistRegex.test(s.artist) && titleRegex.test(s.title));
    }

    // 3. If song is found and already has lyrics cached, return it directly
    if (song && song.lyrics) {
      console.log(`Lyrics database cache hit for: "${song.title}" by ${song.artist}`);
      return res.json(song);
    }

    // 4. Cache miss: Fetch lyrics from public Lyrics.ovh API
    console.log(`Lyrics database cache miss for: "${title}" by ${artist}. Fetching from Lyrics.ovh...`);
    let fetchedLyrics = '';
    try {
      const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.lyrics) {
          fetchedLyrics = data.lyrics.trim();
        }
      }
    } catch (fetchErr) {
      console.warn(`External lyrics API fetch failed for "${title}":`, fetchErr.message);
    }

    // 5. Create or update the song metadata and lyrics in the database
    if (song) {
      // If track metadata existed but was missing lyrics, update it
      song.lyrics = fetchedLyrics;
      if (artworkUrl) song.artworkUrl = artworkUrl;
      if (previewUrl) song.previewUrl = previewUrl;
      if (itunesId) song.itunesId = itunesId;
      song.savedAt = new Date().toISOString();
      console.log(`Updated existing database song with lyrics: "${song.title}"`);
    } else {
      // Create a brand new database record for this song
      song = {
        itunesId: itunesId || undefined,
        title,
        artist,
        artworkUrl: artworkUrl || '',
        previewUrl: previewUrl || '',
        lyrics: fetchedLyrics,
        savedAt: new Date().toISOString()
      };
      songs.push(song);
      console.log(`Saved new song metadata and lyrics to local database: "${song.title}"`);
    }

    // Save database changes back to the JSON file
    await writeDatabase(songs);

    res.json(song);
  } catch (err) {
    console.error('Error handling lyrics query:', err);
    res.status(500).json({ error: 'Internal server error while processing lyrics' });
  }
});

/**
 * POST /api/songs/lyrics
 * Updates or creates custom lyrics for a song in the local database.
 */
app.post('/api/songs/lyrics', async (req, res) => {
  const { artist, title, itunesId, artworkUrl, previewUrl, lyrics } = req.body;

  if (!artist || !title || lyrics === undefined) {
    return res.status(400).json({ error: 'artist, title, and lyrics are required fields' });
  }

  try {
    const songs = await readDatabase();
    let song = null;

    // 1. Try to find the song by itunesId
    if (itunesId) {
      song = songs.find(s => String(s.itunesId) === String(itunesId));
    }

    // 2. Try to find by artist and title (case-insensitive)
    if (!song) {
      const artistRegex = new RegExp('^' + escapeRegExp(artist) + '$', 'i');
      const titleRegex = new RegExp('^' + escapeRegExp(title) + '$', 'i');
      song = songs.find(s => artistRegex.test(s.artist) && titleRegex.test(s.title));
    }

    if (song) {
      // Update lyrics and other fields
      song.lyrics = lyrics.trim();
      if (artworkUrl) song.artworkUrl = artworkUrl;
      if (previewUrl) song.previewUrl = previewUrl;
      if (itunesId) song.itunesId = itunesId;
      song.savedAt = new Date().toISOString();
      console.log(`Manually updated lyrics for: "${song.title}" by ${song.artist}`);
    } else {
      // Create new record
      song = {
        itunesId: itunesId || undefined,
        title,
        artist,
        artworkUrl: artworkUrl || '',
        previewUrl: previewUrl || '',
        lyrics: lyrics.trim(),
        savedAt: new Date().toISOString()
      };
      songs.push(song);
      console.log(`Manually saved new lyrics for: "${song.title}" by ${song.artist}`);
    }

    await writeDatabase(songs);
    res.json(song);
  } catch (err) {
    console.error('Error saving manually updated lyrics:', err);
    res.status(500).json({ error: 'Failed to save lyrics to the database' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Lyrica server running at http://localhost:${PORT}`);
  console.log(`Using local file database: ${DB_FILE}`);
});
