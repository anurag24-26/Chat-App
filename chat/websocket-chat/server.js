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
                background: rgb(131,58,180);
background: linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%);
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .chat-container {
                width: 900px;
                border: 1px solid #dbdbdb;
                border-radius: 8px;
                background-color: #ffffff;
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25'%3E%3Cdefs%3E%3ClinearGradient id='a' gradientUnits='userSpaceOnUse' x1='0' x2='0' y1='0' y2='100%25' gradientTransform='rotate(240)'%3E%3Cstop offset='0' stop-color='%23ffffff'/%3E%3Cstop offset='1' stop-color='%234FE'/%3E%3C/linearGradient%3E%3Cpattern patternUnits='userSpaceOnUse' id='b' width='540' height='450' x='0' y='0' viewBox='0 0 1080 900'%3E%3Cg fill-opacity='0.1'%3E%3Cpolygon fill='%23444' points='90 150 0 300 180 300'/%3E%3Cpolygon points='90 150 180 0 0 0'/%3E%3Cpolygon fill='%23AAA' points='270 150 360 0 180 0'/%3E%3Cpolygon fill='%23DDD' points='450 150 360 300 540 300'/%3E%3Cpolygon fill='%23999' points='450 150 540 0 360 0'/%3E%3Cpolygon points='630 150 540 300 720 300'/%3E%3Cpolygon fill='%23DDD' points='630 150 720 0 540 0'/%3E%3Cpolygon fill='%23444' points='810 150 720 300 900 300'/%3E%3Cpolygon fill='%23FFF' points='810 150 900 0 720 0'/%3E%3Cpolygon fill='%23DDD' points='990 150 900 300 1080 300'/%3E%3Cpolygon fill='%23444' points='990 150 1080 0 900 0'/%3E%3Cpolygon fill='%23DDD' points='90 450 0 600 180 600'/%3E%3Cpolygon points='90 450 180 300 0 300'/%3E%3Cpolygon fill='%23666' points='270 450 180 600 360 600'/%3E%3Cpolygon fill='%23AAA' points='270 450 360 300 180 300'/%3E%3Cpolygon fill='%23DDD' points='450 450 360 600 540 600'/%3E%3Cpolygon fill='%23999' points='450 450 540 300 360 300'/%3E%3Cpolygon fill='%23999' points='630 450 540 600 720 600'/%3E%3Cpolygon fill='%23FFF' points='630 450 720 300 540 300'/%3E%3Cpolygon points='810 450 720 600 900 600'/%3E%3Cpolygon fill='%23DDD' points='810 450 900 300 720 300'/%3E%3Cpolygon fill='%23AAA' points='990 450 900 600 1080 600'/%3E%3Cpolygon fill='%23444' points='990 450 1080 300 900 300'/%3E%3Cpolygon fill='%23222' points='90 750 0 900 180 900'/%3E%3Cpolygon points='270 750 180 900 360 900'/%3E%3Cpolygon fill='%23DDD' points='270 750 360 600 180 600'/%3E%3Cpolygon points='450 750 540 600 360 600'/%3E%3Cpolygon points='630 750 540 900 720 900'/%3E%3Cpolygon fill='%23444' points='630 750 720 600 540 600'/%3E%3Cpolygon fill='%23AAA' points='810 750 720 900 900 900'/%3E%3Cpolygon fill='%23666' points='810 750 900 600 720 600'/%3E%3Cpolygon fill='%23999' points='990 750 900 900 1080 900'/%3E%3Cpolygon fill='%23999' points='180 0 90 150 270 150'/%3E%3Cpolygon fill='%23444' points='360 0 270 150 450 150'/%3E%3Cpolygon fill='%23FFF' points='540 0 450 150 630 150'/%3E%3Cpolygon points='900 0 810 150 990 150'/%3E%3Cpolygon fill='%23222' points='0 300 -90 450 90 450'/%3E%3Cpolygon fill='%23FFF' points='0 300 90 150 -90 150'/%3E%3Cpolygon fill='%23FFF' points='180 300 90 450 270 450'/%3E%3Cpolygon fill='%23666' points='180 300 270 150 90 150'/%3E%3Cpolygon fill='%23222' points='360 300 270 450 450 450'/%3E%3Cpolygon fill='%23FFF' points='360 300 450 150 270 150'/%3E%3Cpolygon fill='%23444' points='540 300 450 450 630 450'/%3E%3Cpolygon fill='%23222' points='540 300 630 150 450 150'/%3E%3Cpolygon fill='%23AAA' points='720 300 630 450 810 450'/%3E%3Cpolygon fill='%23666' points='720 300 810 150 630 150'/%3E%3Cpolygon fill='%23FFF' points='900 300 810 450 990 450'/%3E%3Cpolygon fill='%23999' points='900 300 990 150 810 150'/%3E%3Cpolygon points='0 600 -90 750 90 750'/%3E%3Cpolygon fill='%23666' points='0 600 90 450 -90 450'/%3E%3Cpolygon fill='%23AAA' points='180 600 90 750 270 750'/%3E%3Cpolygon fill='%23444' points='180 600 270 450 90 450'/%3E%3Cpolygon fill='%23444' points='360 600 270 750 450 750'/%3E%3Cpolygon fill='%23999' points='360 600 450 450 270 450'/%3E%3Cpolygon fill='%23666' points='540 600 630 450 450 450'/%3E%3Cpolygon fill='%23222' points='720 600 630 750 810 750'/%3E%3Cpolygon fill='%23FFF' points='900 600 810 750 990 750'/%3E%3Cpolygon fill='%23222' points='900 600 990 450 810 450'/%3E%3Cpolygon fill='%23DDD' points='0 900 90 750 -90 750'/%3E%3Cpolygon fill='%23444' points='180 900 270 750 90 750'/%3E%3Cpolygon fill='%23FFF' points='360 900 450 750 270 750'/%3E%3Cpolygon fill='%23AAA' points='540 900 630 750 450 750'/%3E%3Cpolygon fill='%23FFF' points='720 900 810 750 630 750'/%3E%3Cpolygon fill='%23222' points='900 900 990 750 810 750'/%3E%3Cpolygon fill='%23222' points='1080 300 990 450 1170 450'/%3E%3Cpolygon fill='%23FFF' points='1080 300 1170 150 990 150'/%3E%3Cpolygon points='1080 600 990 750 1170 750'/%3E%3Cpolygon fill='%23666' points='1080 600 1170 450 990 450'/%3E%3Cpolygon fill='%23DDD' points='1080 900 1170 750 990 750'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' fill='url(%23a)' width='100%25' height='100%25'/%3E%3Crect x='0' y='0' fill='url(%23b)' width='100%25' height='100%25'/%3E%3C/svg%3E");
background-attachment: fixed;
background-size: cover;
                color: rgb(3, 3, 3);
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                padding: 20px;
               
                margin-top: 10px; 
                align-items: center;
                
            }

            .chat-container h1 {
                text-align: center;
                font-size: 24px;
                color: rgb(0, 0, 0);
                margin-top: 5px;
                font-family:Arial, Helvetica, sans-serif;
                text-decoration: underline;
            }

            .chat-messages {
                height:460px;
                overflow-y: scroll;
                padding: 10px;
                border-bottom: 1px solid #dbdbdb;
                color: wheat;
                font-display: bolder;
                font-size: 20px;
                margin-bottom: 10px;
                background-color: #000000;
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='30' viewBox='0 0 1000 120'%3E%3Cg fill='none' stroke='%23222' stroke-width='10' %3E%3Cpath d='M-500 75c0 0 125-30 250-30S0 75 0 75s125 30 250 30s250-30 250-30s125-30 250-30s250 30 250 30s125 30 250 30s250-30 250-30'/%3E%3Cpath d='M-500 45c0 0 125-30 250-30S0 45 0 45s125 30 250 30s250-30 250-30s125-30 250-30s250 30 250 30s125 30 250 30s250-30 250-30'/%3E%3Cpath d='M-500 105c0 0 125-30 250-30S0 105 0 105s125 30 250 30s250-30 250-30s125-30 250-30s250 30 250 30s125 30 250 30s250-30 250-30'/%3E%3Cpath d='M-500 15c0 0 125-30 250-30S0 15 0 15s125 30 250 30s250-30 250-30s125-30 250-30s250 30 250 30s125 30 250 30s250-30 250-30'/%3E%3Cpath d='M-500-15c0 0 125-30 250-30S0-15 0-15s125 30 250 30s250-30 250-30s125-30 250-30s250 30 250 30s125 30 250 30s250-30 250-30'/%3E%3Cpath d='M-500 135c0 0 125-30 250-30S0 135 0 135s125 30 250 30s250-30 250-30s125-30 250-30s250 30 250 30s125 30 250 30s250-30 250-30'/%3E%3C/g%3E%3C/svg%3E");
            }

            .input-container {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                justify-content: center;
                
            }

            .input-container input[type="text"], 
            .input-container button {
                height: 40px;
                padding: 10px;
                border: 1px solid #000000;
                border-radius: 10px;
                margin-right: 10px;
                font-size: 14px;
                box-sizing: border-box;
            }

            .input-container button {
                background-color: #4bf009;
                color: rgb(0, 0, 0);
                font-weight: bolder;
                border: none;
                border-radius: 15px;
                cursor: pointer;
                width: 100px;
            }

            #user-list {
                margin-top: 10px;
                border-top: 3px solid #0d9e9e;
                padding-top: 10px;
                font-size: 20px;
                
            }
        </style>
    </head>
    <body>
        <div class="chat-container">
            <h1>Chat Room</h1>
            <div id="user-list">Online Users:</div>
            <div class="chat-messages" id="chat"></div>
            <div class="input-container">
                <input type="text" id="name" placeholder="Your Name">
                <button onclick="setName()">Set Name</button>
                <input type="text" id="message" placeholder="Type a message..." disabled>
                <button onclick="sendMessage()" disabled>Send</button>
            </div>
            
            
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
