/****************************************************************************
 * play.js
 * openacousticdevices.info
 * August 2024
 *****************************************************************************/

/* global bootstrap */
/* global authorise, populateClipList, loadClipListFromFile, prepareGame */
/* global token, spotifyReady */

const startModal = new bootstrap.Modal(document.getElementById('start-modal'), {
    backdrop: 'static',
    keyboard: false
});

const playlistChooseButton = document.getElementById('playlist-choose-button');
const quickplayButton = document.getElementById('quickplay-button');
const playlistUrlButton = document.getElementById('playlist-url-button');

const startModalContentHome = document.getElementById('start-modal-content-home');
const startModalContentChoose = document.getElementById('start-modal-content-choose');
const startModalContentUrl = document.getElementById('start-modal-content-url');

const quickplaySongCountInput = document.getElementById('quickplay-song-count-input');
const playlistChooseSongCountInput = document.getElementById('playlist-choose-song-count-input');
const playlistUrlSongCountInput = document.getElementById('playlist-url-song-count-input');

const playlistUrlCancelButton = document.getElementById('cancel-playlist-url-button');
const playlistUrlPlayButton = document.getElementById('play-playlist-url-button');

const playlistUrlInput = document.getElementById('playlist-url-input');
const playlistUrlAddButton = document.getElementById('playlist-url-add-button');
const playlistUrlRemoveButton = document.getElementById('playlist-url-remove-button');
const playlistUrlSelect = document.getElementById('playlist-url-select');
const playlistUrlErrorSpan = document.getElementById('playlist-url-error-span');

const playlistChooseSelect = document.getElementById('playlist-choose-select');
const playlistChooseCancelButton = document.getElementById('cancel-playlist-choose-button');
const playlistChoosePlayButton = document.getElementById('play-playlist-choose-button');

const playlistChooseIds = [
    '37i9dQZF1DXaKIA8E7WcJj', // All Out 60s
    '37i9dQZF1DWTJ7xPn4vNaz', // All Out 70s
    '37i9dQZF1DX4UtSsGT1Sbe', // All Out 80s
    '37i9dQZF1DXbTxeAdrVG2l', // All Out 90s
    '37i9dQZF1DX4o1oenSJRJd', // All Out 2000s
    '37i9dQZF1DX5Ejj0EkURtP', // All Out 2010s
    '37i9dQZF1DX2M1RktxUUHG', // All Out 2020s
    '5Rrf7mqN8uus2AaQQQNdc1', // 500 Greatest Songs of All Time
    '3ycsMKOg7CXaxcdNI36ogX' // NME's 500 Greatest Songs of All Time
];

let chooseOpened = false;

function extractPlaylistID (playlistUrl) {

    // Regular expression to match both URL and URI formats, ignoring query parameters
    const regex = /(?:https:\/\/open\.spotify\.com\/playlist\/|spotify:playlist:)([a-zA-Z0-9]{22})(?:\?.*)?/;
    const match = playlistUrl.match(regex);

    if (match && match[1]) {

        return match[1]; // Return the captured playlist ID

    } else {

        console.error('Invalid Spotify playlist URL or URI.');
        return null;

    }

}

async function getPlayListInformation (playlistId) {

    console.log(playlistId);

    try {

        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {

            const data = await response.json();
            const playlistName = data.name;
            const numberOfTracks = data.tracks.total;

            return {
                name: playlistName,
                trackCount: numberOfTracks
            };

        } else {

            console.error('Error fetching playlist details:', response.status, response.statusText);
            return null;

        }

    } catch (error) {

        console.error('Error occurred while fetching playlist details:', error);
        return null;

    }

}

const playlistUrls = [];

function displayPlayListUrlError (errorText) {

    console.error(errorText);

    playlistUrlErrorSpan.innerText = errorText;

    setTimeout(() => {

        playlistUrlErrorSpan.innerText = '';

    }, 1000);

}

playlistUrlAddButton.addEventListener('click', async () => {

    const playlistID = extractPlaylistID(playlistUrlInput.value);

    if (!playlistID) {

        return;

    }

    playlistUrlInput.value = '';

    if (playlistUrls.includes(playlistID)) {

        displayPlayListUrlError('Playlist already added');
        return;

    }

    const playlistInfo = await getPlayListInformation(playlistID);

    if (playlistInfo) {

        if (playlistInfo.trackCount === 0) {

            displayPlayListUrlError('Playlist is empty');

        } else {

            const option = document.createElement('option');
            option.value = playlistID;
            option.text = playlistInfo.name + ' (' + playlistInfo.trackCount + ' songs)';

            playlistUrlSelect.appendChild(option);

            playlistUrls.push(playlistID);

        }

    } else {

        displayPlayListUrlError('Failed to retrieve playlist information');

    }

});

playlistUrlRemoveButton.addEventListener('click', () => {

    const selectedIndex = playlistUrlSelect.selectedIndex;

    if (selectedIndex < 0) {

        return;

    }

    playlistUrlSelect.remove(selectedIndex);
    playlistUrls.splice(selectedIndex, 1);

});

quickplayButton.addEventListener('click', async () => {

    if (spotifyReady) {

        playlistChooseButton.disabled = true;
        quickplayButton.disabled = true;
        playlistUrlButton.disabled = true;
        quickplayButton.innerText = 'Preparing...';

        const songCount = Math.max(quickplaySongCountInput.value, 1);

        await loadClipListFromFile(songCount);

        prepareGame();

    }

});

playlistChoosePlayButton.addEventListener('click', async () => {

    if (spotifyReady) {

        playlistChooseButton.disabled = true;
        quickplayButton.disabled = true;
        playlistUrlButton.disabled = true;
        playlistChooseSelect.disabled = true;

        playlistChoosePlayButton.disabled = true;
        playlistChooseCancelButton.disabled = true;

        playlistChoosePlayButton.innerText = 'Preparing...';

        const playlistIds = [];

        for (let i = 0; i < playlistChooseSelect.options.length; i++) {

            const option = playlistChooseSelect.options[i];

            if (option.selected) {

                playlistIds.push(option.value);

            }

        }

        const songCount = Math.max(playlistChooseSongCountInput.value, 1);

        await populateClipList(playlistIds, songCount);

        prepareGame();

    }

});

playlistUrlPlayButton.addEventListener('click', async () => {

    if (spotifyReady) {

        playlistChooseButton.disabled = true;
        quickplayButton.disabled = true;
        playlistUrlButton.disabled = true;

        playlistUrlPlayButton.disabled = true;
        playlistUrlCancelButton.disabled = true;

        playlistUrlPlayButton.innerText = 'Preparing...';

        const playlistIdArray = [...playlistUrlSelect.options].map(o => o.value);

        const songCount = Math.max(playlistUrlSongCountInput.value, 1);

        await populateClipList(playlistIdArray, songCount);

        prepareGame();

    }

});

function showStartModalHome () {

    startModalContentHome.style.display = '';
    startModalContentChoose.style.display = 'none';
    startModalContentUrl.style.display = 'none';

}

async function showStartModalChoose () {

    if (!chooseOpened) {

        playlistChooseButton.innerText = 'Loading...';

        playlistChooseButton.disabled = true;
        quickplayButton.disabled = true;
        playlistUrlButton.disabled = true;

        quickplaySongCountInput.disabled = true;

        chooseOpened = true;

        // Populate playlist choose select

        for (let i = 0; i < playlistChooseIds.length; i++) {

            const playlistInfo = await getPlayListInformation(playlistChooseIds[i]);

            const option = document.createElement('option');
            option.value = playlistChooseIds[i];
            option.text = playlistInfo.name + ' (' + playlistInfo.trackCount + ' songs)';

            playlistChooseSelect.appendChild(option);

        }

        // Re-enable UI

        playlistChooseButton.innerText = 'Choose Playlist';

        playlistChooseButton.disabled = false;
        quickplayButton.disabled = false;
        playlistUrlButton.disabled = false;

        quickplaySongCountInput.disabled = false;

    }

    startModalContentHome.style.display = 'none';
    startModalContentChoose.style.display = '';
    startModalContentUrl.style.display = 'none';

}

function showStartModalUrl () {

    startModalContentHome.style.display = 'none';
    startModalContentChoose.style.display = 'none';
    startModalContentUrl.style.display = '';

}

playlistChooseButton.addEventListener('click', showStartModalChoose);
playlistUrlButton.addEventListener('click', showStartModalUrl);

playlistChooseCancelButton.addEventListener('click', showStartModalHome);
playlistUrlCancelButton.addEventListener('click', showStartModalHome);

async function enablePrepareUI() {

    // Enable buttons

    playlistChooseButton.disabled = false;
    quickplayButton.disabled = false;
    playlistUrlButton.disabled = false;

}

window.onload = async () => {

    // Display start modal

    startModal.show();

};

window.onSpotifyWebPlaybackSDKReady = authorise;

// https://developer.spotify.com/dashboard
// https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started

// TODO: Add ability to create a quiz from scratch rather than re-authenticating

// TODO: Enter random seed and number

// TODO: Load sporacle quizzes

// TODO: Table
// TODO: Interface

// TODO: Artist score/custom scoring
// TODO: Album mode

// TODO: "Guessed at x:xx"

// TODO: Add "Play all song" button when quiz is over

// TODO: Detect "ing" -> in' (specific cases?)
// TODO: Checkbox for skipping correct guesses on playback
