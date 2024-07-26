/****************************************************************************
 * game.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

/* global populateClipList, connectToPlayer, endTimer */
/* global playAllButton, playClipButtons, startTimerButton, stopButton, resumeButton, prevButton, nextButton */
/* global guessInput, giveUpButton, unguessedClips, revealSong */
/* global songClips */

const scoreSpan = document.getElementById('score-span');
const maxScoreSpan = document.getElementById('max-score-span');

function updateScore () {

    scoreSpan.innerText = songClips.length - unguessedClips.length;

}

function initialiseScore () {

    scoreSpan.innerText = '0';
    maxScoreSpan.innerText = songClips.length;

}

function startGame () {

    for (let i = 0; i < playClipButtons.length; i++) {

        playClipButtons[i].disabled = false;

    }

    playAllButton.disabled = false;

    guessInput.disabled = false;
    giveUpButton.disabled = false;

}

function endGame () {

    for (let i = 0; i < playClipButtons.length; i++) {

        playClipButtons[i].disabled = true;

    }

    for (let i = 0; i < unguessedClips.length; i++) {

        revealSong(i, 'red');

    }

    playAllButton.disabled = true;
    stopButton.disabled = true;
    resumeButton.disabled = true;
    prevButton.disabled = true;
    nextButton.disabled = true;

    guessInput.disabled = true;
    giveUpButton.disabled = true;

    endTimer();

}

async function prepareGame () {

    await populateClipList();

    connectToPlayer(() => {

        initialiseScore();

        console.log('Game is ready');
        startTimerButton.disabled = false;

    });

}
