/****************************************************************************
 * play.js
 * openacousticdevices.info
 * August 2024
 *****************************************************************************/

/* global bootstrap */
/* global authorise, populateClipList, loadClipListFromFile, prepareGame, clearClipList, resetScore, stopClip */
/* global token, spotifyReady */

const startModal = new bootstrap.Modal(document.getElementById('start-modal'), {
    backdrop: 'static',
    keyboard: false
});

const remakeButton = document.getElementById('remake-button');

// Modal home buttons

const playlistChooseButton = document.getElementById('playlist-choose-button');
const quickplayButton = document.getElementById('quickplay-button');
const playlistUrlButton = document.getElementById('playlist-url-button');

const startModalContentHome = document.getElementById('start-modal-content-home');
const startModalContentChoose = document.getElementById('start-modal-content-choose');
const startModalContentUrl = document.getElementById('start-modal-content-url');

// Quickplay UI

const quickplaySongCountInput = document.getElementById('quickplay-song-count-input');
const quickplaySeededCheckbox = document.getElementById('quickplay-seeded-checkbox');
const quickplaySeededCheckboxLabel = document.getElementById('quickplay-seeded-checkbox-label');
const quickplaySeededSeedInput = document.getElementById('quickplay-seeded-seed-input');
const quickplaySeededNumberInput = document.getElementById('quickplay-seeded-number-input');

// Playlist choose UI

const playlistChooseCheckboxHolder = document.getElementById('playlist-choose-checkbox-holder');

const playlistChooseCancelButton = document.getElementById('cancel-playlist-choose-button');
const playlistChoosePlayButton = document.getElementById('play-playlist-choose-button');

const playlistChooseSongCountInput = document.getElementById('playlist-choose-song-count-input');
const playlistChooseSeededCheckbox = document.getElementById('playlist-choose-seeded-checkbox');
const playlistChooseSeededCheckboxLabel = document.getElementById('playlist-choose-seeded-checkbox-label');
const playlistChooseSeededSeedInput = document.getElementById('playlist-choose-seeded-seed-input');
const playlistChooseSeededNumberInput = document.getElementById('playlist-choose-seeded-number-input');

// Playlist enter URL UI

const playlistUrlSongCountInput = document.getElementById('playlist-url-song-count-input');
const playlistUrlSeededCheckbox = document.getElementById('playlist-url-seeded-checkbox');
const playlistUrlSeededCheckboxLabel = document.getElementById('playlist-url-seeded-checkbox-label');
const playlistUrlSeededSeedInput = document.getElementById('playlist-url-seeded-seed-input');
const playlistUrlSeededNumberInput = document.getElementById('playlist-url-seeded-number-input');

const playlistUrlCancelButton = document.getElementById('cancel-playlist-url-button');
const playlistUrlPlayButton = document.getElementById('play-playlist-url-button');

const playlistUrlInput = document.getElementById('playlist-url-input');
const playlistUrlAddButton = document.getElementById('playlist-url-add-button');
const playlistUrlRemoveButton = document.getElementById('playlist-url-remove-button');
const playlistUrlSelect = document.getElementById('playlist-url-select');

// Playlist choose cached playlists

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

const playlistChooseInfo = [
    {
        id: '37i9dQZF1DXaKIA8E7WcJj',
        name: 'All Out 60s',
        trackCount: 150
    },
    {
        id: '37i9dQZF1DWTJ7xPn4vNaz',
        name: 'All Out 70s',
        trackCount: 150
    },
    {
        id: '37i9dQZF1DX4UtSsGT1Sbe',
        name: 'All Out 80s',
        trackCount: 150
    },
    {
        id: '37i9dQZF1DXbTxeAdrVG2l',
        name: 'All Out 90s',
        trackCount: 150
    },
    {
        id: '37i9dQZF1DX4o1oenSJRJd',
        name: 'All Out 2000s',
        trackCount: 150
    },
    {
        id: '37i9dQZF1DX5Ejj0EkURtP',
        name: 'All Out 2010s',
        trackCount: 150
    },
    {
        id: '37i9dQZF1DX2M1RktxUUHG',
        name: 'All Out 2020s',
        trackCount: 150
    },
    {
        id: '5Rrf7mqN8uus2AaQQQNdc1',
        name: '500 Greatest Songs of All Time',
        trackCount: 500
    },
    {
        id: '3ycsMKOg7CXaxcdNI36ogX',
        name: 'NME\'s 500 Greatest Songs of All Time',
        trackCount: 483
    }
];

let chooseOpened = false;

function displayError (target, message) {

    const popover = new bootstrap.Popover(target, {
        content: message,
        trigger: 'manual',
        placement: 'top'
    });

    popover.show();

    setTimeout(() => {

        popover.hide();

    }, 2000);

}

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

    for (let i = 0; i < playlistChooseInfo.length; i++) {

        const playlistInfo = playlistChooseInfo[i];

        if (playlistInfo.id === playlistId) {

            return {
                name: playlistInfo.name,
                trackCount: playlistInfo.trackCount
            };

        }

    }

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

function resetStartModal () {

    startModal.hide();

    quickplayButton.innerText = 'Play';
    playlistChoosePlayButton.innerText = 'Play';
    playlistUrlPlayButton.innerText = 'Play';

    playlistChooseButton.disabled = false;
    quickplayButton.disabled = false;
    playlistUrlButton.disabled = false;

    const playlistChooseCheckboxes = document.getElementsByClassName('playlist-choose-checkbox');

    for (let i = 0; i < playlistChooseCheckboxes.length; i++) {

        playlistChooseCheckboxes[i].disabled = false;

    }

    playlistChoosePlayButton.disabled = false;
    playlistChooseCancelButton.disabled = false;

    playlistUrlAddButton.disabled = false;
    playlistUrlRemoveButton.disabled = false;
    playlistUrlPlayButton.disabled = false;
    playlistUrlCancelButton.disabled = false;

}

playlistUrlAddButton.addEventListener('click', async () => {

    const playlistID = extractPlaylistID(playlistUrlInput.value);

    if (!playlistID) {

        displayError(playlistUrlAddButton, 'Invalid playlist URL!');
        return;

    }

    playlistUrlInput.value = '';

    if (playlistUrls.includes(playlistID)) {

        displayError(playlistUrlAddButton, 'Playlist already added!');
        return;

    }

    const playlistInfo = await getPlayListInformation(playlistID);

    if (playlistInfo) {

        if (playlistInfo.trackCount === 0) {

            displayError(playlistUrlAddButton, 'Playlist is empty!');

        } else {

            const option = document.createElement('option');
            option.value = playlistID;
            option.text = playlistInfo.name + ' (' + playlistInfo.trackCount + ' songs)';

            playlistUrlSelect.appendChild(option);

            playlistUrls.push(playlistID);

        }

    } else {

        displayError(playlistUrlAddButton, 'Failed to retrieve playlist information!');

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

        let seed, offset;

        if (quickplaySeededCheckbox.checked && quickplaySeededSeedInput.value.length > 0) {

            seed = quickplaySeededSeedInput.value;
            offset = parseInt(quickplaySeededNumberInput.value);

        }

        await loadClipListFromFile(songCount, seed, offset);

        prepareGame();

    }

});

playlistChoosePlayButton.addEventListener('click', async () => {

    let playlistsChosen = false;

    const playlistChooseCheckboxes = document.getElementsByClassName('playlist-choose-checkbox');

    for (let i = 0; i < playlistChooseCheckboxes.length; i++) {

        if (playlistChooseCheckboxes[i].checked) {

            playlistsChosen = true;

        }

    }

    if (!playlistsChosen) {

        displayError(playlistChoosePlayButton, 'No playlists selected!');
        return;

    }

    if (spotifyReady) {

        playlistChooseButton.disabled = true;
        quickplayButton.disabled = true;
        playlistUrlButton.disabled = true;

        for (let i = 0; i < playlistChooseCheckboxes.length; i++) {

            playlistChooseCheckboxes[i].disabled = true;

        }

        playlistChoosePlayButton.disabled = true;
        playlistChooseCancelButton.disabled = true;

        playlistChoosePlayButton.innerText = 'Preparing...';

        const playlistIds = [];

        for (let i = 0; i < playlistChooseCheckboxes.length; i++) {

            if (playlistChooseCheckboxes[i].checked) {

                playlistIds.push(playlistChooseIds[i]);

            }

        }

        const songCount = Math.max(playlistChooseSongCountInput.value, 1);

        let seed, offset;

        if (playlistChooseSeededCheckbox.checked && playlistChooseSeededSeedInput.value.length > 0) {

            seed = playlistChooseSeededSeedInput.value;
            offset = parseInt(playlistChooseSeededNumberInput.value);

        }

        await populateClipList(playlistIds, songCount, seed, offset);

        prepareGame();

    }

});

playlistUrlPlayButton.addEventListener('click', async () => {

    if (playlistUrlSelect.options.length <= 0) {

        displayError(playlistUrlPlayButton, 'No playlists added!');
        return;

    }

    if (spotifyReady) {

        playlistChooseButton.disabled = true;
        quickplayButton.disabled = true;
        playlistUrlButton.disabled = true;

        playlistUrlPlayButton.disabled = true;
        playlistUrlCancelButton.disabled = true;

        playlistUrlPlayButton.innerText = 'Preparing...';

        playlistUrlAddButton.disabled = true;
        playlistUrlRemoveButton.disabled = true;

        const playlistIdArray = [...playlistUrlSelect.options].map(o => o.value);

        const songCount = Math.max(playlistUrlSongCountInput.value, 1);

        let seed, offset;

        if (playlistUrlSeededCheckbox.checked && playlistUrlSeededSeedInput.value.length > 0) {

            seed = playlistUrlSeededSeedInput.value;
            offset = parseInt(playlistUrlSeededNumberInput.value);

        }

        await populateClipList(playlistIdArray, songCount, seed, offset);

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

            // Add a checkbox

            const playlistRow = document.createElement('div');

            const playlistCheckbox = document.createElement('input');
            playlistCheckbox.type = 'checkbox';
            playlistCheckbox.id = 'playlist-choose-checkbox' + i;
            playlistCheckbox.classList.add('playlist-choose-checkbox');

            playlistRow.appendChild(playlistCheckbox);

            const playlistCheckboxLabel = document.createElement('label');
            playlistCheckboxLabel.htmlFor = playlistCheckbox.id;
            playlistCheckboxLabel.innerText = playlistInfo.name + ' (' + playlistInfo.trackCount + ' songs)';
            playlistCheckboxLabel.style = 'margin-left: 3px;';

            playlistRow.appendChild(playlistCheckboxLabel);

            playlistChooseCheckboxHolder.appendChild(playlistRow);

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

function updateSeedUI (e) {

    const targetCheckbox = e.target;

    quickplaySeededCheckbox.checked = targetCheckbox.checked;
    playlistChooseSeededCheckbox.checked = targetCheckbox.checked;
    playlistUrlSeededCheckbox.checked = targetCheckbox.checked;

    quickplaySeededSeedInput.disabled = !targetCheckbox.checked;
    quickplaySeededNumberInput.disabled = !targetCheckbox.checked;

    quickplaySeededCheckboxLabel.style.color = targetCheckbox.checked ? '' : 'gray';

    playlistChooseSeededSeedInput.disabled = !targetCheckbox.checked;
    playlistChooseSeededNumberInput.disabled = !targetCheckbox.checked;

    playlistChooseSeededCheckboxLabel.style.color = targetCheckbox.checked ? '' : 'gray';

    playlistUrlSeededSeedInput.disabled = !targetCheckbox.checked;
    playlistUrlSeededNumberInput.disabled = !targetCheckbox.checked;

    playlistUrlSeededCheckboxLabel.style.color = targetCheckbox.checked ? '' : 'gray';

}

quickplaySeededCheckbox.addEventListener('change', updateSeedUI);
playlistChooseSeededCheckbox.addEventListener('change', updateSeedUI);
playlistUrlSeededCheckbox.addEventListener('change', updateSeedUI);

function matchSeedValues (e) {

    switch (e.target.id) {

    case quickplaySeededSeedInput.id:
        playlistChooseSeededSeedInput.value = quickplaySeededSeedInput.value;
        playlistChooseSeededNumberInput.value = quickplaySeededNumberInput.value;

        playlistUrlSeededSeedInput.value = quickplaySeededSeedInput.value;
        playlistUrlSeededNumberInput.value = quickplaySeededNumberInput.value;

        break;
    case playlistChooseSeededSeedInput.id:
        quickplaySeededSeedInput.value = playlistChooseSeededSeedInput.value;
        quickplaySeededNumberInput.value = playlistChooseSeededNumberInput.value;

        playlistUrlSeededSeedInput.value = playlistChooseSeededSeedInput.value;
        playlistUrlSeededNumberInput.value = playlistChooseSeededNumberInput.value;

        break;
    case playlistUrlSeededSeedInput.id:
        quickplaySeededSeedInput.value = playlistUrlSeededSeedInput.value;
        quickplaySeededNumberInput.value = playlistUrlSeededNumberInput.value;

        playlistChooseSeededSeedInput.value = playlistUrlSeededSeedInput.value;
        playlistChooseSeededNumberInput.value = playlistUrlSeededNumberInput.value;

        break;

    }

}

quickplaySeededSeedInput.addEventListener('change', matchSeedValues);
playlistChooseSeededSeedInput.addEventListener('change', matchSeedValues);
playlistUrlSeededSeedInput.addEventListener('change', matchSeedValues);

quickplaySeededNumberInput.addEventListener('change', matchSeedValues);
playlistChooseSeededNumberInput.addEventListener('change', matchSeedValues);
playlistUrlSeededNumberInput.addEventListener('change', matchSeedValues);

function matchSongCounts (e) {

    const input = e.target;
    input.value = Math.min(input.value, 50);
    input.value = Math.max(input.value, 1);

    quickplaySongCountInput.value = input.value;
    playlistChooseSongCountInput.value = input.value;
    playlistUrlSongCountInput.value = input.value;

}

quickplaySongCountInput.addEventListener('change', matchSongCounts);
playlistChooseSongCountInput.addEventListener('change', matchSongCounts);
playlistUrlSongCountInput.addEventListener('change', matchSongCounts);

remakeButton.addEventListener('click', () => {

    stopClip();

    remakeButton.disabled = true;

    clearClipList();

    resetScore();

    startModal.show();

});

window.onload = async () => {

    // Display start modal

    startModal.show();

};

window.onSpotifyWebPlaybackSDKReady = authorise;

// https://developer.spotify.com/dashboard
// https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started

// FIXME: Currently possible to start a choose playlist game with no playlists selected
// FIXME: Currently possible to start a enter url game with no playlists selected

// TODO: Disallow duplicate artists

// TODO: Display error when failed to add playlist URL

// TODO: Load sporacle quizzes

// TODO: Table
// TODO: Interface

// TODO: Artist score/custom scoring
// TODO: Album mode

// TODO: "Guessed at x:xx"

// TODO: Add "Play all song" button when quiz is over

// TODO: Checkbox for skipping correct guesses on playback
