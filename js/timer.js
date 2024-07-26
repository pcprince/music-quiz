/****************************************************************************
 * timer.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

/* global startGame, endGame */

const timerSpan = document.getElementById('timer-span');
const startTimerButton = document.getElementById('start-timer-button');
const pauseTimerButton = document.getElementById('pause-timer-button');
const resumeTimerButton = document.getElementById('resume-timer-button');

let timeRemaining = 0;
let tickTimeout;
let timerPaused = false;

function updateTimerSpan () {

    const minsRemaining = Math.floor(timeRemaining / 60);
    const secsRemaining = timeRemaining - (minsRemaining * 60);

    timerSpan.innerText = String(minsRemaining).padStart(2, '0') + ':' + String(secsRemaining).padStart(2, '0');

}

function tickTimer () {

    updateTimerSpan();

    if (timeRemaining <= 0) {

        endTimer();
        endGame();

        return;

    }

    timeRemaining--;

    tickTimeout = setTimeout(tickTimer, 1000);

}

function startTimer () {

    timeRemaining = 15 * 60;

    updateTimerSpan();

    pauseTimerButton.disabled = false;
    resumeTimerButton.disabled = false;
    startTimerButton.disabled = true;

    startGame();

    tickTimer();

}

function pauseTimer () {

    if (timerPaused) {

        return;

    }

    clearTimeout(tickTimeout);

    timerPaused = true;

    pauseTimerButton.style.display = 'none';
    resumeTimerButton.style.display = '';

}

function resumeTimer () {

    if (!timerPaused) {

        return;

    }

    timerPaused = false;

    resumeTimerButton.style.display = 'none';
    pauseTimerButton.style.display = '';

    tickTimer();

}

function endTimer () {

    clearTimeout(tickTimeout);

    pauseTimerButton.disabled = true;
    resumeTimerButton.disabled = true;

}

startTimerButton.addEventListener('click', startTimer);
pauseTimerButton.addEventListener('click', pauseTimer);
resumeTimerButton.addEventListener('click', resumeTimer);
