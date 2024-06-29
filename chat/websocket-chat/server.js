const WebSocket = require('ws');
const http = require('http');

// Create an HTTP server to serve the chat HTML page
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Simple Chat</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: black;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }

                .chat-container {
                    width: 400px;
                    border: 1px solid #dbdbdb;
                    border-radius: 8px;
                    background-color: black;
                    color: white;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    padding: 20px;
                }

                .chat-container h1 {
                    text-align: center;
                    font-size: 24px;
                    color: wheat;
                    margin-top: 10px;
                }

                .chat-messages {
                    height: 300px;
                    overflow-y: scroll;
                    padding: 10px;
                    border-bottom: 1px solid #dbdbdb;
                    margin-bottom: 10px;
                }

                .input-container {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;
                }

                .input-container input[type="text"], 
                .input-container button {
                    height: 40px;
                    padding: 10px;
                    border: 1px solid #dbdbdb;
                    border-radius: 4px;
                    margin-right: 10px;
                    font-size: 14px;
                    box-sizing: border-box;
                }

                .input-container button {
                    background-color: #0095f6;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <div class="chat-container">
                <h1>Chat Room</h1>
                <div class="chat-messages" id="chat"></div>
                <div class="input-container">
                    <input type="text" id="name" placeholder="Your Name">
                    <button onclick="setName()">Set Name</button>
                </div>
                <div class="input-container">
                    <input type="text" id="message" placeholder="Type a message..." disabled>
                    <button onclick="sendMessage()" disabled>Send</button>
                </div>
            </div>
    
            <script>
                const ws = new WebSocket('wss://' + location.host);
                let userName = '';

                ws.onopen = function(event) {
                    console.log('WebSocket connection established.');
                };

                ws.onmessage = function(event) {
                    const chat = document.getElementById('chat');
                    const newMessage = document.createElement('div');
                    const messageData = JSON.parse(event.data);

                    newMessage.innerHTML = '<strong>' + messageData.sender + ':</strong> ' + messageData.message;
                    chat.appendChild(newMessage);
                    chat.scrollTop = chat.scrollHeight;
                };

                ws.onerror = function(error) {
                    console.error('WebSocket error:', error);
                };

                function setName() {
                    const nameInput = document.getElementById('name');
                    userName = nameInput.value.trim();
                    
                    if (userName) {
                        nameInput.disabled = true;
                        document.getElementById('message').disabled = false;
                        document.querySelector('button[onclick="sendMessage()"]').disabled = false;
                    } else {
                        alert('Please enter a name.');
                    }
                }

                function sendMessage() {
                    const messageInput = document.getElementById('message');
                    const message = messageInput.value;

                    if (message.trim()) {
                        ws.send(JSON.stringify({ sender: userName, message: message }));
                    }

                    messageInput.value = '';
                }
            </script>
        </body>
        </html>
    `);
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        const messageData = JSON.parse(data);
        
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messageData));
            }
        });
    });

    ws.send(JSON.stringify({ sender: 'Server', message: 'Welcome to the chat!' }));
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
