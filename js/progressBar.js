/****************************************************************************
 * progressBar.js
 * openacousticdevices.info
 * August 2024
 *****************************************************************************/

/* global songClips, currentClipIndex */
/* global isGuessed, isArtistGuessed, isArtistMode */

const progressBarHolder = document.getElementById('progress-bar-holder');
let progressBars = [];
let currentProgressBars = [];

function createProgressBars (onClick) {

    progressBars = [];
    currentProgressBars = [];
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

        const currentProgressBar = document.createElement('div');
        currentProgressBar.classList.add('progress-bar', 'progress-bar-striped', 'progress-bar-animated', 'bg-current');
        currentProgressBar.style = 'width: 0%; transition: none; display: none;';

        currentProgressBars.push(currentProgressBar);
        progressBarOuter.appendChild(currentProgressBar);

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

        if (i < currentClipIndex) {

            currentProgressBars[i].style.display = 'none';

            progressBars[i].style.display = '';
            progressBars[i].style.width = '100%';
            colourProgressBar(i);

        } else if (i > currentClipIndex) {

            currentProgressBars[i].style.display = 'none';

            progressBars[i].style.display = '';
            progressBars[i].style.width = '0%';

        } else {

            progressBars[i].style.display = 'none';

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

        currentProgressBars[i].style.display = 'none';

        progressBars[i].style.display = '';
        progressBars[i].style.width = '100%';
        colourProgressBar(i);

    }

}

function fillBar (percentage) {

    currentProgressBars[currentClipIndex].style.width = percentage + '%';

    if (percentage >= 100) {

        currentProgressBars[currentClipIndex].style.width = '100%';

    }

    currentProgressBars[currentClipIndex].style.display = '';
    progressBars[currentClipIndex].style.display = 'none';

    colourProgressBar(currentClipIndex);

}
