/****************************************************************************
 * pkce.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

const clientId = 'b91c4f9175aa4b9d8ed6f43c23a5620c';
const redirectUri = 'http://localhost:8000';
// const redirectUri = 'https://pcprince.co.uk/music-quiz';

const scope = 'streaming user-read-email user-read-private';
const authUrl = new URL("https://accounts.spotify.com/authorize")

async function sha256 (plain) {

    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)

}

function base64encode (input) {

    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

}

function generateRandomString (length) {

    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");

}

async function redirect () {

    const codeVerifier  = generateRandomString(64);
    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64encode(hashed);

    window.localStorage.setItem('code_verifier', codeVerifier);

    const params =  {
        response_type: 'code',
        client_id: clientId,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
    }
    
    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();

}

async function authorise () {
    
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');

    if (code) {

        let codeVerifier = localStorage.getItem('code_verifier');

        const payload = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                code_verifier: codeVerifier,
            }),
        };

        const url = 'https://accounts.spotify.com/api/token';

        const body = await fetch(url, payload);
        const response = await body.json();

        localStorage.setItem('access_token', response.access_token);

        console.log('Obtained access token:', response.access_token);

        token = response.access_token;

        populateClipList();
        connectToPlayer();

    } else {

        redirect();

    }

}

window.onSpotifyWebPlaybackSDKReady = authorise;
