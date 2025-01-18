const WebSocket = require('ws');
const http = require('http');

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
            margin: 0;
            padding: 0;
font-size:30px;

            background-color: #000000;
        }
        .chat-container {
            width: 100%;
            margin: 50px auto;
            background: #fff;
            padding: 20px;
            border-radius: 50px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            height: 60vh;
        }
        .chat-messages {
            font-size:40px;
background-color:#333c45;
background-image:url('https://camo.githubusercontent.com/ebf18cd85f7aa9dc79fb74c58dc94febf3a6441d8d689cd5a400b2707e19ec0e/68747470733a2f2f7765622e77686174736170702e636f6d2f696d672f62672d636861742d74696c652d6461726b5f61346265353132653731393562366237333364393131306234303866303735642e706e67');



            overflow-y: auto;
            margin-bottom: 10px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .input-container {
            display: flex;
           
            align-items: flex-start;
        }
        input[type="text"] {
            padding: 10px;
            margin: 5px 0;
            width: 50%;
            font-size: 30px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        button {
           padding: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    font-size: 40px;
    width: fit-content;
    border-radius: 10px;
    cursor: pointer;
    margin-top: 5px;
        }
        button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        .message-bubble {
            padding: 10px;
            border-radius: 10px;
            max-width: 60%;
            word-wrap: break-word;
        }
        .message-bubble.sent {
            background-color: #4CAF50;
            color: white;
            align-self: flex-end;
            border-radius: 10px 10px 0 10px;
        }
        .message-bubble.received {
            background-color: #e0e0e0;
            color: #333;
            align-self: flex-start;
            border-radius: 10px 10px 10px 0;
        }
        #user-list {
            margin-bottom: 20px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <h1>Chat Room</h1>
<div class="input-container">

<input type="text" id="name" placeholder="Your Name">
            <button onclick="setName()">Set Name</button>
 </div>
        <div id="user-list">Online Users:</div>
        <div class="chat-messages" id="chat"></div>
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
            const newMessage = JSON.parse(event.data);

            if (newMessage.type === 'message') {
                const messageBubble = document.createElement('div');
                messageBubble.classList.add('message-bubble', newMessage.sender === userName ? 'sent' : 'received');
                messageBubble.innerHTML = '<strong>' + newMessage.sender + ':</strong> ' + newMessage.message;
                chat.appendChild(messageBubble);
                chat.scrollTop = chat.scrollHeight;
            } else if (newMessage.type === 'userList') {
                const userList = document.getElementById('user-list');
                userList.innerHTML = 'Online Users: ' + newMessage.users.join(', ');
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
                ws.send(JSON.stringify({ type: 'setName', name: userName }));
            } else {
                alert('Please enter a name.');
            }
        }

        function sendMessage() {
            const messageInput = document.getElementById('message');
            const message = messageInput.value;

            if (message.trim()) {
                const messageData = { type: 'message', sender: userName, message: message };
                ws.send(JSON.stringify(messageData));
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
