/****************************************************************************
 * player.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

// Define browser elements at the top of the script
const playButton = document.getElementById('play-button');
const stopButton = document.getElementById('stop-button');
const resumeButton = document.getElementById('resume-button');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const clipInfo = document.getElementById('clip-info');
const songUiContainer = document.getElementById('song-ui-container');

let currentClipIndex = 0;
let clipTimeout;
let isStopped = false;
let player;
let deviceId;
let token;

function playSpecificClip (index) {

    stopClip(); // Stop the current clip
    currentClipIndex = index; // Set the clip index to the selected one
    playNextClip(); // Play the selected clip
    updateClipInfo(); // Update UI with new clip info

}

function createSongUI() {

    songClips.forEach((clip, index) => {

        const button = document.createElement('button');
        button.textContent = `Play ${index + 1}`;
        button.classList.add('play-button');

        button.addEventListener('click', () => {

            stopButton.disabled = false;
            resumeButton.disabled = true;
            prevButton.disabled = false;
            nextButton.disabled = false;

            playSpecificClip(index);

        });

        songUiContainer.appendChild(button);

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

function connectToPlayer () {

    player = new Spotify.Player({
        name: 'Spotify Clip Player',
        getOAuthToken: cb => { cb(token); }, // Token should be defined above this code
        volume: 0.5
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Ready
    player.addListener('ready', ({ device_id: id }) => {

        deviceId = id;

        console.log('Ready with Device ID', deviceId);

        resetUI();

        playButton.addEventListener('click', () => {
            playClipsSequentially(songClips);
            stopButton.disabled = false;
            resumeButton.disabled = true;
            prevButton.disabled = false;
            nextButton.disabled = false;
        });

        stopButton.addEventListener('click', () => {
            stopClip();
            stopButton.disabled = true;
            resumeButton.disabled = false;
        });

        resumeButton.addEventListener('click', () => {
            resumeClip();
            stopButton.disabled = false;
            resumeButton.disabled = true;
        });

        prevButton.addEventListener('click', () => {
            previousClip();
        });

        nextButton.addEventListener('click', () => {
            nextClip();
        });
    });

    player.connect();

}

function searchTrack(songName, artist) {

    const query = encodeURIComponent(`track:${songName} artist:${artist}`);

    return fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => response.json()).then(data => {

        if (data.tracks.items.length > 0) {

            return data.tracks.items[0].uri;

        } else {

            console.error('Track not found');
            return null;

        }

    });

}

function playClip(trackUri, startTime, clipLength) {

    stopButton.disabled = false;
    resumeButton.disabled = true;

    console.log('Playing:', currentClipIndex);

    updateClipInfo();

    clearTimeout(clipTimeout);

    return fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({
            uris: [trackUri],
            position_ms: startTime * 1000
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    }).then(response => {

        if (response.ok) {

            isStopped = false;

            clipTimeout = setTimeout(() => {

                console.log('Stopping:', currentClipIndex);

                if (!isStopped) {

                    if (currentClipIndex < songClips.length - 1) {

                        currentClipIndex++;
                        playNextClip();

                    } else {
                        
                        stopClip();
                        resetUI(); // Reset UI when the last clip finishes

                    }

                }

            }, clipLength * 1000);
        } else {

            console.error('Failed to play the track');

        }

    });

}

function playNextClip() {

    const clip = songClips[currentClipIndex];

    searchTrack(clip.songName, clip.artist).then(trackUri => {

        if (trackUri) {

            playClip(trackUri, clip.startTime, clip.clipLength);

        } else {

            console.error('Unable to play clip');

        }

    });

}

function playClipsSequentially() {

    currentClipIndex = 0;
    isStopped = false;
    playNextClip();

}

function stopClip() {

    clearTimeout(clipTimeout);

    fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    }).then(() => {

        isStopped = true;

    });

}

function resumeClip() {

    if (isStopped) {

        isStopped = false;
        playNextClip();

    }

}

function previousClip() {

    if (currentClipIndex > 0) {

        currentClipIndex--;
        stopClip();
        playNextClip();

    }

}

function nextClip() {

    if (currentClipIndex < songClips.length - 1) {

        currentClipIndex++;
        stopClip();
        playNextClip();

    }

}

function updateClipInfo() {

    if (currentClipIndex === -1) {

        clipInfo.textContent = `Clip: -`;

    } else {

        clipInfo.textContent = `Clip: ${currentClipIndex + 1} / ${songClips.length}`;

    }

    prevButton.disabled = currentClipIndex === 0;
    nextButton.disabled = currentClipIndex === songClips.length - 1;
}

function resetUI() {

    isStopped = false;
    currentClipIndex = -1;

    clearTimeout(clipTimeout);
    stopClip();
    updateClipInfo();

    stopButton.disabled = true;
    resumeButton.disabled = true;
    prevButton.disabled = true;
    nextButton.disabled = true;

}

// https://developer.spotify.com/dashboard
// https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started

// TODO: Check all the tracks can be played
// TODO: Handle when they're not playable
// TODO: Don't generate quiz until function is called to do so
// TODO: Artist score
// TODO: Select from an array of playlists
// TODO: Paste in playlist URL
// TODO: Combine multiple playlists
