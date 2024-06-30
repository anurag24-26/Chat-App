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

                    #user-list {
                        margin-top: 10px;
                        border-top: 1px solid #dbdbdb;
                        padding-top: 10px;
                        font-size: 14px;
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
                    <div id="user-list">Online Users:</div>
                </div>
        
                <script>
                    const ws = new WebSocket('wss://' + location.host); // Use wss:// for secure WebSocket connection
                    let userName = '';

                    // Request permission for notifications
                    if (Notification.permission === "default") {
                        Notification.requestPermission().then(permission => {
                            if (permission !== "granted") {
                                alert("You need to allow notifications for the best experience.");
                            }
                        });
                    }

                    ws.onopen = function(event) {
                        console.log('WebSocket connection established.');
                    };

                    ws.onmessage = function(event) {
                        const chat = document.getElementById('chat');
                        const newMessage = document.createElement('div');
                        const messageData = JSON.parse(event.data);

                        if (messageData.type === 'message') {
                            // Display the new message in the chat
                            newMessage.innerHTML = '<strong>' + messageData.sender + ':</strong> ' + messageData.message;
                            chat.appendChild(newMessage);
                            chat.scrollTop = chat.scrollHeight;

                            // Show a notification if the message is not from the current user
                            if (messageData.sender !== userName && Notification.permission === "granted") {
                                new Notification('New Message from ' + messageData.sender, {
                                    body: messageData.message,
                                    icon: 'https://via.placeholder.com/128' // Example placeholder image for notification icon
                                });
                            }
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
            const outgoingMessage = JSON.stringify({ type: 'message', sender: messageData.sender, message: messageData.message });
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
