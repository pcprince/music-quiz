/****************************************************************************
 * player.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

/* global Spotify */
/* global updateGuessUI, formatTimeMs, fillBar, updateProgressBarUI */
/* global token, songClips, unguessedClips, gameStarted */
/* global helpButton */

const stopButton = document.getElementById('stop-button');
const resumeButton = document.getElementById('resume-button');

const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');

const clipNumberSpan = document.getElementById('clip-number-span');
const clipTotalSpan = document.getElementById('clip-total-span');

const skipGuessCheckbox = document.getElementById('skip-guessed-checkbox');
const skipGuessCheckboxLabel = document.getElementById('skip-guessed-checkbox-label');

let currentClipIndex = 0;
let clipTimeout;
let isStopped = false;
let player;
let deviceId;
let controlsBound = false;

let retryPlaybackCount = 0;
const MAX_PLAYBACK_ATTEMPTS = 3;
const MAX_STOP_ATTEMPTS = 3;

function sleep (ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}

function playSpecificClip (index) {

    if (!gameStarted) {

        return;

    }

    endProgressBarLoop();
    fillBar(0);

    currentClipIndex = index;
    playCurrentClip();
    updateClipInfo();

}

function playSpecificSong (index) {

    currentClipIndex = index;
    playAllSong();
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

    if (player) {

        player.disconnect();

    }

    player = new Spotify.Player({
        name: 'Spotify Clip Player',
        getOAuthToken: cb => {

            cb(token);

        },
        volume: 0.5
    });

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

            retryPlaybackCount++;
            console.log('Retrying...');

            await sleep(1000);

            playSpecificClip(currentClipIndex);

        } else {

            console.error('Max retries reached. Giving up.');
            retryPlaybackCount = 0;
            nextClip();

        }

    });
    /* eslint-enable padded-blocks, block-spacing */

    player.addListener('ready', ({device_id: id}) => {

        deviceId = id;

        console.log('Ready with Device ID', deviceId);

        resetUI();

        if (!controlsBound) {

            stopButton.addEventListener('click', stopClip);
            resumeButton.addEventListener('click', resumeClip);
            prevButton.addEventListener('click', previousClip);
            nextButton.addEventListener('click', nextClip);
            controlsBound = true;

        }

        readyCallback();

    });

    player.connect();

}

let animationInterval;

function startProgressBarLoop () {

    const clipLengthMs = songClips[currentClipIndex].clipLength * 1000;

    const startTime = Date.now();

    if (animationInterval) {

        clearInterval(animationInterval);

    }

    fillBar(0);

    animationInterval = setInterval(() => {

        if (!isStopped) {

            const elapsedTime = Date.now() - startTime;
            const currentPercentage = (elapsedTime / clipLengthMs) * 100;

            if (currentPercentage >= 100) {

                clearInterval(animationInterval);

            }

            fillBar(currentPercentage);

        }

    }, 10);

}

function endProgressBarLoop () {

    if (animationInterval) {

        clearInterval(animationInterval);

    }

}

async function pausePlaybackWithRetry () {

    if (!deviceId || !token) {

        isStopped = true;
        return true;

    }

    for (let attempt = 0; attempt < MAX_STOP_ATTEMPTS; attempt++) {

        try {

            const response = await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {

                isStopped = true;
                return true;

            }

        } catch (error) {

            console.error('Error stopping playback:', error);

        }

        await sleep(250);

    }

    return false;

}

async function stopCurrentClipAndRun (callback) {

    clearTimeout(clipTimeout);

    const stopped = await pausePlaybackWithRetry();

    if (!stopped) {

        console.error('Unable to pause playback after maximum retries.');
        return;

    }

    if (typeof callback === 'function') {

        callback();

    }

}

function playClip (trackUri, startTime, clipLength) {

    stopButton.disabled = false;
    resumeButton.disabled = true;
    setStopResumeShown(true);

    updateProgressBarUI();

    startTime = startTime === undefined ? 0 : startTime;

    const songName = songClips[currentClipIndex].name;
    const artistNames = songClips[currentClipIndex].artists.map(artist => artist.name).join(', ');

    let playingStr = 'Playing ';
    playingStr += clipLength ? 'clip ' : '';
    playingStr += currentClipIndex + ' : ' + songName + ' - ' + artistNames + ' (' + formatTimeMs(startTime * 1000) + ' - ';
    playingStr += clipLength ? formatTimeMs((startTime + clipLength) * 1000) : 'End';
    playingStr += ')';

    console.log(playingStr);

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

                if (clipLength) {

                    startProgressBarLoop();
                    clipTimeout = setTimeout(() => {

                        stopCurrentClipAndRun(() => {

                            console.log('Clip timed out. Moving to next clip.');
                            nextClip();

                        });

                    }, clipLength * 1000);

                }

            } else {

                throw new Error('Error playing track');

            }

        });

    } catch (error) {

        console.error(error);
        return Promise.resolve();

    }

}

function playCurrentClip () {

    currentClipIndex = currentClipIndex === -1 ? 0 : currentClipIndex;

    const clip = songClips[currentClipIndex];

    if (clip && clip.uri) {

        updateGuessUI(currentClipIndex);
        playClip(clip.uri, clip.startTime, clip.clipLength);

    } else {

        console.error('Unable to play clip');

    }

}

function playAllSong () {

    const song = songClips[currentClipIndex];

    if (song && song.uri) {

        updateGuessUI(currentClipIndex);
        playClip(song.uri);

    } else {

        console.error('Unable to play full song');

    }

}

async function stopClip () {

    if (currentClipIndex !== -1) {

        console.log('Stopping:', currentClipIndex);

    }

    stopButton.disabled = true;
    resumeButton.disabled = false;
    setStopResumeShown(false);

    clearTimeout(clipTimeout);
    endProgressBarLoop();

    const stopped = await pausePlaybackWithRetry();

    if (!stopped) {

        console.error('Failed to stop playback after ' + MAX_STOP_ATTEMPTS + ' attempts. Giving up.');

    }

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

    clearTimeout(clipTimeout);

    if (currentClipIndex > 0) {

        currentClipIndex--;

        endProgressBarLoop();
        fillBar(0);

        stopClip();
        playCurrentClip();

    }

}

function nextClip () {

    if (currentClipIndex < songClips.length - 1) {

        endProgressBarLoop();
        fillBar(0);

        currentClipIndex++;

        if (skipGuessCheckbox.checked) {

            while (currentClipIndex < songClips.length) {

                if (unguessedClips.some(obj => obj.index === currentClipIndex)) {

                    playCurrentClip();
                    return;

                }

                console.log('Skipping clip', currentClipIndex);
                currentClipIndex++;

            }

            stopClip();
            resetUI();

        } else {

            playCurrentClip();

        }

    } else {

        stopClip();
        endProgressBarLoop();
        fillBar(0);
        resetUI();

        resumeButton.disabled = false;

    }

}

function updateClipInfo () {

    if (currentClipIndex === -1) {

        clipNumberSpan.textContent = '-';
        clipTotalSpan.textContent = '-';

    } else {

        clipNumberSpan.textContent = (currentClipIndex + 1);
        clipTotalSpan.textContent = songClips.length;

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

skipGuessCheckbox.addEventListener('change', () => {

    skipGuessCheckboxLabel.style.color = skipGuessCheckbox.checked ? '' : 'grey';

});
