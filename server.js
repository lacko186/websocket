const express = require('express');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const PORT = 3000;
const WS_PORT = 5000;

const wss = new WebSocket.Server({ port: WS_PORT });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index');
});

const uzenetek = [];

wss.on('connection', (ws) => {
    console.log('Kliens csatlakozott');
    
    ws.send(JSON.stringify({ type: 'init', messages: uzenetek }));
    
    ws.on('message', (data) => {
        try {
            const uzenet = JSON.parse(data.toString());
            uzenetek.push(uzenet);
            
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'message', data: uzenet }));
                }
            });
            
            console.log('Új üzenet:', uzenet);
        } catch (error) {
            console.error('Hibás üzenet formátum:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('Kliens lecsatlakozott');
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket hiba:', error);
    });
});

app.listen(PORT, () => {
    console.log(`HTTP szerver fut a ${PORT}-es porton`);
    console.log(`WebSocket szerver fut a ${WS_PORT}-es porton`);
});