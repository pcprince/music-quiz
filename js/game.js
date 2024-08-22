/****************************************************************************
 * game.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

/* global connectToPlayer, endTimer, playAll, stopClip */
/* global playClipButtons, startTimerButton, helpButton, guessInput, giveUpButton, remakeButton */
/* global unguessedClips, unguessedArtistClips, revealSong, revealArtist, resetStartModal, isArtistMode */
/* global songClips */

const scoreSpan = document.getElementById('score-span');
const maxScoreSpan = document.getElementById('max-score-span');

const artistScoreHolder = document.getElementById('artist-score-holder');
const artistScoreSpan = document.getElementById('artist-score-span');
const maxArtistScoreSpan = document.getElementById('max-artist-score-span');

let gameStarted = false;

function updateScore () {

    scoreSpan.innerText = songClips.length - unguessedClips.length;

    if (isArtistMode()) {

        artistScoreSpan.innerText = songClips.length - unguessedArtistClips.length;

        if (unguessedClips.length === 0 && unguessedArtistClips.length === 0) {

            endGame();

        }

    } else {

        if (unguessedClips.length === 0) {

            endGame();

        }

    }

}

function initialiseScore () {

    scoreSpan.innerText = '0';
    maxScoreSpan.innerText = songClips.length;
    maxArtistScoreSpan.innerText = songClips.length;

    artistScoreHolder.style.display = isArtistMode() ? '' : 'none';

}

function resetScore () {

    scoreSpan.innerText = '-';
    maxScoreSpan.innerText = '-';
    maxArtistScoreSpan.innerText = '-';

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

    if (isArtistMode()) {

        for (let i = 0; i < unguessedArtistClips.length; i++) {

            revealArtist(i, 'red');

        }

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
