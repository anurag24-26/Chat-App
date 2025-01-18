const WebSocket = require('ws');
const http = require('http');

// Create an HTTP server to serve the chat HTML page
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        // Serve the HTML file
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Mobile Chat</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      margin: 0;
                      background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      height: 100vh;
                  }
                  .login-page, .chat-page {
                      display: none;
                      flex-direction: column;
                      align-items: center;
                      width: 100%;
                      max-width: 400px;
                  }
                  .login-page.active, .chat-page.active {
                      display: flex;
                  }
                  .login-page input, .chat-page input {
                      width: 90%;
                      padding: 10px;
                      margin: 10px 0;
                      border: none;
                      border-radius: 5px;
                      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                  }
                  .login-page button, .chat-page button {
                      width: 90%;
                      padding: 10px;
                      border: none;
                      border-radius: 5px;
                      background-color: #ff6f61;
                      color: white;
                      font-size: 16px;
                      cursor: pointer;
                      margin-top: 10px;
                      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                  }
                  .chat-container {
                      width: 100%;
                      flex: 1;
                      background: white;
                      border-radius: 10px;
                      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                      overflow: hidden;
                  }
                  .chat-header {
                      padding: 10px;
                      background: #ff6f61;
                      color: white;
                      text-align: center;
                  }
                  .chat-messages {
                      flex: 1;
                      padding: 10px;
                      overflow-y: auto;
                      display: flex;
                      flex-direction: column;
                  }
                  .chat-messages .message {
                      max-width: 80%;
                      padding: 10px;
                      margin: 5px 0;
                      border-radius: 10px;
                      font-size: 14px;
                  }
                  .chat-messages .message.self {
                      align-self: flex-end;
                      background: #ff6f61;
                      color: white;
                  }
                  .chat-messages .message.other {
                      align-self: flex-start;
                      background: #f1f1f1;
                      color: black;
                  }
                  .chat-footer {
                      display: flex;
                      align-items: center;
                      padding: 10px;
                      background: #f9f9f9;
                  }
                  .chat-footer input[type="text"] {
                      flex: 1;
                      padding: 10px;
                      border: none;
                      border-radius: 5px;
                      margin-right: 10px;
                      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                  }
                  .chat-footer input[type="file"] {
                      display: none;
                  }
                  .chat-footer button {
                      padding: 10px;
                      border: none;
                      border-radius: 5px;
                      background-color: #ff6f61;
                      color: white;
                      font-size: 16px;
                      cursor: pointer;
                  }
              </style>
          </head>
          <body>
              <!-- Login Page -->
              <div class="login-page active">
                  <h1>Welcome to Mobile Chat</h1>
                  <input type="text" id="name" placeholder="Enter your name">
                  <button onclick="setName()">Join Chat</button>
              </div>

              <!-- Chat Page -->
              <div class="chat-page">
                  <div class="chat-container">
                      <div class="chat-header">
                          <h2>Chat Room</h2>
                      </div>
                      <div class="chat-messages" id="chat"></div>
                      <div class="chat-footer">
                          <input type="text" id="message" placeholder="Type a message..." disabled>
                          <button onclick="sendMessage()">Send</button>
                          <label>
                              <input type="file" id="imageUpload" accept="image/*" onchange="sendImage()" disabled>
                              <span>📷</span>
                          </label>
                      </div>
                  </div>
              </div>

              <script>
                  const ws = new WebSocket('wss://' + location.host);
                  let userName = '';

                  ws.onopen = () => console.log('Connected to WebSocket server');
                  ws.onmessage = event => {
                      const chat = document.getElementById('chat');
                      const data = JSON.parse(event.data);

                      if (data.type === 'message') {
                          const messageDiv = document.createElement('div');
                          messageDiv.className = 'message ' + (data.sender === userName ? 'self' : 'other');
                          messageDiv.textContent = data.sender + ': ' + data.message;
                          chat.appendChild(messageDiv);
                          chat.scrollTop = chat.scrollHeight;
                      }
                  };

                  function setName() {
                      userName = document.getElementById('name').value.trim();
                      if (userName) {
                          ws.send(JSON.stringify({ type: 'setName', name: userName }));
                          document.querySelector('.login-page').classList.remove('active');
                          document.querySelector('.chat-page').classList.add('active');
                          document.getElementById('message').disabled = false;
                          document.getElementById('imageUpload').disabled = false;
                      }
                  }

                  function sendMessage() {
                      const messageInput = document.getElementById('message');
                      const message = messageInput.value.trim();
                      if (message) {
                          ws.send(JSON.stringify({ type: 'message', sender: userName, message }));
                          messageInput.value = '';
                      }
                  }

                  function sendImage() {
                      const fileInput = document.getElementById('imageUpload');
                      const file = fileInput.files[0];
                      if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                              ws.send(JSON.stringify({ type: 'image', sender: userName, image: reader.result }));
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

// WebSocket server logic
const wss = new WebSocket.Server({ server });
let users = {};

wss.on('connection', (ws) => {
    let userName = '';

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'setName') {
            userName = data.name;
            users[userName] = ws;
        } else if (data.type === 'message') {
            const outgoing = JSON.stringify(data);
            Array.from(wss.clients)
                .filter(client => client.readyState === WebSocket.OPEN)
                .forEach(client => client.send(outgoing));
        }
    });

    ws.on('close', () => delete users[userName]);
});

// Start the server
server.listen(8080, '0.0.0.0', () => console.log('Server listening on port 8080'));
