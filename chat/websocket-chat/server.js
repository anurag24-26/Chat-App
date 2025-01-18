const WebSocket = require("ws");
const http = require("http");

// Create an HTTP server to serve the chat HTML page
const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
    <!DOCTYPE html>
    <html>
    <head>
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
            .login-container {
                width: 100%;
                max-width: 400px;
                padding: 20px;
                border-radius: 8px;
                background-color: white;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            .login-container input {
                width: 80%;
                padding: 10px;
                margin-bottom: 20px;
                border-radius: 4px;
                border: 1px solid #ccc;
            }
            .login-container button {
                padding: 10px 20px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .chat-container {
                display: none;
                flex-direction: column;
                width: 100%;
                height: 100%;
                max-width: 400px;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .chat-header {
                padding: 10px;
                background-color: #4CAF50;
                color: white;
                text-align: center;
                font-size: 18px;
            }
            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 10px;
                background-color: #f0f0f0;
            }
            .chat-messages .message {
                margin-bottom: 10px;
                max-width: 70%;
            }
            .chat-messages .message.self {
                background-color: #DCF8C6;
                text-align: right;
                margin-left: auto;
                padding: 10px;
                border-radius: 8px 0px 8px 8px;
            }
            .chat-messages .message.other {
                background-color: #ECECEC;
                text-align: left;
                padding: 10px;
                border-radius: 0px 8px 8px 8px;
            }
            .chat-footer {
                display: flex;
                padding: 10px;
                border-top: 1px solid #ccc;
            }
            .chat-footer input {
                flex: 1;
                padding: 10px;
                border-radius: 4px;
                border: 1px solid #ccc;
                margin-right: 10px;
            }
            .chat-footer button {
                padding: 10px 20px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <div class="login-container" id="login">
            <h2>Login</h2>
            <input type="text" id="username" placeholder="Enter your name" />
            <button onclick="joinChat()">Join Chat</button>
        </div>
        <div class="chat-container" id="chat">
            <div class="chat-header">Chat Room</div>
            <div class="chat-messages" id="messages"></div>
            <div class="chat-footer">
                <input type="file" id="fileInput" style="display: none;" />
                <input type="text" id="messageInput" placeholder="Type a message..." />
                <button onclick="sendMessage()">Send</button>
                <button onclick="sendFile()">📁</button>
            </div>
        </div>
        <script>
            const ws = new WebSocket('ws://' + location.host);
            let username = '';

            ws.onopen = () => console.log('Connected to server');
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                const messages = document.getElementById('messages');
                const messageElement = document.createElement('div');
                messageElement.className = 'message ' + (data.sender === username ? 'self' : 'other');
                messageElement.textContent = data.message;
                messages.appendChild(messageElement);
                messages.scrollTop = messages.scrollHeight;
            };

            function joinChat() {
                username = document.getElementById('username').value.trim();
                if (username) {
                    ws.send(JSON.stringify({ type: 'join', username }));
                    document.getElementById('login').style.display = 'none';
                    document.getElementById('chat').style.display = 'flex';
                }
            }

            function sendMessage() {
                const messageInput = document.getElementById('messageInput');
                const message = messageInput.value.trim();
                if (message) {
                    ws.send(JSON.stringify({ type: 'message', sender: username, message }));
                    messageInput.value = '';
                }
            }

            function sendFile() {
                const fileInput = document.getElementById('fileInput');
                fileInput.click();
                fileInput.onchange = () => {
                    const file = fileInput.files[0];
                    const reader = new FileReader();
                    reader.onload = () => {
                        ws.send(JSON.stringify({ type: 'file', sender: username, message: reader.result }));
                    };
                    reader.readAsDataURL(file);
                };
            }
        </script>
    </body>
    </html>
    `);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.type === "join") {
      ws.username = data.username;
      const joinMessage = { type: "message", sender: "Server", message: `${data.username} joined the chat` };
      broadcast(joinMessage);
    } else if (data.type === "message" || data.type === "file") {
      broadcast(data);
    }
  });
});

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

server.listen(8080, () => console.log("Server running on http://localhost:8080"));
