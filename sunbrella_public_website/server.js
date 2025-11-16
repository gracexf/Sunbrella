const express = require('express');
const cors = require('cors'); // To allow your browser to talk to this server
const app = express();
const port = 3000;

// --- IMPORTANT: Put your NEW, REVOKED API key here ---
// This file is secure and NOT sent to the user
const ELEVENLABS_API_KEY = "sk_effc98830c562a48e4c1eca772c1ab4b9e86d17ef49b0c2c"; 
const VOICE_ID = "oGn4Ha2pe2vSJkmIJgLQ"; // The 'Amy Farris' voice

app.use(express.json()); // Allow server to read JSON
app.use(cors()); // Allow your HTML file to call this server

// Create a new endpoint /api/speak
app.post('/api/speak', async (req, res) => {
    const { text } = req.body; // Get the text from the browser's request

    if (!text) {
        return res.status(400).json({ error: 'No text provided' });
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
    const options = {
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        })
    };

    try {
        // Use the built-in 'fetch' - no 'node-fetch' needed!
        const apiResponse = await fetch(url, options); 

        if (!apiResponse.ok) {
            console.error("ElevenLabs API Error:", apiResponse.statusText);
            return res.status(apiResponse.status).send(apiResponse.statusText);
        }

        // Get the audio data as a buffer
        const audioBuffer = await apiResponse.arrayBuffer();

        // Send the audio buffer to the browser
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(Buffer.from(audioBuffer));


    } catch (error) {
        console.error("Error with speech synthesis server:", error);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
});

app.listen(port, () => {
    console.log(`Speech proxy server listening at http://localhost:${port}`);
    console.log("You can now open your ORIGINAL.html file in the browser.");
});