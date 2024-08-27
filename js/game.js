/****************************************************************************
 * game.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

/* global connectToPlayer, endTimer, playAll, stopClip */
/* global playClipButtons, startTimerButton, pauseTimerButton, helpButton, guessInput, giveUpButton, remakeButton */
/* global revealSong, revealArtist, resetStartModal, isArtistMode, fillAllBars, setGameLength */
/* global unguessedClips, unguessedArtistClips, songClips */

const scoreSpan = document.getElementById('score-span');
const maxScoreSpan = document.getElementById('max-score-span');

const artistScoreLabel = document.getElementById('artist-score-label');
const artistScoreSpan = document.getElementById('artist-score-span');
const artistSlashSpan = document.getElementById('artist-slash-span');
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

    artistScoreSpan.innerText = '0';
    maxArtistScoreSpan.innerText = songClips.length;

    artistScoreLabel.style.display = isArtistMode() ? 'inline-block' : 'none';
    artistScoreSpan.style.display = isArtistMode() ? 'inline-block' : 'none';
    artistSlashSpan.style.display = isArtistMode() ? 'inline-block' : 'none';
    maxArtistScoreSpan.style.display = isArtistMode() ? 'inline-block' : 'none';

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

    fillAllBars();

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

async function prepareGame (quizLength) {

    connectToPlayer(() => {

        initialiseScore();

        console.log('Game is ready');

        resetStartModal();

        setGameLength(quizLength);

        startTimerButton.disabled = false;

        startTimerButton.style.display = '';
        pauseTimerButton.style.display = 'none';

        giveUpButton.style.display = '';
        remakeButton.style.display = 'none';

    });

}
