/****************************************************************************
 * seed.js
 * openacousticdevices.info
 * August 2024
 *****************************************************************************/

function stringToSeed (str) {

    let hash = 0;

    for (let i = 0; i < str.length; i++) {

        hash = str.charCodeAt(i) + ((hash << 5) - hash);

    }

    return hash;

}

function seededRandom (seed) {

    if (typeof seed === 'string') {

        seed = stringToSeed(seed);

    }

    const x = Math.sin(seed) * 10000;

    return x - Math.floor(x);

}
