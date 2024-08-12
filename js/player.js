/****************************************************************************
 * player.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

/* global Spotify */
/* global token, songClips, updateGuessUI */
/* global helpButton */
/* global gameStarted */

// Define browser elements at the top of the script
const stopButton = document.getElementById('stop-button');
const resumeButton = document.getElementById('resume-button');

const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');

const clipInfo = document.getElementById('clip-info');

let currentClipIndex = 0;
let clipTimeout;
let isStopped = false;
let player;
let deviceId;

let retryStopCount = 0;
const MAX_STOP_ATTEMPTS = 3;

let retryPlaybackCount = 0;
const MAX_PLAYBACK_ATTEMPTS = 3;

function playSpecificClip (index) {

    currentClipIndex = index;
    playCurrentClip();
    updateClipInfo();

}

function setStopResumeShown (stopShown) {

    stopButton.style.display = stopShown ? '' : 'none';
    resumeButton.style.display = stopShown ? 'none' : '';

}

function playAll () {

    currentClipIndex = 0;
    playCurrentClip();

    stopButton.disabled = false;
    resumeButton.disabled = true;
    setStopResumeShown(true);

    prevButton.disabled = false;
    nextButton.disabled = false;

}

function connectToPlayer (readyCallback) {

    player = new Spotify.Player({
        name: 'Spotify Clip Player',
        getOAuthToken: cb => {

            cb(token);

        },
        volume: 0.5
    });

    // Error handling

    /* eslint-disable padded-blocks, block-spacing */
    player.addListener('initialization_error', ({message}) => {console.error(message);});
    player.addListener('authentication_error', ({message}) => {console.error(message);});
    player.addListener('account_error', ({message}) => {console.error(message);});
    player.addListener('playback_error', async ({message}) => {

        console.error(message);

        if (!gameStarted) {

            return;

        }

        if (retryPlaybackCount < MAX_PLAYBACK_ATTEMPTS) {

            // If track fails to play, try again a couple of times with a 1 second delay between each attempt

            retryPlaybackCount++;
            console.log('Retrying...');

            await new Promise(resolve => setTimeout(resolve, 1000));

            playSpecificClip(currentClipIndex);

        } else {

            console.error('Max retries reached. Giving up.');
            retryPlaybackCount = 0;

            nextClip();

        }

    });
    /* eslint-disable padded-blocks, block-spacing */

    // Ready
    player.addListener('ready', ({device_id: id}) => {

        deviceId = id;

        console.log('Ready with Device ID', deviceId);

        resetUI();

        stopButton.addEventListener('click', stopClip);
        resumeButton.addEventListener('click', resumeClip);

        prevButton.addEventListener('click', previousClip);
        nextButton.addEventListener('click', nextClip);

        readyCallback();

    });

    player.connect();

}

function playClip (trackUri, startTime, clipLength) {

    stopButton.disabled = false;
    resumeButton.disabled = true;
    setStopResumeShown(true);

    console.log('Playing:', currentClipIndex);

    updateClipInfo();

    clearTimeout(clipTimeout);

    try {

        return fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            body: JSON.stringify({
                uris: [trackUri],
                position_ms: startTime * 1000
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {

            if (response.ok) {

                retryPlaybackCount = 0;

                isStopped = false;

                clipTimeout = setTimeout(nextClip, clipLength * 1000);

            } else {

                throw new Error('Error playing track', currentClipIndex);

            }

        });

    } catch (error) {

        console.error(error);

    }

}

function playCurrentClip () {

    const clip = songClips[currentClipIndex];

    if (clip.uri) {

        updateGuessUI(currentClipIndex);

        playClip(clip.uri, clip.startTime, clip.clipLength);

    } else {

        console.error('Unable to play clip');

    }

}

function stopClip () {

    retryStopCount++;

    if (retryStopCount > MAX_STOP_ATTEMPTS) {

        console.error('Failed to stop playback after ' + MAX_STOP_ATTEMPTS + ' attempts. Giving up.');
        return;

    }

    if (currentClipIndex !== -1) {

        console.log('Stopping:', currentClipIndex);

    }

    stopButton.disabled = true;
    resumeButton.disabled = false;
    setStopResumeShown(false);

    clearTimeout(clipTimeout);

    fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then((response) => {

        if (response.ok) {

            isStopped = true;
            retryStopCount = 0;

        } else {

            console.log('Failed to stop clip. Trying again...');
            stopClip();

        }

    });

}

function resumeClip () {

    if (isStopped) {

        stopButton.disabled = false;
        resumeButton.disabled = true;
        setStopResumeShown(true);

        playCurrentClip();

    }

}

function previousClip () {

    if (currentClipIndex > 0) {

        currentClipIndex--;
        stopClip();
        playCurrentClip();

    }

}

function nextClip () {

    if (currentClipIndex < songClips.length - 1) {

        currentClipIndex++;
        playCurrentClip();

    } else {

        stopClip();
        resetUI(); // Reset UI when the last clip finishes

    }

}

function updateClipInfo () {

    if (currentClipIndex === -1) {

        clipInfo.textContent = '-';

    } else {

        clipInfo.textContent = `${currentClipIndex + 1} / ${songClips.length}`;

    }

    prevButton.disabled = currentClipIndex === 0;
    nextButton.disabled = currentClipIndex === songClips.length - 1;

}

function resetUI () {

    currentClipIndex = -1;

    clearTimeout(clipTimeout);
    stopClip();
    updateClipInfo();

    stopButton.disabled = true;
    resumeButton.disabled = true;
    setStopResumeShown(false);

    prevButton.disabled = true;
    nextButton.disabled = true;

    helpButton.disabled = true;

}
