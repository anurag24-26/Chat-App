const http = require('http');
const WebSocket = require('ws');

// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chat App</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .chat-container {
            width: 100%;
            max-width: 600px;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          }
          .chat-header {
            background: #007bff;
            color: white;
            padding: 10px;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
          }
          .chat-messages {
            height: 400px;
            overflow-y: auto;
            padding: 10px;
            background: #e9ecef;
          }
          .chat-message {
            margin-bottom: 10px;
          }
          .chat-message strong {
            color: #007bff;
          }
          .chat-input {
            display: flex;
            padding: 10px;
            background: #f8f9fa;
            border-top: 1px solid #ddd;
          }
          .chat-input input {
            flex: 1;
            padding: 10px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 5px;
            margin-right: 10px;
          }
          .chat-input button {
            padding: 10px 20px;
            font-size: 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          .chat-input button:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
        </style>
      </head>
      <body>
        <div class="chat-container">
          <div class="chat-header">Chat Room</div>
          <div class="chat-messages" id="messages"></div>
          <div class="chat-input">
            <input type="text" id="messageInput" placeholder="Type a message..." />
            <button id="sendButton">Send</button>
          </div>
        </div>
        <script>
          const ws = new WebSocket('ws://' + location.host); // WebSocket connection without SSL
          const messageInput = document.getElementById('messageInput');
          const sendButton = document.getElementById('sendButton');
          const messagesDiv = document.getElementById('messages');

          ws.onopen = () => {
            console.log('Connected to WebSocket server');
          };

          ws.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            const messageDiv = document.createElement('div');
            messageDiv.className = 'chat-message';
            messageDiv.innerHTML = '<strong>' + messageData.sender + ':</strong> ' + messageData.message;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
          };

          ws.onerror = (error) => {
            console.error('WebSocket error:', error);
          };

          sendButton.addEventListener('click', () => {
            const message = messageInput.value.trim();
            if (message) {
              ws.send(JSON.stringify({ sender: 'User', message }));
              messageInput.value = '';
            }
          });
        </script>
      </body>
      </html>
    `);
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
