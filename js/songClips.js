/****************************************************************************
 * songClips.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

// https://open.spotify.com/playlist/5Rrf7mqN8uus2AaQQQNdc1

/* global token, prepareUI */
/* global stopButton, resumeButton, prevButton, nextButton, playSpecificClip */

const songUiContainer = document.getElementById('song-ui-container');

// Song clip JSON structure
const fixedSongs = [
    {
        songName: '99 Red Balloons',
        artist: 'Goldfinger',
        startTime: 30,
        clipLength: 5
    },
    {
        songName: 'Undone - The Sweater Song',
        artist: 'Weezer',
        startTime: 60,
        clipLength: 5
    },
    {
        songName: 'September',
        artist: 'Earth, Wind & Fire',
        startTime: 20,
        clipLength: 5
    }
];

const DISTANCE_FROM_START_MS = 10000;
const DISTANCE_FROM_END_MS = 10000;

let songClips = [];

async function getRandomSongsFromSpotifyRadio (playlistId, numberOfSongs, token) {

    const allTracks = [];
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    try {

        // Fetch all tracks from the playlist
        while (nextUrl) {

            const response = await fetch(nextUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {

                throw new Error('Network response was not ok');

            }

            const data = await response.json();
            allTracks.push(...data.items);
            nextUrl = data.next; // Get the next URL if available

        }

        // Randomly select the specified number of songs
        const randomSongs = getRandomSubset(allTracks, numberOfSongs);

        return randomSongs.map(item => {

            const track = item.track;
            const durationMs = track.duration_ms; // Track duration in milliseconds

            // Ensure that the start time is within valid range
            const maxStartTime = Math.max(0, durationMs - DISTANCE_FROM_END_MS - 5000); // Last 10 seconds + 5 seconds clip length
            const minStartTime = DISTANCE_FROM_START_MS; // Avoid the first 10 seconds
            const startTime = Math.floor(Math.random() * (maxStartTime - minStartTime + 1)) + minStartTime;

            // Specific remasters seem to break the search
            const trackName = track.name.split(' - ')[0];

            return {
                songName: trackName,
                // TODO: This may cause issues when guessing the name of an artist for a song with multiple artists
                artist: track.artists.map(artist => artist.name).join(', '),
                uri: track.uri,
                startTime: Math.floor(startTime / 1000), // Convert to seconds
                clipLength: 5 // Always 5 seconds
            };

        });

    } catch (error) {

        console.error('Error fetching songs from Spotify:', error);
        return [];

    }

}

// Helper function to get a random subset of an array
function getRandomSubset (array, size) {

    const shuffled = array.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);

}

async function searchTrack (songName, artist) {

    const query = encodeURIComponent(`track:${songName} artist:${artist}`);

    try {

        const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {

            const data = await response.json();

            console.log(data);

            if (data.tracks.items.length > 0) {

                const track = data.tracks.items[0];

                return track.uri;

            } else {

                console.error('Track not found');
                return null;

            }

        } else {

            console.error('Error fetching song URI:', response.status, response.statusText);
            return null;

        }

    } catch (error) {

        console.error('Error occurred while fetching song URI:', error);
        return null;

    }

}

function createSongUI () {

    songClips.forEach((clip, index) => {

        const playClipButton = document.createElement('button');
        playClipButton.textContent = `Play ${index + 1}`;
        playClipButton.classList.add('play-button', 'btn', 'btn-secondary');
        playClipButton.id = `play-clip-button${index}`;
        playClipButton.disabled = true;

        playClipButton.addEventListener('click', () => {

            stopButton.style.display = '';
            resumeButton.style.display = 'none';
            prevButton.disabled = false;
            nextButton.disabled = false;

            playSpecificClip(index);

        });

        songUiContainer.appendChild(playClipButton);

        // Add song name

        const songNameSpan = document.createElement('span');
        songNameSpan.textContent = '???????';
        songNameSpan.classList.add('song-name-span');
        songNameSpan.style.marginLeft = '5px';

        songUiContainer.appendChild(songNameSpan);

        // Add hyphen between song name and artist

        const hyphenSpan = document.createElement('span');
        hyphenSpan.textContent = '-';
        hyphenSpan.style.marginLeft = '5px';
        hyphenSpan.classList.add('hyphen-span');

        songUiContainer.appendChild(hyphenSpan);

        // Add artist

        const artistSpan = document.createElement('span');
        artistSpan.textContent = '???????';
        artistSpan.classList.add('artist-span');
        artistSpan.style.marginLeft = '5px';

        songUiContainer.appendChild(artistSpan);

        // Add newline

        // TODO: Make this a row
        songUiContainer.appendChild(document.createElement('br'));

    });

}

function processSongList (songs) {

    songClips = songs;

    songClips = songClips.map((clip, index) => ({
        ...clip,
        index
    }));

    // Add URI to each song

    for (let i = 0; i < songClips.length; i++) {

        const clip = songClips[i];

        if (!clip.uri) {

            searchTrack(clip.songName, clip.artist).then(uri => {

                songClips[i].uri = uri;

            });

        }

    }

    createSongUI();

    prepareUI();

}

async function populateClipList (playlistId) {

    console.log('Populating clip list...');

    const songs = await getRandomSongsFromSpotifyRadio(playlistId, 20, token);
    processSongList(songs);

}
