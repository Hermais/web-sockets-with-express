const express = require('express');
const WebSocket = require('ws');

const app = express();
const server = require('http').createServer(app);
const port = 3002;
const wss = new WebSocket.Server({ server });

const existingEntries = [];

function customLog(message) {
    console.log(`SERVER: ${message}`);
}

wss.on('connection', (ws) => {
    customLog('New client connected');
    
    // Send existing entries to the new client
    ws.send(JSON.stringify(existingEntries));

    ws.on('message', (message) => {
        customLog(`Received message => ${message}`);
        
        // Parse the message
        const parsedMessage = JSON.parse(message);

        // Store the message in existing entries
        existingEntries.push(parsedMessage);

        // Broadcast the message to all clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify([parsedMessage]));
            }
        });
    });

    ws.on('close', () => {
        customLog('Client disconnected');
    });
});

server.listen(port, () => {
    customLog(`Server is running on http://localhost:${port}`);
});

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        customLog(`Port ${port} is already in use`);
        process.exit(1);
    } else {
        customLog(`Server error: ${err}`);
    }
});