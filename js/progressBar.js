/****************************************************************************
 * progressBar.js
 * openacousticdevices.info
 * August 2024
 *****************************************************************************/

/* global songClips, currentClipIndex */
/* global isGuessed, isArtistGuessed, isArtistMode */

const progressBarHolder = document.getElementById('progress-bar-holder');
let progressBars = [];

function createProgressBars (onClick) {

    progressBars = [];
    progressBarHolder.innerHTML = '';

    const w = progressBarHolder.offsetWidth / songClips.length;

    songClips.forEach((clip, index) => {

        const progressBarOuter = document.createElement('div');
        progressBarOuter.classList.add('progress');
        progressBarOuter.role = 'progressbar';
        progressBarOuter.style = 'width: ' + w + 'px;';

        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar', 'progress-bar-striped');
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

    if (isArtistMode()) {

        if (isGuessed(i) && isArtistGuessed(i)) {

            progressBars[i].classList.remove('progress-bar-animated', 'bg-current');

            progressBars[i].classList.add('bg-correct');
            progressBars[i].classList.remove('bg-half');

        } else if (isGuessed(i) !== isArtistGuessed(i)) {

            progressBars[i].classList.remove('progress-bar-animated', 'bg-current');

            progressBars[i].classList.add('bg-half');

        } else {

            progressBars[i].classList.remove('bg-correct', 'bg-half');

        }

    } else {

        if (isGuessed(i)) {

            progressBars[i].classList.remove('progress-bar-animated', 'bg-current');

            progressBars[i].classList.add('bg-correct');

        }

    }

}

function updateProgressBarUI () {

    for (let i = 0; i < progressBars.length; i++) {

        if (i < currentClipIndex) {

            progressBars[i].style.width = '100%';
            colourProgressBar(i);

        } else if (i > currentClipIndex) {

            progressBars[i].style.width = '0%';
            progressBars[i].classList.remove('progress-bar-animated', 'bg-current');

        }

        const parent = progressBars[i].parentElement;

        if (isArtistMode()) {

            if (isArtistGuessed(i) && isGuessed(i)) {

                parent.classList.add('guessed');
                parent.classList.remove('half-guessed');

            } else if (isArtistGuessed(i) !== isGuessed(i)) {

                parent.classList.add('half-guessed');

            } else {

                parent.classList.remove('guessed');
                parent.classList.remove('half-guessed');

            }

        } else {

            if (isGuessed(i)) {

                parent.classList.add('guessed');

            } else {

                parent.classList.remove('guessed');

            }

        }

    }

}

function fillAllBars () {

    for (let i = 0; i < progressBars.length; i++) {

        progressBars[i].style.width = '100%';
        progressBars[i].classList.remove('progress-bar-animated', 'bg-current');
        colourProgressBar(i);

    }

}

function fillBar (percentage) {

    progressBars[currentClipIndex].style.width = percentage + '%';
    progressBars[currentClipIndex].classList.add('progress-bar-animated', 'bg-current');

    if (percentage >= 100) {

        progressBars[currentClipIndex].style.width = '100%';

    }

    colourProgressBar(currentClipIndex);

}
