// Replace with your Spotify API credentials
const CLIENT_ID = 'bfbf2e32e47f415f9e500331fdfe17b0';
const CLIENT_SECRET = 'bdecc8a155f34a5a8ea68fde9f535e36';

// Function to perform search
async function searchTracks() {
    const query = document.getElementById('searchInput').value;
    const token = await getAccessToken();

    if (token) {
        const searchUrl = `https://api.spotify.com/v1/search?q=${query}&type=track`;
        const response = await fetch(searchUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayResults(data.tracks.items);
        } else {
            alert('Failed to fetch data');
        }
    } else {
        alert('Failed to get access token');
    }
}

// Function to fetch access token
async function getAccessToken() {
    const authUrl = 'https://accounts.spotify.com/api/token';
    const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
        },
        body: 'grant_type=client_credentials'
    });

    if (response.ok) {
        const data = await response.json();
        return data.access_token;
    } else {
        console.error('Failed to fetch access token');
        return null;
    }
}

// Function to display search results
// Modify the displayResults function to include the audio player setup
function displayResults(tracks) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    tracks.forEach(track => {
        const trackDiv = document.createElement('div');
        trackDiv.classList.add('track');

        const trackInfo = `
            <h3>${track.name}</h3>
            <p>Artist: ${track.artists.map(artist => artist.name).join(', ')}</p>
            <p>Album: ${track.album.name}</p>
            <img src="${track.album.images[0].url}" alt="${track.name} - ${track.artists[0].name}" width="200">
            <audio controls>
                <source src="${track.preview_url}" type="audio/mp3">
                Your browser does not support the audio element.
            </audio>
            <button onclick="fetchLyrics('${track.name}', '${track.artists[0].name}')">Show Lyrics</button>
        `;

        trackDiv.innerHTML = trackInfo;
        resultsDiv.appendChild(trackDiv);
    });
}

// Function to play the full song
function playFullSong(previewUrl) {
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = previewUrl;
    audioPlayer.play();
}

// Function to fetch lyrics
async function fetchLyrics() {
    const artist = document.getElementById('artist').value.trim();
    const track = document.getElementById('track').value.trim();

    if (!artist || !track) {
        alert('Please enter both artist and track names');
        return;
    }

    try {
        const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(track)}`);
        if (!response.ok) {
            throw new Error('Lyrics not found');
        }

        const data = await response.json();
        const lyrics = data.lyrics.replace(/\n/g, '<br>'); // Replace newlines with <br> for HTML display
        document.getElementById('lyrics').innerHTML = `<h2>${artist} - ${track}</h2><p>${lyrics}</p>`;
    } catch (error) {
        console.error('Error fetching lyrics:', error.message);
        alert('Failed to fetch lyrics. Please try again later.');
    }
}