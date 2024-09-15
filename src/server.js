const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const querystring = require('querystring');

dotenv.config();
const app = express();
const port = 5500;

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const authUrl = 'https://accounts.spotify.com/authorize';
const tokenUrl = 'https://accounts.spotify.com/api/token';

// redirects the user to spotify's auth page
app.get('/login', (req, res) => {
    const theScope = 'user-read-playback-state user-read-currently-playing';
    const authQueryParams = querystring.stringify({
        response_type: 'code',
        client_id: clientID,
        scope: theScope,
        redirect_uri: redirectUri,
    })
    console.log('Redirect URI: ',redirectUri);
    res.redirect(`${authUrl}?${authQueryParams}`);
})

// handles the callback & exchange code for access token
app.get('/callback', async(req,res) => {
    const theCode = req.query.code || null;
    const authOptions = {
        method: 'POST',
        url: tokenUrl,
        data: querystring.stringify({
            code: theCode,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        }),
        headers: {
            'Authorization': 'Basic'+Buffer.from(clientID+':'+clientSecret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }

    try{
        const response = await axios(authOptions);
        const accessToken = response.data.access_token;
        res.redirect(`/?access_token=${accessToken}`);
    }
    catch (error){
        console.error('Error getting access token:', error);
        res.status(500).send('Error during authentication');
    }
})

// gets the song thats currently playing
app.get('/', async (req,res) => {
    const accessToken = req.query.access_token;
    const options = {
        method: 'GET',
        url: 'https://api.spotify.com/v1/me/player/currently-player',
        headers:{'Authorization': 'Bearer '+accessToken},
    }
    try{
        const response = await axios(options);
        const song = {
            title: response.data.item.name,
            artist: response.data.item.artists[0].name,
            cover: response.data.item.album.images[0].url,
        }
        res.send(`<h1>Now playing: ${song.title} by ${song.artist} </h1>
            <img src="${song.cover}" width="300">`);
    }
    catch (error){
        console.error('Error getting the current song:',error);
        res.status(500).send('Error getting current song');
    }
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})