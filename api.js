const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

app.post('/api/gists', async (req, res) => {
    try {
        const response = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                public: true,
                files: {
                    'index.html': {
                        content: req.body.content
                    }
                },
                description: 'Created with realtimehtml.com'
            })
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error creating gist:', error);
        res.status(500).json({ error: 'Failed to create gist' });
    }
});

app.get('/api/gists/:id', async (req, res) => {
    try {
        const response = await fetch(`https://api.github.com/gists/${req.params.id}`, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching gist:', error);
        res.status(500).json({ error: 'Failed to fetch gist' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 