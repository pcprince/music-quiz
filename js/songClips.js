/****************************************************************************
 * songClips.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

// https://open.spotify.com/playlist/5Rrf7mqN8uus2AaQQQNdc1

/* global bootstrap */
/* global token, currentClipIndex, preselectedClips */
/* global stopButton, resumeButton, prevButton, nextButton */
/* global prepareUI, resetUI, resumeClip, stopClip, pauseTimer, resumeTimer, addSecondsToTimer, playSpecificClip, playSpecificSong, seededRandom, isArtistMode, createProgressBars */

const CLIP_LENGTH_MS = 8000;

const MAX_ROWS = 17;

const songUiContainer = document.getElementById('song-ui-container');

const helpButton = document.getElementById('help-button');
const helpModal = new bootstrap.Modal(document.getElementById('help-modal'), {
    backdrop: 'static',
    keyboard: false
});

const reselectNumberSpan = document.getElementById('reselect-number-span');
const cancelReselectButton = document.getElementById('cancel-reselect-button');
const reselectButton = document.getElementById('reselect-button');

const DISTANCE_FROM_START_MS = 10000;
const DISTANCE_FROM_END_MS = 10000;

let songClips = [];

function selectRandomClip (durationMs, seed) {

    // Ensure that the start time is within valid range
    const maxStartTime = Math.max(0, durationMs - DISTANCE_FROM_END_MS - CLIP_LENGTH_MS); // Last 10 seconds + 5 seconds clip length
    const minStartTime = DISTANCE_FROM_START_MS; // Avoid the first 10 seconds

    const r = seed ? seededRandom(seed) : Math.random();

    let startTime = Math.floor(r * (maxStartTime - minStartTime + 1)) + minStartTime;
    startTime = Math.floor(startTime / 1000);

    let clipLength = CLIP_LENGTH_MS; // Always 8 seconds
    clipLength = Math.floor(clipLength / 1000);

    return {startTime, clipLength};

}

function removeDuplicateArtists (songArray) {

    // Create an empty set to store unique artist names
    const seenArtists = new Set();

    // Filter the array, only keeping songs where none of the artists have been seen before
    const uniqueArray = songArray.filter(song => {

        const artists = song.artists;

        // Check if any of the artists in the current song have been seen before
        const hasDuplicate = artists.some(artist => seenArtists.has(artist.name));

        if (hasDuplicate) {

            // console.log('Removed', song.name, '-', song.artists[0].name);
            return false;

        } else {

            artists.forEach(artist => seenArtists.add(artist.name));
            return true;

        }

    });

    // const diff = songArray.length - uniqueArray.length;
    // console.log('Removed ' + diff + ' tracks due to duplicate artists');

    return uniqueArray;

}

async function getRandomSongsFromPlaylist (playlistId, numberOfSongs, token, seed, offset) {

    let allTracks = [];
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    try {

        while (nextUrl) {

            const response = await fetch(nextUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {

                throw new Error('Network response was not ok');

            }

            const data = await response.json();

            // allTracks.push(...data.items);

            for (let i = 0; i < data.items.length; i++) {

                allTracks.push(data.items[i].track);

            }

            nextUrl = data.next;

        }

        if (isArtistMode()) {

            allTracks = removeDuplicateArtists(allTracks);

        }

        let randomSongs = getRandomSubset(allTracks, numberOfSongs, seed, offset);

        randomSongs = addMissingClipTimes(randomSongs, seed);

        return randomSongs;

    } catch (error) {

        console.error('Error fetching songs from Spotify:', error);
        return [];

    }

}

function shuffleArray (array, seed) {

    const shuffledArray = array.slice();

    if (seed === undefined) {

        // If no seed is provided, shuffle randomly
        for (let i = shuffledArray.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];

        }

    } else {

        // Shuffle deterministically using the seed
        for (let i = shuffledArray.length - 1; i > 0; i--) {

            const j = Math.floor(seededRandom(seed + i) * (i + 1));

            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];

        }

    }

    return shuffledArray;

}

function getRandomSubset (array, size, seed, offset) {

    // Shuffle the array, either with the seed or randomly
    const shuffledArray = shuffleArray(array, seed);

    offset = offset !== undefined ? offset : 0;

    size = Math.min(size, array.length);

    // Multiply offset by size to ensure no quiz overlap
    offset = offset * size;

    const result = [];

    for (let i = 0; i < size; i++) {

        const index = (offset + i) % shuffledArray.length;

        result.push(shuffledArray[index]);

    }

    return result;

}

async function searchTrack (name, artist) {

    const query = encodeURIComponent(`track:${name} artist:${artist}`);

    try {

        const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {

            const data = await response.json();

            if (data.tracks.items.length > 0) {

                const track = data.tracks.items[0];

                return track;

            } else {

                console.error('Track not found');
                return null;

            }

        } else {

            console.error('Error fetching song URI:', response.status, response.statusText);
            return null;

        }

    } catch (error) {

        console.error('Error occurred while fetching song URI:', error);
        return null;

    }

}

function createSongUI () {

    const columns = [];
    const columnCount = Math.ceil(songClips.length / MAX_ROWS);

    for (let i = 0; i < columnCount; i++) {

        const c = document.createElement('div');
        c.classList.add('col');

        columns.push(c);

        songUiContainer.appendChild(c);

    }

    songClips.forEach((clip, index) => {

        const clipRow = document.createElement('div');
        clipRow.classList.add('row');

        const clipCol = document.createElement('div');
        clipCol.classList.add('col');
        clipCol.style.paddingLeft = '10%';

        const playClipButton = document.createElement('button');
        // playClipButton.textContent = `Play ${index + 1}`;
        playClipButton.innerHTML = '<img class="button-icon" src="./images/play-fill.svg" alt="Bootstrap">';
        playClipButton.classList.add('playback-button', 'btn', 'btn-secondary', 'play-clip-button');
        playClipButton.id = `play-clip-button${index}`;
        playClipButton.disabled = true;

        playClipButton.addEventListener('click', () => {

            stopButton.style.display = '';
            resumeButton.style.display = 'none';
            prevButton.disabled = false;
            nextButton.disabled = false;

            playSpecificClip(index);

        });

        clipCol.appendChild(playClipButton);

        // Add hidden play all button

        const playAllButton = document.createElement('button');
        playAllButton.innerHTML = '<img class="button-icon" src="./images/play-fill.svg" alt="Bootstrap">';
        playAllButton.classList.add('play-all-button', 'btn', 'btn-primary', 'playback-button');
        playAllButton.id = `play-all-button${index}`;
        playAllButton.style.display = 'none';

        playAllButton.addEventListener('click', () => {

            stopButton.style.display = '';
            resumeButton.style.display = 'none';
            prevButton.disabled = false;
            nextButton.disabled = false;

            playSpecificSong(index);

        });

        clipCol.appendChild(playAllButton);

        // Add song number

        const songNumSpan = document.createElement('span');
        songNumSpan.textContent = `${index + 1}.`;
        songNumSpan.classList.add('song-span');
        songNumSpan.style.marginLeft = '5px';

        clipCol.appendChild(songNumSpan);

        // Add song name

        const songNameSpan = document.createElement('span');
        songNameSpan.textContent = '???????';
        songNameSpan.classList.add('song-name-span', 'song-span');
        songNameSpan.style.marginLeft = '5px';

        clipCol.appendChild(songNameSpan);

        // Add hyphen between song name and artist

        const hyphenSpan = document.createElement('span');
        hyphenSpan.textContent = '-';
        hyphenSpan.style.marginLeft = '3px';
        hyphenSpan.classList.add('hyphen-span', 'song-span');

        clipCol.appendChild(hyphenSpan);

        // Add artist

        const artistSpan = document.createElement('span');
        artistSpan.textContent = '???????';
        artistSpan.classList.add('artist-span', 'song-span');
        artistSpan.style.marginLeft = '5px';

        clipCol.appendChild(artistSpan);

        clipRow.appendChild(clipCol);

        columns[Math.floor(index / MAX_ROWS)].appendChild(clipRow);

    });

}

function addMissingClipTimes (clips, seed) {

    return clips.map(track => {

        const durationMs = track.duration_ms;

        let randomClip;

        if (!track.startTime || !track.clipLength) {

            randomClip = selectRandomClip(durationMs, seed);

        }

        // Specific remasters seem to break the search

        const trackName = track.name.split(' - ')[0];

        // Extract just the relevant artist information

        const artists = [];

        for (let i = 0; i < track.artists.length; i++) {

            const artist = track.artists[i];

            artists.push({
                name: artist.name
            });

        }

        return {
            name: trackName,
            artists,
            duration_ms: track.duration_ms,
            uri: track.uri,
            startTime: !track.startTime ? randomClip.startTime : track.startTime,
            clipLength: !track.clipLength ? randomClip.clipLength : track.clipLength
        };

    });

}

async function loadClipListFromFile (songCount, seed, offset) {

    console.log('Populating clip list from preselected playlist...');

    try {

        let allTracks = preselectedClips;

        // FIXME: If no clip start/length is provided, add them.

        allTracks = addMissingClipTimes(allTracks, seed);

        if (isArtistMode()) {

            allTracks = removeDuplicateArtists(allTracks);

        }

        songCount = Math.min(songCount, allTracks.length);

        console.log(allTracks);

        const randomSongs = getRandomSubset(allTracks, songCount, seed, offset);

        // Process songs (add URI and index)

        const tracksToBeRemoved = [];

        for (let i = 0; i < randomSongs.length; i++) {

            const clip = randomSongs[i];

            if (!clip.uri) {

                const track = await searchTrack(clip.name, clip.artists[0].name);

                if (track) {

                    randomSongs[i].uri = track.uri;
                    randomSongs[i].duration_ms = track.duration_ms;

                } else {

                    // If track can't be found, remove it from the list
                    tracksToBeRemoved.push(i);

                }

            }

        }

        for (let i = 0; i < tracksToBeRemoved.length; i++) {

            console.error('Removing', randomSongs[tracksToBeRemoved[i]]);
            randomSongs.splice(tracksToBeRemoved[i], 1);

        }

        for (let i = 0; i < randomSongs.length; i++) {

            randomSongs[i].index = i;

        }

        songClips = randomSongs;

        createSongUI();

        createProgressBars(playSpecificClip);

        prepareUI();

    } catch (error) {

        console.error('Error reading JSON file:', error);

    }

}

async function populateClipList (playlistIdArray, songCount, seed, offset) {

    console.log('Populating clip list...');

    const playListCount = playlistIdArray.length;

    let trackCounts;

    if (playlistIdArray.length === 1) {

        trackCounts = [songCount];

    } else {

        // Calculate how many tracks should come from each array

        const baseValue = Math.floor(songCount / playListCount);
        trackCounts = Array(playListCount).fill(baseValue);

        const remainder = songCount - (baseValue * playListCount);

        // Assign the remaining tracks to a random playlist

        const r = seed ? seededRandom(seed) : Math.random();
        const remainderIndex = Math.floor(r * (playListCount - 1));

        trackCounts[remainderIndex] += remainder;

    }

    songClips = [];

    for (let i = 0; i < playListCount; i++) {

        const playlistId = playlistIdArray[i];
        const trackCount = trackCounts[i];

        const newSongs = await getRandomSongsFromPlaylist(playlistId, trackCount, token, seed, offset);

        // Process songs (add URI and index)

        const tracksToBeRemoved = [];

        for (let i = 0; i < newSongs.length; i++) {

            const clip = newSongs[i];

            if (!clip.uri) {

                const track = await searchTrack(clip.name, clip.artists[0].name);

                if (track) {

                    newSongs[i].uri = track.uri;
                    newSongs[i].duration_ms = track.duration_ms;

                } else {

                    // Remove song from list
                    tracksToBeRemoved.push(i);

                }

            }

        }

        for (let i = 0; i < tracksToBeRemoved.length; i++) {

            console.error('Removing', newSongs[tracksToBeRemoved[i]]);
            newSongs.splice(tracksToBeRemoved[i], 1);

        }

        songClips = songClips.concat(newSongs);

    }

    console.log(songClips);

    // Shuffle

    songClips = getRandomSubset(songClips, songClips.length, seed, offset);

    // Add index value

    songClips = songClips.map((item, index) => {

        return {...item, index};

    });

    createSongUI();

    createProgressBars(playSpecificClip);

    prepareUI();

}

function clearClipList () {

    songClips = [];

    songUiContainer.innerHTML = '';

    resetUI();

}

helpButton.addEventListener('click', () => {

    reselectNumberSpan.innerText = currentClipIndex + 1;

    stopClip();
    pauseTimer();

    helpModal.show();

});

cancelReselectButton.addEventListener('click', () => {

    resumeClip();
    resumeTimer();

    helpModal.hide();

});

reselectButton.addEventListener('click', () => {

    const newRandomClip = selectRandomClip(songClips[currentClipIndex].duration_ms);

    console.log('Updated clip ' + currentClipIndex + '. ' + songClips[currentClipIndex].startTime + ' -> ' + newRandomClip.startTime);

    songClips[currentClipIndex].startTime = newRandomClip.startTime;
    songClips[currentClipIndex].clipLength = newRandomClip.clipLength;

    addSecondsToTimer(5);

    resumeClip();
    resumeTimer();

    helpModal.hide();

});
