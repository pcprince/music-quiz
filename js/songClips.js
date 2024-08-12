/****************************************************************************
 * songClips.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

// https://open.spotify.com/playlist/5Rrf7mqN8uus2AaQQQNdc1

/* global bootstrap */
/* global token, currentClipIndex */
/* global stopButton, resumeButton, prevButton, nextButton */
/* global prepareUI, resumeClip, stopClip, pauseTimer, resumeTimer, addSecondsToTimer, playSpecificClip */

const songUiContainer = document.getElementById('song-ui-container');

const helpButton = document.getElementById('help-button');
const helpModal = new bootstrap.Modal(document.getElementById('help-modal'), {
    backdrop: 'static',
    keyboard: false
});

const reselectNumberSpan = document.getElementById('reselect-number-span');
const cancelReselectButton = document.getElementById('cancel-reselect-button');
const reselectButton = document.getElementById('reselect-button');

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

function selectRandomClip (durationMs) {

    // Ensure that the start time is within valid range
    const maxStartTime = Math.max(0, durationMs - DISTANCE_FROM_END_MS - 5000); // Last 10 seconds + 5 seconds clip length
    const minStartTime = DISTANCE_FROM_START_MS; // Avoid the first 10 seconds
    let startTime = Math.floor(Math.random() * (maxStartTime - minStartTime + 1)) + minStartTime;
    startTime = Math.floor(startTime / 1000);

    let clipLength = 5000; // Always 5 seconds
    clipLength = Math.floor(clipLength / 1000);

    return {startTime, clipLength};

}

async function getRandomSongsFromPlaylist (playlistId, numberOfSongs, token) {

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

            const randomClip = selectRandomClip(durationMs);

            // Specific remasters seem to break the search
            const trackName = track.name.split(' - ')[0];

            return {
                songName: trackName,
                // FIXME: This may cause issues when guessing the name of an artist for a song with multiple artists. Replace with array and check array
                artist: track.artists.map(artist => artist.name).join(', '),
                durationMs: track.duration_ms,
                uri: track.uri,
                startTime: randomClip.startTime, // Convert to seconds
                clipLength: randomClip.clipLength
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

                return track;

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

async function populateClipList (playlistIdArray, songCount) {

    console.log('Populating clip list...');

    const playListCount = playlistIdArray.length;

    let trackCounts;

    if (playlistIdArray.length === 1) {

        trackCounts = [songCount];

    } else {

        // Calculate how many tracks should come from each array

        const baseValue = Math.floor(songCount / playListCount);
        trackCounts = Array(playListCount).fill(baseValue);

        const remainder = songCount - (baseValue * playListCount);

        trackCounts[playListCount - 1] += remainder;

    }

    songClips = [];

    for (let i = 0; i < playListCount; i++) {

        const playlistId = playlistIdArray[i];
        const trackCount = trackCounts[i];

        const newSongs = await getRandomSongsFromPlaylist(playlistId, trackCount, token);

        // Process songs (add URI and index)

        for (let i = 0; i < newSongs.length; i++) {

            newSongs[i].index = i + songClips.length;

            const clip = newSongs[i];

            if (!clip.uri) {

                searchTrack(clip.songName, clip.artist).then(track => {

                    if (track) {

                        newSongs[i].uri = track.uri;
                        newSongs[i].durationMs = track.durationMs;

                    }

                });

            }

        }

        songClips = songClips.concat(newSongs);

    }

    console.log(songClips);

    createSongUI();

    prepareUI();

}

helpButton.addEventListener('click', () => {

    reselectNumberSpan.innerText = currentClipIndex + 1;

    stopClip();
    pauseTimer();

    helpModal.show();

});

cancelReselectButton.addEventListener('click', () => {

    resumeClip();
    resumeTimer();

    helpModal.hide();

});

reselectButton.addEventListener('click', () => {

    const newRandomClip = selectRandomClip(songClips[currentClipIndex].durationMs);

    console.log('Updated clip ' + currentClipIndex + '. ' + songClips[currentClipIndex].startTime + ' -> ' + newRandomClip.startTime);

    songClips[currentClipIndex].startTime = newRandomClip.startTime;
    songClips[currentClipIndex].clipLength = newRandomClip.clipLength;

    addSecondsToTimer(5);

    resumeClip();
    resumeTimer();

    helpModal.hide();

});
