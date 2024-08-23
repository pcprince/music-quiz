/****************************************************************************
 * guesser.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

/* global songClips */
/* global endGame, updateScore, isArtistMode, updateProgressBarUI */
/* global remakeButton */

const MAX_DISTANCE = 1;

let playClipButtons, songNameSpans, hyphenSpans, artistSpans;

const guessInput = document.getElementById('guess-input');
const giveUpButton = document.getElementById('give-up-button');

let unguessedClips, unguessedArtistClips;

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

function cleanString (input) {

    // Step 1: Convert the string to lowercase
    let cleaned = input.toLowerCase();

    // Step 2: Remove text inside standard brackets if it's at the end of the string
    cleaned = cleaned.replace(/\s*\(.*?\)\s*$/, '');

    // Step 3: Split the string around " - " and take all the text to the left of it
    cleaned = cleaned.split(' - ')[0];

    // Step 4: Remove all punctuation
    cleaned = cleaned.replace(/[^\w\s]/g, '');

    // Step 5: Replace & or a lone 'n' with "and"
    cleaned = cleaned.replace(/\s*&\s*/g, 'and').replace(/\bn\b/g, 'and');

    // Step 6: Remove all instances of "the"
    cleaned = cleaned.replace(/\bthe\b/g, '');

    // Step 8: Replace "part" with "pt"
    cleaned = cleaned.replace(/\bpart\b/g, 'pt');

    // Step 9: Strip out all spaces
    cleaned = cleaned.replace(/\s+/g, '');

    return cleaned;

}

function isCloseMatch (userGuess, actualName) {

    const cleanedUserGuess = cleanString(userGuess);
    const cleanedActualName = cleanString(actualName);
    const distance = levenshtein(cleanedUserGuess, cleanedActualName);

    return distance <= MAX_DISTANCE;

}

function revealArtist (index, colour) {

    const clip = unguessedArtistClips[index];

    artistSpans[clip.index].innerText = clip.artists.map(artist => artist.name).join(', ');
    artistSpans[clip.index].style.color = colour;

}

function revealSong (index, colour) {

    const clip = unguessedClips[index];

    songNameSpans[clip.index].innerText = clip.songName;

    songNameSpans[clip.index].style.color = colour;
    hyphenSpans[clip.index].style.color = colour;

    if (!isArtistMode()) {

        artistSpans[clip.index].innerText = clip.artists.map(artist => artist.name).join(', ');
        artistSpans[clip.index].style.color = colour;

    }

}

function updateGuessUI (playingIndex) {

    for (let i = 0; i < songNameSpans.length; i++) {

        songNameSpans[i].style.fontWeight = i === playingIndex ? 'bold' : '';
        hyphenSpans[i].style.fontWeight = i === playingIndex ? 'bold' : '';
        artistSpans[i].style.fontWeight = i === playingIndex ? 'bold' : '';

    }

}

async function prepareUI () {

    playClipButtons = document.getElementsByClassName('play-clip-button');
    songNameSpans = document.getElementsByClassName('song-name-span');
    hyphenSpans = document.getElementsByClassName('hyphen-span');
    artistSpans = document.getElementsByClassName('artist-span');

    unguessedClips = JSON.parse(JSON.stringify(songClips));
    unguessedArtistClips = JSON.parse(JSON.stringify(songClips));

}

function resetUI () {

    playClipButtons = [];
    songNameSpans = [];
    hyphenSpans = [];
    artistSpans = [];

    unguessedClips = [];
    unguessedArtistClips = [];

}

function isArtistGuessed (i) {

    return !unguessedArtistClips.some(obj => obj.index === i);

}

function isGuessed (i) {

    return !unguessedClips.some(obj => obj.index === i);

}

function checkArtistGuess (guess) {

    let matchIndex = -1;

    unguessedArtistClips.forEach((clip, index) => {

        const artists = clip.artists;

        for (let i = 0; i < artists.length; i++) {

            const isMatch = isCloseMatch(guess, artists[i].name);

            if (isMatch) {

                matchIndex = index;

            }

        }

    });

    if (matchIndex !== -1) {

        const artists = unguessedArtistClips[matchIndex].artists;

        // Let user type final letter if that is the only difference

        for (let i = 0; i < artists.length; i++) {

            const artist = artists[i].name;

            const likelyArtistName = cleanString(artist);

            if (likelyArtistName.substring(0, likelyArtistName.length - 1) === cleanString(guess)) {

                return;

            }
        }

        console.log('Matched with', matchIndex);

        guessInput.value = '';

        revealArtist(matchIndex, 'green');

        unguessedArtistClips.splice(matchIndex, 1);

        updateScore();

        updateProgressBarUI();

    }

}

function checkSongGuess (guess) {

    let matchIndex = -1;

    unguessedClips.forEach((clip, index) => {

        const isMatch = isCloseMatch(guess, clip.songName);

        if (isMatch) {

            matchIndex = index;

        }

    });

    if (matchIndex !== -1) {

        // Let user type final letter if that is the only difference

        const likelyClipName = cleanString(unguessedClips[matchIndex].songName);

        if (likelyClipName.substring(0, likelyClipName.length - 1) === cleanString(guess)) {

            return;

        }

        console.log('Matched with', matchIndex);

        guessInput.value = '';

        revealSong(matchIndex, 'green');

        unguessedClips.splice(matchIndex, 1);

        updateScore();

        updateProgressBarUI();

    }

}

guessInput.addEventListener('keyup', () => {

    const guess = guessInput.value;

    checkSongGuess(guess);

    if (isArtistMode()) {

        checkArtistGuess(guess);

    }

});

giveUpButton.addEventListener('click', () => {

    console.log('Giving up');

    giveUpButton.style.display = 'none';
    remakeButton.style.display = '';

    endGame();

});
