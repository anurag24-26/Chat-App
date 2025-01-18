const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Create an HTTP server to serve the chat HTML page
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        // Serve the HTML file
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mobile Chat</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #128C7E;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background-image: url('https://via.placeholder.com/800x800'); /* Add aesthetic background */
                        background-size: cover;
                        background-position: center;
                    }

                    .chat-container {
                        width: 100%;
                        max-width: 400px;
                        background-color: #ffffff;
                        border-radius: 10px;
                        box-shadow: 0 5px 10px rgba(0,0,0,0.1);
                        overflow: hidden;
                    }

                    .header {
                        background-color: #075E54;
                        color: white;
                        padding: 15px;
                        text-align: center;
                        font-size: 18px;
                    }

                    .messages {
                        padding: 10px;
                        overflow-y: auto;
                        height: 60vh;
                    }

                    .message-bubble {
                        padding: 8px 15px;
                        margin: 5px;
                        max-width: 75%;
                        border-radius: 20px;
                        font-size: 16px;
                        display: inline-block;
                    }

                    .message-bubble.sent {
                        background-color: #DCF8C6;
                        margin-left: auto;
                    }

                    .message-bubble.received {
                        background-color: #ffffff;
                        margin-right: auto;
                    }

                    .input-area {
                        display: flex;
                        padding: 10px;
                        background-color: #f0f0f0;
                        border-top: 1px solid #ddd;
                    }

                    .input-area input, .input-area button, .input-area input[type="file"] {
                        padding: 10px;
                        border-radius: 20px;
                        border: none;
                        font-size: 16px;
                    }

                    .input-area input[type="file"] {
                        width: 0;
                        height: 0;
                        visibility: hidden;
                    }

                    .input-area input[type="file"] + label {
                        background-color: #25D366;
                        color: white;
                        cursor: pointer;
                    }

                    .input-area input {
                        flex: 1;
                        margin-right: 10px;
                    }

                    .input-area button {
                        background-color: #25D366;
                        color: white;
                        cursor: pointer;
                    }

                    .input-area button:disabled {
                        background-color: #ccc;
                    }

                    #user-list {
                        margin-top: 10px;
                        border-top: 3px solid #0d9e9e;
                        padding-top: 10px;
                        font-size: 18px;
                    }

                    #login-screen, #chat-screen {
                        display: none;
                    }

                    #login-screen.active, #chat-screen.active {
                        display: block;
                    }

                    .online-users {
                        font-size: 14px;
                        color: #999;
                        margin-top: 10px;
                    }

                </style>
            </head>
            <body>
                <div id="login-screen" class="chat-container active">
                    <h1>Enter Your Name</h1>
                    <input type="text" id="name" placeholder="Your Name">
                    <button onclick="setName()">Join Chat</button>
                </div>

                <div id="chat-screen" class="chat-container">
                    <div class="header">
                        <h1>Chat Room</h1>
                    </div>
                    <div id="user-list" class="online-users">Online Users:</div>
                    <div class="messages" id="chat"></div>
                    <div class="input-area">
                        <input type="text" id="message" placeholder="Type a message..." disabled>
                        <input type="file" id="file-input" onchange="sendFile()" />
                        <label for="file-input">📎</label>
                        <button onclick="sendMessage()" disabled>Send</button>
                    </div>
                </div>

                <script>
                    const ws = new WebSocket('wss://' + location.host); // Use wss:// for secure WebSocket connection
                    let userName = '';

                    ws.onopen = function(event) {
                        console.log('WebSocket connection established.');
                    };

                    ws.onmessage = function(event) {
                        const chat = document.getElementById('chat');
                        const newMessage = document.createElement('div');
                        const messageData = JSON.parse(event.data);

                        if (messageData.type === 'message') {
                            // Display the new message in the chat
                            const bubbleClass = messageData.sender === userName ? 'sent' : 'received';
                            newMessage.classList.add('message-bubble', bubbleClass);
                            newMessage.innerHTML = '<strong>' + messageData.sender + ':</strong> ' + messageData.message;
                            chat.appendChild(newMessage);
                            chat.scrollTop = chat.scrollHeight;
                        } else if (messageData.type === 'userList') {
                            // Update the list of online users
                            const userList = document.getElementById('user-list');
                            userList.innerHTML = 'Online Users: ' + messageData.users.join(', ');
                        }
                    };

                    ws.onerror = function(error) {
                        console.error('WebSocket error:', error);
                    };

                    function setName() {
                        const nameInput = document.getElementById('name');
                        userName = nameInput.value.trim();

                        if (userName) {
                            document.getElementById('login-screen').classList.remove('active');
                            document.getElementById('chat-screen').classList.add('active');

                            nameInput.disabled = true;
                            document.getElementById('message').disabled = false;
                            document.querySelector('button[onclick="sendMessage()"]').disabled = false;

                            // Notify server of new user
                            ws.send(JSON.stringify({ type: 'setName', name: userName }));
                        } else {
                            alert('Please enter a name.');
                        }
                    }

                    function sendMessage() {
                        const messageInput = document.getElementById('message');
                        const message = messageInput.value;

                        if (message.trim()) {
                            ws.send(JSON.stringify({ type: 'message', sender: userName, message: message }));
                        }

                        messageInput.value = '';
                    }

                    function sendFile() {
                        const fileInput = document.getElementById('file-input');
                        const file = fileInput.files[0];

                        if (file) {
                            const reader = new FileReader();

                            reader.onload = function() {
                                const fileMessage = reader.result;

                                // Send file as base64-encoded string
                                ws.send(JSON.stringify({
                                    type: 'message',
                                    sender: userName,
                                    message: 'Sent a file',
                                    file: fileMessage
                                }));
                            };

                            reader.readAsDataURL(file);
                        }
                    }
                </script>
            </body>
            </html>
        `);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

let users = {}; // Object to store usernames and their WebSocket connections

// Update user list for all connected clients
function updateUserList() {
    const userList = Object.keys(users);
    const message = JSON.stringify({ type: 'userList', users: userList });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

wss.on('connection', (ws) => {
    let userName = '';

    ws.on('message', (data) => {
        const messageData = JSON.parse(data);

        if (messageData.type === 'setName') {
            userName = messageData.name;
            users[userName] = ws;
            updateUserList(); // Update list when a new user joins

            // Broadcast that a new user has joined
            const joinMessage = JSON.stringify({ type: 'message', sender: 'Server', message: `${userName} has joined the chat.` });
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(joinMessage);
                }
            });

        } else if (messageData.type === 'message') {
            // Broadcast the message to all connected clients
            const outgoingMessage = JSON.stringify({
                type: 'message',
                sender: messageData.sender,
                message: messageData.message
            });
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(outgoingMessage);
                }
            });
        }
    });

    ws.on('close', () => {
        if (userName) {
            delete users[userName];
            updateUserList(); // Update list when a user leaves

            // Broadcast that a user has left
            const leaveMessage = JSON.stringify({ type: 'message', sender: 'Server', message: `${userName} has left the chat.` });
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(leaveMessage);
                }
            });
        }
    });

    // Welcome message for new connections
    ws.send(JSON.stringify({ type: 'message', sender: 'Server', message: 'Welcome to the chat!' }));
});

// Start the server, use environment variables for host and port
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0'; // Use '0.0.0.0' to accept connections from any IP address
server.listen(PORT, HOST, () => {
    console.log(`Server is listening on port ${PORT}`);
});
