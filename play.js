/****************************************************************************
 * play.js
 * openacousticdevices.info
 * August 2024
 *****************************************************************************/

/* global authorise, prepareGame */
/* global spotifyReady */
/* global bootstrap */

const startModal = new bootstrap.Modal(document.getElementById('start-modal'), {
    backdrop: 'static',
    keyboard: false
});

const playlistChooseButton = document.getElementById('playlist-choose-button');
const quickplayButton = document.getElementById('quickplay-button');
const playlistURLButton = document.getElementById('playlist-url-button');

const startModalContentHome = document.getElementById('start-modal-content-home');
const startModalContentChoose = document.getElementById('start-modal-content-choose');
const startModalContentUrl = document.getElementById('start-modal-content-url');

const cancelPlaylistChooseButton = document.getElementById('cancel-playlist-choose-button');
const playPlaylistChooseButton = document.getElementById('play-playlist-choose-button');

const cancelPlaylistUrlButton = document.getElementById('cancel-playlist-url-button');
const playPlaylistUrlButton = document.getElementById('play-playlist-url-button');

quickplayButton.addEventListener('click', () => {

    if (spotifyReady) {

        playlistChooseButton.disabled = true;
        quickplayButton.disabled = true;
        playlistURLButton.disabled = true;
        quickplayButton.innerText = 'Preparing...';

        // TODO: Read from UI or use a default one
        const playlistIdArray = ['540hMK8BIBAC2hzxsDXSNu'];
        // const playlistIdArray = ['5Rrf7mqN8uus2AaQQQNdc1'];
        const songCount = 5;

        prepareGame(playlistIdArray, songCount, () => {

            startModal.hide();

        });

    }

});

playPlaylistChooseButton.addEventListener('click', () => {

    // if (spotifyReady) {

    //     choosePlaylistButton.disabled = true;
    //     quickplayButton.disabled = true;
    //     playlistURLButton.disabled = true;
    //     quickplayButton.innerText = 'Preparing...';

    //     const playlistId = '5Rrf7mqN8uus2AaQQQNdc1';

    //     prepareGame(playlistId, () => {

    //         startModal.hide();

    //     });

    // }

});

playPlaylistUrlButton.addEventListener('click', () => {

    // if (spotifyReady) {

    //     choosePlaylistButton.disabled = true;
    //     quickplayButton.disabled = true;
    //     playlistURLButton.disabled = true;
    //     quickplayButton.innerText = 'Preparing...';

    //     const playlistId = '5Rrf7mqN8uus2AaQQQNdc1';

    //     prepareGame(playlistId, () => {

    //         startModal.hide();

    //     });

    // }

});

function showStartModalHome () {

    startModalContentHome.style.display = '';
    startModalContentChoose.style.display = 'none';
    startModalContentUrl.style.display = 'none';

}

function showStartModalChoose () {

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
playlistURLButton.addEventListener('click', showStartModalUrl);

cancelPlaylistChooseButton.addEventListener('click', showStartModalHome);
cancelPlaylistUrlButton.addEventListener('click', showStartModalHome);

function enablePrepareUI() {

    playlistChooseButton.disabled = false;
    quickplayButton.disabled = false;
    playlistURLButton.disabled = false;

}

window.onload = () => {

    startModal.show();

};

window.onSpotifyWebPlaybackSDKReady = authorise;

// https://developer.spotify.com/dashboard
// https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started

// TODO: Rewrite playlist function to accept array of playlist IDs and pull a number from each

// TODO: Enter random seed and number

// TODO: Select from an array of playlists preselected playlists (All On 90s, etc.)
// TODO: Paste in playlist URL
// TODO: Combine multiple playlists
// TODO: Load sporacle quizzes

// TODO: Table
// TODO: Interface

// TODO: Artist score/custom scoring
// TODO: Album mode

// TODO: "Guessed at x:xx"

// TODO: Detect "ing" -> in' (specific cases?)
// TODO: Checkbox for skipping correct guesses on playback
