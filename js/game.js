/****************************************************************************
 * game.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

/* global connectToPlayer, endTimer, playAll, stopClip */
/* global playClipButtons, startTimerButton, helpButton, guessInput, giveUpButton, remakeButton */
/* global unguessedClips, revealSong, resetStartModal */
/* global songClips */

const scoreSpan = document.getElementById('score-span');
const maxScoreSpan = document.getElementById('max-score-span');

let gameStarted = false;

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

function resetScore () {

    scoreSpan.innerText = '-';
    maxScoreSpan.innerText = '-';

}

function startGame () {

    gameStarted = true;

    for (let i = 0; i < playClipButtons.length; i++) {

        playClipButtons[i].disabled = false;

    }

    playAll();

    guessInput.disabled = false;
    giveUpButton.disabled = false;

    helpButton.disabled = false;

}

function endGame () {

    for (let i = 0; i < unguessedClips.length; i++) {

        revealSong(i, 'red');

    }

    stopClip();

    guessInput.disabled = true;
    giveUpButton.disabled = true;

    endTimer();

    remakeButton.disabled = false;

    const playAllButtons = document.getElementsByClassName('play-all-button');

    for (let i = 0; i < playAllButtons.length; i++) {

        playAllButtons[i].style.display = '';

    }

}

async function prepareGame () {

    connectToPlayer(() => {

        initialiseScore();

        console.log('Game is ready');

        resetStartModal();

        startTimerButton.disabled = false;

    });

}
