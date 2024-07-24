/****************************************************************************
 * songClips.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

// Song clip JSON structure
// let songClips = [
//     {
//         songName: "99 Red Balloons",
//         artist: "Goldfinger",
//         startTime: 30,
//         clipLength: 5
//     },
//     {
//         songName: "Undone - The Sweater Song",
//         artist: "Weezer",
//         startTime: 60,
//         clipLength: 5
//     },
//     {
//         songName: "September",
//         artist: "Earth, Wind & Fire",
//         startTime: 20,
//         clipLength: 5
//     }
// ];

const DISTANCE_FROM_START_MS = 10000;
const DISTANCE_FROM_END_MS = 10000;

let songClips = [];

async function getRandomSongsFromSpotifyRadio(playlistId, numberOfSongs, token) {

    const allTracks = [];
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`; // Initial URL with maximum limit
    
    try {

        // Fetch all tracks from the playlist
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
            allTracks.push(...data.items);
            nextUrl = data.next; // Get the next URL if available

        }

        // Randomly select the specified number of songs
        const randomSongs = getRandomSubset(allTracks, numberOfSongs);

        return randomSongs.map(item => {

            const track = item.track;
            const durationMs = track.duration_ms; // Track duration in milliseconds

            // Ensure that the start time is within valid range
            const maxStartTime = Math.max(0, durationMs - DISTANCE_FROM_END_MS - 5000); // Last 10 seconds + 5 seconds clip length
            const minStartTime = DISTANCE_FROM_START_MS; // Avoid the first 10 seconds
            const startTime = Math.floor(Math.random() * (maxStartTime - minStartTime + 1)) + minStartTime;

            return {
                songName: track.name,
                artist: track.artists.map(artist => artist.name).join(', '),
                startTime: Math.floor(startTime / 1000), // Convert to seconds
                clipLength: 5 // Always 5 seconds
            };

        });

    } catch (error) {

        console.error('Error fetching songs from Spotify:', error);
        return [];

    }

}

// Helper function to get a random subset of an array
function getRandomSubset(array, size) {

    const shuffled = array.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);

}

function populateClipList () {

    const playlistId = '5Rrf7mqN8uus2AaQQQNdc1';

    getRandomSongsFromSpotifyRadio(playlistId, 20, token).then(songs => {
    
        songClips = songs;
    
        songClips = songClips.map((clip, index) => ({
            ...clip,
            index: index
        }));
    
        createSongUI();
    
        prepareGame();
    
    });

}
