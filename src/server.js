// const dotenv = require('dotenv');
// const express = require('express');
// const axios = require('axios');
// const querystring = require('querystring');
// const cors = require('cors');
//test

require('dotenv').config();
// dotenv.config();
const app = express();
app.use(cors());
const port = 5501;

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

console.log('client id:', clientID);
console.log('redirect uri:', redirectUri);

const authUrl = 'https://accounts.spotify.com/authorize';
const tokenUrl = 'https://accounts.spotify.com/api/token';

// Redirects the user to Spotify's auth page
app.get('/login', (req, res) => {
    const theScope = 'user-read-playback-state user-read-currently-playing';
    const authQueryParams = querystring.stringify({
        response_type: 'code',
        client_id: clientID,
        scope: theScope,
        redirect_uri: redirectUri,
    })

    console.log('Auth URL:', `${authUrl}?${authQueryParams}`);
    res.redirect(`${authUrl}?${authQueryParams}`);
})

// Handles the callback & exchanges code for access token
app.get('/callback', async (req, res) => {
    const theCode = req.query.code || null;

    if (!theCode) {
        return res.status(400).send('Missing authorization code');
    }

    const authOptions = {
        method: 'POST',
        url: tokenUrl,
        data: querystring.stringify({
            code: theCode,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        }),
        headers: {
            'Authorization': 'Basic ' + Buffer.from(clientID + ':' + clientSecret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }
    console.log('request data:',authOptions.data);
    console.log('encode creds:', Buffer.from(clientID + ':' + clientSecret).toString('base64'));

    try {
        console.log('client id:', clientID);
        console.log('redirect uri:', redirectUri);
        const response = await axios(authOptions);
        const accessToken = response.data.access_token;
        console.log('Access Token:', accessToken);
        res.redirect(`/?access_token=${accessToken}`);
    } catch (error) {
        console.error('Error getting access token:', error.response ? error.response.data : error.message);
        res.status(500).send('Error during authentication');
    }
})

// Gets the song that's currently playing
app.get('/', async (req, res) => {
    const accessToken = req.query.access_token;

    if (!accessToken) {
        return res.status(400).send('Missing access token');
    }

    const options = {
        method: 'GET',
        url: 'https://api.spotify.com/v1/me/player/currently-playing',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
    }

    try {
        const response = await axios(options);
        const song = {
            title: response.data.item.name,
            artist: response.data.item.artists[0].name,
            cover: response.data.item.album.images[0].url,
        };
        res.send(`<h1>Now playing: ${song.title} by ${song.artist}</h1>
                  <img src="${song.cover}" width="300">`);
        res.json(song);
    } catch (error) {
        console.error('Error getting the current song:', error.response ? error.response.data : error.message);
        res.status(500).send('Error getting current song');
    }
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})
