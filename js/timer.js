/****************************************************************************
 * timer.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

/* global bootstrap */
/* global startGame, endGame, stopClip */

const timerSpan = document.getElementById('timer-span');
const startTimerButton = document.getElementById('start-timer-button');
const pauseTimerButton = document.getElementById('pause-timer-button');
const resumeTimerButton = document.getElementById('resume-timer-button');

const pauseModal = new bootstrap.Modal(document.getElementById('pause-modal'), {
    backdrop: 'static',
    keyboard: false
});

const GAME_LENGTH = 15 * 60 * 1000;

let timeRemaining = 0;
let timerInterval;
let isPaused = true;
let lastUpdateTime = Date.now();

function formatTimeMs (ms) {

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

}

function updateTimer () {

    const now = Date.now();
    const elapsed = now - lastUpdateTime;

    if (!isPaused) {

        timeRemaining -= elapsed;

        if (timeRemaining <= 0) {

            clearInterval(timerInterval);
            timeRemaining = 0;

            endGame();

        }

    }

    lastUpdateTime = now;
    timerSpan.textContent = formatTimeMs(timeRemaining);

}

function resumeTimer () {

    if (isPaused) {

        isPaused = false;
        lastUpdateTime = Date.now();
        timerInterval = setInterval(updateTimer, 100);

    }

}

function pauseTimer () {

    if (!isPaused) {

        isPaused = true;
        clearInterval(timerInterval);

    }

}

function endTimer () {

    clearInterval(timerInterval);

    resumeTimerButton.disabled = true;
    pauseTimerButton.disabled = true;

}

function startTimer () {

    timeRemaining = GAME_LENGTH;

    lastUpdateTime = Date.now();
    timerInterval = setInterval(updateTimer, 100);

    isPaused = false;

    resumeTimerButton.disabled = false;
    startTimerButton.disabled = true;
    pauseTimerButton.disabled = false;

    startTimerButton.style.display = 'none';
    pauseTimerButton.style.display = '';

    startGame();

}

function addSecondsToTimer (t) {

    timeRemaining += t * 1000;

}

startTimerButton.addEventListener('click', startTimer);

pauseTimerButton.addEventListener('click', () => {

    pauseModal.show();

    pauseTimer();
    stopClip();

});

resumeTimerButton.addEventListener('click', () => {

    pauseModal.hide();

    resumeTimer();

});
