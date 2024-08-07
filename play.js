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

const prepareButton = document.getElementById('prepare-button');

prepareButton.addEventListener('click', () => {

    if (spotifyReady) {

        prepareButton.disabled = true;
        prepareButton.innerText = 'Preparing...';

        // TODO: Read from UI or use a default one
        const playlistId = '5Rrf7mqN8uus2AaQQQNdc1';

        prepareGame(playlistId, () => {

            startModal.hide();

        });

    }

});

window.onload = () => {

    startModal.show();

};

window.onSpotifyWebPlaybackSDKReady = authorise;

// https://developer.spotify.com/dashboard
// https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started

// TODO: Table

// TODO: Don't generate quiz until function is called to do so
// TODO: Artist score/custom scoring

// TODO: Select from an array of playlists preselected playlists (All On 90s, etc.)
// TODO: Paste in playlist URL
// TODO: Combine multiple playlists
// TODO: Load sporacle quizzes

// TODO: Help button which reselects clip and adds 5 seconds to timer

// TODO: Interface

// TODO: Album mode
