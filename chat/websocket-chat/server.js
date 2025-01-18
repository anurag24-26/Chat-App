const http = require('http');
const WebSocket = require('ws');

// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(` <!DOCTYPE html><html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mobile Chat</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #128C7E; /* WhatsApp-like color */
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            flex-direction: column;
            background-image: url('https://via.placeholder.com/500x500'); /* Add aesthetic background */
            background-size: cover;
            background-position: center;
        }

        .chat-container {
            width: 100%;
            max-width: 400px;
            background-color: white;
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

        .input-area input, .input-area button {
            padding: 10px;
            border-radius: 20px;
            border: none;
            font-size: 16px;
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
            background-color: #B5B5B5;
        }

        #user-list {
            margin-top: 10px;
            padding: 10px;
            background-color: #fff;
            border-top: 1px solid #ddd;
        }

        .login-page {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            text-align: center;
            width: 100%;
        }

        .login-page input {
            padding: 10px;
            border-radius: 20px;
            margin: 10px;
            border: 1px solid #ddd;
            font-size: 16px;
        }

        .file-input {
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="chat-container" id="chat-container">
        <div class="header" id="chat-header">Enter Your Name</div>
        <div id="user-list" class="user-list"></div>
        <div class="login-page" id="login-page">
            <input type="text" id="name" placeholder="Your Name" />
            <button onclick="setName()">Set Name</button>
        </div>
        <div class="messages" id="chat" style="display: none;"></div>
        <div class="input-area" id="input-area" style="display: none;">
            <input type="text" id="message" placeholder="Type a message..." disabled />
            <button onclick="sendMessage()" disabled>Send</button>
        </div>
        <div class="file-input">
            <input type="file" id="fileInput" accept="image/*" onchange="sendImage()" />
        </div>
    </div>

    <script>
        const ws = new WebSocket('wss://' + location.host); 
        let userName = '';
        let isLoggedIn = false;

        ws.onopen = function() {
            console.log('WebSocket connected.');
        };

        ws.onmessage = function(event) {
            const messageData = JSON.parse(event.data);
            const chat = document.getElementById('chat');

            if (messageData.type === 'message') {
                const messageElement = document.createElement('div');
                messageElement.className = 'message-bubble ' + (messageData.sender === userName ? 'sent' : 'received');
                messageElement.innerHTML = `<strong>${messageData.sender}:</strong> ${messageData.message}`;
                chat.appendChild(messageElement);
                chat.scrollTop = chat.scrollHeight;
            } else if (messageData.type === 'userList') {
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
                ws.send(JSON.stringify({ type: 'setName', name: userName }));

                document.getElementById('login-page').style.display = 'none';
                document.getElementById('chat').style.display = 'block';
                document.getElementById('input-area').style.display = 'flex';
                document.getElementById('chat-header').innerText = 'Chat Room';
            } else {
                alert('Please enter a name.');
            }
        }

        function sendMessage() {
            const messageInput = document.getElementById('message');
            const message = messageInput.value.trim();

            if (message) {
                ws.send(JSON.stringify({ type: 'message', sender: userName, message: message }));
                messageInput.value = '';
            }
        }

        function sendImage() {
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = function() {
                    ws.send(JSON.stringify({ type: 'image', sender: userName, image: reader.result }));
                };
                reader.readAsDataURL(file);
            }
        }
    </script>
</body>
</html> `);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const messageData = JSON.parse(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(messageData));
      }
    });
  });
});

// Start server on HTTP
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
