/****************************************************************************
 * progressBar.js
 * openacousticdevices.info
 * August 2024
 *****************************************************************************/

/* global songClips */
/* global isGuessed */

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

function fillBar (barIndex, percentage) {

    for (let i = 0; i < progressBars.length; i++) {

        if (i < barIndex || (i === barIndex && percentage === 100)) {

            progressBars[i].style.width = '100%';
            progressBars[i].classList.remove('progress-bar-animated', 'bg-success');

            if (isGuessed(i)) {

                progressBars[i].classList.add('bg-info');

            }

        } else if (i === barIndex) {

            progressBars[i].style.width = percentage + '%';
            progressBars[i].classList.add('progress-bar-animated', 'bg-success');

        } else {

            progressBars[i].style.width = '0%';
            progressBars[i].classList.remove('progress-bar-animated', 'bg-success');

        }

        const parent = progressBars[i].parentElement;

        if (isGuessed(i)) {

            parent.classList.add('guessed');

        } else {

            parent.classList.remove('guessed');

        }

    }

}
