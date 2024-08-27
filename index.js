/****************************************************************************
 * index.js
 * openacousticdevices.info
 * August 2024
 *****************************************************************************/

/* global location */
/* global redirect */

const authoriseButton = document.getElementById('authorise-button');

authoriseButton.addEventListener('click', redirect);

window.onload = () => {

    if (location.protocol !== 'https:') {

        location.replace(`https:${location.href.substring(location.protocol.length)}`);

    }

};
