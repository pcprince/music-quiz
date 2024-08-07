/****************************************************************************
 * game.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

/* global populateClipList, connectToPlayer, endTimer, playAll */
/* global playClipButtons, startTimerButton */
/* global guessInput, giveUpButton, unguessedClips, revealSong */
/* global songClips */

const scoreSpan = document.getElementById('score-span');
const maxScoreSpan = document.getElementById('max-score-span');

function updateScore () {

    scoreSpan.innerText = songClips.length - unguessedClips.length;

    if (unguessedClips.length === 0) {

        endGame();

    }

}

function initialiseScore () {

    scoreSpan.innerText = '0';
    maxScoreSpan.innerText = songClips.length;

}

function startGame () {

    for (let i = 0; i < playClipButtons.length; i++) {

        playClipButtons[i].disabled = false;

    }

    playAll();

    guessInput.disabled = false;
    giveUpButton.disabled = false;

}

function endGame () {

    for (let i = 0; i < unguessedClips.length; i++) {

        revealSong(i, 'red');

    }

    stopClip();

    guessInput.disabled = true;
    giveUpButton.disabled = true;

    endTimer();

}

async function prepareGame (playlistId, readyCallback) {

    await populateClipList(playlistId);

    connectToPlayer(() => {

        initialiseScore();

        console.log('Game is ready');

        readyCallback();

        startTimerButton.disabled = false;

    });

}
