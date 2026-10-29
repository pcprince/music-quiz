/****************************************************************************
 * pkce.js
 * openacousticdevices.info
 * July 2024
 *****************************************************************************/

/* global localStorage, location */
/* global enablePrepareUI */

const clientId = 'b91c4f9175aa4b9d8ed6f43c23a5620c';
const homeURL = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:8000' : 'https://pcprince.co.uk/music-quiz';
const redirectURL = homeURL + '/play.html';

const scope = 'streaming user-read-email user-read-private';
const authUrl = new URL('https://accounts.spotify.com/authorize');

let token;

let spotifyReady;
const ACCESS_TOKEN_KEY = 'access_token';
const ACCESS_TOKEN_EXPIRY_KEY = 'access_token_expiry';

function getStoredAccessToken () {

    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedExpiryMs = Number(localStorage.getItem(ACCESS_TOKEN_EXPIRY_KEY));

    if (!storedToken || Number.isNaN(storedExpiryMs)) {

        return null;

    }

    if (storedExpiryMs <= Date.now()) {

        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(ACCESS_TOKEN_EXPIRY_KEY);
        return null;

    }

    return storedToken;

}

async function sha256 (plain) {

    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);

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
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');

}

async function redirect () {

    if (location.protocol !== 'https:' && !(location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {

        console.error('App only runs on HTTPS');

        return;

    }

    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    window.localStorage.setItem('code_verifier', codeVerifier);

    const params = {
        response_type: 'code',
        client_id: clientId,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectURL
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();

}

async function authorise () {

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {

        const storedToken = getStoredAccessToken();

        if (storedToken) {

            token = storedToken;
            spotifyReady = true;
            enablePrepareUI();
            return;

        }

        redirect();
        return;

    }

    const codeVerifier = localStorage.getItem('code_verifier');

    if (!codeVerifier) {

        console.error('Missing PKCE code verifier. Redirecting to restart auth flow.');
        redirect();
        return;

    }

    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectURL,
            code_verifier: codeVerifier
        })
    };

    const url = 'https://accounts.spotify.com/api/token';

    try {

        const body = await fetch(url, payload);
        const response = await body.json();

        if (response.access_token) {

            const parsedExpiresIn = Number.parseInt(response.expires_in, 10);
            const expiresInSeconds = Number.isNaN(parsedExpiresIn) ? 3600 : parsedExpiresIn;

            localStorage.setItem(ACCESS_TOKEN_KEY, response.access_token);
            localStorage.setItem(ACCESS_TOKEN_EXPIRY_KEY, String(Date.now() + (expiresInSeconds * 1000)));

            token = response.access_token;

            spotifyReady = true;

            enablePrepareUI();

        } else {

            console.error('Failed to verify code');
            console.error('Error:', response.error);
            console.log('Redirecting to home page in 3 seconds...');

            setTimeout(() => {

                window.location.href = homeURL;

            }, 3000);

        }

    } catch (error) {

        console.error('Failed to exchange Spotify authorization code:', error);
        console.log('Redirecting to home page in 3 seconds...');

        setTimeout(() => {

            window.location.href = homeURL;

        }, 3000);

    }

}
