const WebSocket = require('ws');
const http = require('http');

// Create an HTTP server to serve the chat HTML page
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat App</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .login-container, .chat-container {
            width: 100%;
            max-width: 450px;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .login-container {
            justify-content: center;
            align-items: center;
            background: #008080;
            color: white;
        }
        .login-container input, .login-container button {
            margin: 10px 0;
            padding: 10px;
            border-radius: 5px;
            border: none;
        }
        .login-container button {
            background-color: #4CAF50;
            color: white;
            font-weight: bold;
        }
        .chat-header {
            background-color: #008080;
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .chat-header h1 {
            font-size: 20px;
        }
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
            background-color: white;
        }
        .message {
            margin: 10px 0;
            max-width: 70%;
            padding: 10px;
            border-radius: 10px;
        }
        .message.sent {
            background-color: #DCF8C6;
            align-self: flex-end;
        }
        .message.received {
            background-color: #ffffff;
            border: 1px solid #ddd;
            align-self: flex-start;
        }
        .chat-input {
            padding: 10px;
            display: flex;
            border-top: 1px solid #ddd;
            background-color: #f9f9f9;
        }
        .chat-input input, .chat-input button {
            padding: 10px;
            border-radius: 5px;
            margin-right: 5px;
        }
        .chat-input button {
            background-color: #008080;
            color: white;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="login-container" id="login-container">
        <h1>Welcome to Chat</h1>
        <input type="text" id="username" placeholder="Enter your name">
        <button onclick="login()">Join Chat</button>
    </div>
    <div class="chat-container" id="chat-container" style="display: none;">
        <div class="chat-header">
            <h1>Chat Room</h1>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input">
            <input type="text" id="message-input" placeholder="Type a message...">
            <button onclick="sendMessage()">Send</button>
            <input type="file" id="file-input" style="display: none;" onchange="sendFile(event)">
            <button onclick="document.getElementById('file-input').click()">📎</button>
        </div>
    </div>
    <script>
        const ws = new WebSocket('ws://' + location.host);
        let username = '';

        ws.onmessage = function(event) {
            const messageData = JSON.parse(event.data);
            const chatMessages = document.getElementById('chat-messages');
            const message = document.createElement('div');
            message.classList.add('message');
            message.innerHTML = '<strong>' + messageData.sender + ':</strong> ' + messageData.message;
            message.classList.add(messageData.sender === username ? 'sent' : 'received');
            chatMessages.appendChild(message);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        function login() {
            username = document.getElementById('username').value.trim();
            if (username) {
                document.getElementById('login-container').style.display = 'none';
                document.getElementById('chat-container').style.display = 'flex';
                ws.send(JSON.stringify({ type: 'setName', name: username }));
            }
        }

        function sendMessage() {
            const input = document.getElementById('message-input');
            const message = input.value.trim();
            if (message) {
                ws.send(JSON.stringify({ type: 'message', sender: username, message }));
                input.value = '';
            }
        }

        function sendFile(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    ws.send(JSON.stringify({ type: 'message', sender: username, message: '<img src="' + e.target.result + '" style="max-width: 200px;">' }));
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

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        const messageData = JSON.parse(data);
        if (messageData.type === 'message' || messageData.type === 'setName') {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(messageData));
                }
            });
        }
    });
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
