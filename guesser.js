/****************************************************************************
 * guesser.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

/* global songClips */

const MAX_DISTANCE = 1;

let playButtons, songNameSpans, hyphenSpans, artistSpans;

const guessInput = document.getElementById('guess-input');
const giveUpButton = document.getElementById('give-up-button');

let unguessedClips;

function levenshtein (a, b) {

    let tmp;
    let i, j;
    const alen = a.length;
    const blen = b.length;
    const arr = [];

    /* eslint-disable padded-blocks */
    if (alen === 0) { return blen; }
    if (blen === 0) { return alen; }

    for (i = 0; i <= blen; i++) { arr[i] = [i]; }

    for (j = 0; j <= alen; j++) { arr[0][j] = j; }
    /* eslint-disable padded-blocks */

    for (i = 1; i <= blen; i++) {

        for (j = 1; j <= alen; j++) {

            tmp = a[j - 1] === b[i - 1] ? 0 : 1;
            arr[i][j] = Math.min(arr[i - 1][j] + 1, arr[i][j - 1] + 1, arr[i - 1][j - 1] + tmp);

        }

    }

    return arr[blen][alen];

}

function cleanString (str) {

    // Step 1: Split around " - " and take the left part
    let cleaned = str.split(' - ')[0];

    // Step 2: Remove all text inside parentheses (including the parentheses themselves)
    cleaned = cleaned.replace(/\(.*?\)/g, '');

    // Step 3: Remove all punctuation
    cleaned = cleaned.replace(/[^\w\s]/g, '');

    // Step 4: Replace & or lone N with "and"
    cleaned = cleaned.replace(/&|(\bN\b)/g, 'and');

    // Step 5: Remove all occurrences of "the"
    cleaned = cleaned.replace(/\bthe\b/gi, '');

    // Step 6: Remove all spaces
    cleaned = cleaned.replace(/\s+/g, '');

    return cleaned.toLowerCase();

}

function isCloseMatch (userGuess, actualTitle) {

    const cleanedUserGuess = cleanString(userGuess);
    const cleanedActualTitle = cleanString(actualTitle);
    const distance = levenshtein(cleanedUserGuess, cleanedActualTitle);

    return distance <= MAX_DISTANCE;

}

function revealSong (index, colour) {

    const clip = unguessedClips[index];

    songNameSpans[clip.index].innerText = clip.songName;
    artistSpans[clip.index].innerText = clip.artist;

    songNameSpans[clip.index].style.color = colour;
    hyphenSpans[clip.index].style.color = colour;
    artistSpans[clip.index].style.color = colour;

}

function updateGuessUI (playingIndex) {

    for (let i = 0; i < songNameSpans.length; i++) {

        songNameSpans[i].style.fontWeight = i === playingIndex ? 'bold' : '';
        hyphenSpans[i].style.fontWeight = i === playingIndex ? 'bold' : '';
        artistSpans[i].style.fontWeight = i === playingIndex ? 'bold' : '';

    }

}

function prepareGame () {

    playButtons = document.getElementsByClassName('play-button');
    songNameSpans = document.getElementsByClassName('song-name-span');
    hyphenSpans = document.getElementsByClassName('hyphen-span');
    artistSpans = document.getElementsByClassName('artist-span');

    unguessedClips = JSON.parse(JSON.stringify(songClips));

    guessInput.addEventListener('keyup', () => {

        let matchIndex = -1;

        unguessedClips.forEach((clip, index) => {

            const isMatch = isCloseMatch(guessInput.value, clip.songName);

            if (isMatch) {

                matchIndex = index;

            }

        });

        if (matchIndex !== -1) {

            console.log('Matched with', matchIndex);

            guessInput.value = '';

            revealSong(matchIndex, 'green');

            unguessedClips.splice(matchIndex, 1);

        }

    });

    giveUpButton.addEventListener('click', () => {

        for (let i = 0; i < unguessedClips.length; i++) {

            revealSong(i, 'red');

        }

    });

}
