/****************************************************************************
 * progressBar.js
 * openacousticdevices.info
 * August 2024
 *****************************************************************************/

/* global songClips, currentClipIndex */
/* global isGuessed, isArtistGuessed, isArtistMode */

const progressBarHolder = document.getElementById('progress-bar-holder');
const emptyProgressBarHolder = document.getElementById('empty-progress-bar-holder');
let progressBars = [];

function showEmptyProgressBar () {

    emptyProgressBarHolder.style.display = '';
    progressBarHolder.innerHTML = '';

}

function createProgressBars (onClick) {

    emptyProgressBarHolder.style.display = 'none';

    progressBars = [];
    progressBarHolder.innerHTML = '';

    const w = progressBarHolder.offsetWidth / songClips.length;

    songClips.forEach((clip, index) => {

        const progressBarOuter = document.createElement('div');
        progressBarOuter.classList.add('progress');
        progressBarOuter.role = 'progressbar';
        progressBarOuter.style = 'width: ' + w + 'px;';

        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar', 'progress-bar-striped', 'bg-unguessed');
        progressBar.style = 'width: 0%; transition: none;';

        progressBars.push(progressBar);
        progressBarOuter.appendChild(progressBar);

        const progressBarLabel = document.createElement('small');
        progressBarLabel.classList.add('justify-content-center', 'd-flex', 'position-absolute');
        progressBarLabel.innerText = (index + 1);
        progressBarLabel.style = 'width: ' + w + 'px; font-weight: bold; user-select: none;';

        progressBarLabel.addEventListener('click', () => {

            onClick(index);

        });

        progressBarOuter.appendChild(progressBarLabel);

        progressBarHolder.appendChild(progressBarOuter);

    });

}

function colourProgressBar (i) {

    if (i !== currentClipIndex) {

        progressBars[i].classList.remove('progress-bar-animated');

    }

    if (isArtistMode()) {

        if (isGuessed(i) && isArtistGuessed(i)) {

            progressBars[i].classList.add('bg-guessed');
            progressBars[i].classList.remove('bg-half-guessed', 'bg-unguessed');

        } else if (isGuessed(i) !== isArtistGuessed(i)) {

            progressBars[i].classList.add('bg-half-guessed');
            progressBars[i].classList.remove('bg-unguessed', 'bg-guessed');

        } else {

            progressBars[i].classList.add('bg-unguessed');
            progressBars[i].classList.remove('bg-guessed', 'bg-half-guessed');

        }

    } else {

        if (isGuessed(i)) {

            progressBars[i].classList.add('bg-guessed');
            progressBars[i].classList.remove('bg-unguessed');

        }

    }

}

function updateProgressBarUI () {

    for (let i = 0; i < progressBars.length; i++) {

        colourProgressBar(i);

        if (i < currentClipIndex) {

            progressBars[i].style.width = '100%';

        } else if (i > currentClipIndex) {

            progressBars[i].style.width = '0%';

        }

        const parent = progressBars[i].parentElement;

        if (isArtistMode()) {

            if (isArtistGuessed(i) && isGuessed(i)) {

                parent.classList.add('guessed');
                parent.classList.remove('half-guessed', 'unguessed');

            } else if (isArtistGuessed(i) !== isGuessed(i)) {

                parent.classList.add('half-guessed');
                parent.classList.remove('guessed', 'unguessed');

            } else {

                parent.classList.add('unguessed');
                parent.classList.remove('half-guessed', 'guessed');

            }

        } else {

            if (isGuessed(i)) {

                parent.classList.add('guessed');
                parent.classList.remove('unguessed');

            } else {

                parent.classList.add('unguessed');
                parent.classList.remove('guessed');

            }

        }

    }

}

function fillAllBars () {

    for (let i = 0; i < progressBars.length; i++) {

        progressBars[i].classList.remove('progress-bar-animated');
        progressBars[i].style.width = '100%';
        colourProgressBar(i);

    }

}

function fillBar (percentage) {

    if (currentClipIndex < 0) {

        return;

    }

    progressBars[currentClipIndex].style.width = percentage + '%';

    if (percentage >= 100) {

        progressBars[currentClipIndex].style.width = '100%';

    }

    progressBars[currentClipIndex].classList.add('progress-bar-animated');

}
