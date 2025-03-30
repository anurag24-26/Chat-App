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
    <title>Baatein</title>
    
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
font-size:30px;

            background-color: #000000;
        }
        h1{
            text-align: center;
        }
       .chat-container {
        width: 70%;
        max-width: 1200px; /* Prevent stretching too wide */
        margin: 30px auto;
        background: #222831;
        padding: 20px;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        height: 80vh;
    }
        .chat-messages {
            font-size:40px;
background-color:#333c45;
background-image:url('https://camo.githubusercontent.com/ebf18cd85f7aa9dc79fb74c58dc94febf3a6441d8d689cd5a400b2707e19ec0e/68747470733a2f2f7765622e77686174736170702e636f6d2f696d672f62672d636861742d74696c652d6461726b5f61346265353132653731393562366237333364393131306234303866303735642e706e67');
height: 700px;

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
            width: 90%;
            height: 70px;
            font-size: 40px;
            border: 2px solid #000000;
            border-radius: 30px;
        }
        .butto {
           padding: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    font-size: 40px;
    width: 10%;
    height: 100px;
    border-radius: 30px;
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
               background-color: #20421a;
    color: #ffffff;
    align-self: flex-end;
    border-radius: 40px 40px 0 40px;
        }
        .hii{
            padding: 10px;
            background-color: #000000;
    color: rgb(0, 0, 0);
    border: none;
    font-size: 40px;
    width: 10%;
    height: 100px;
    border-radius: 30px;
    cursor: pointer;
    margin-top: 5px;
        }
        .message-bubble.received {
          background-color: #77437e;
    color: #ffffff;
    align-self: flex-start;
    border-radius: 40px 40px 40px 0px;
        }
        #user-list {
            margin-bottom: 20px;
            font-size: 40px;
            font-weight: bold;
        }
          @media (min-width: 1024px) {
        .chat-container {
            flex-direction: row; /* Display sections side-by-side */
            gap: 15px;
        }
        .chat-messages {
            height: 100%;
            flex: 2; /* Allocate more space to messages */
        }
        #user-list {
            flex: 1; /* Allocate smaller space for online users */
            background: #2c2c34;
            padding: 15px;
            border-radius: 15px;
            overflow-y: auto; /* Scrollable user list */
        }
        input[type="text"] {
            font-size: 1.2rem; /* Adjust font size for PC */
        }
        .butto {
            font-size: 1rem;
        }
    }
    </style>



</head>
<body>
    <div class="chat-container">
        <h1>Baatein</h1>
        <div id="user-list">Online Users:</div>
<div class="input-container">

<input type="text" id="name" placeholder="Your Name">
            <button class="hii" onclick="setName()"><img src="data:image/png;base64,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" alt="pencil"></button>
 </div>
        
        <div class="chat-messages" id="chat"></div>
        <div class="input-container">
            
            <input type="text" id="message" placeholder="Type a message..." disabled>
            <button class="butto" onclick="sendMessage()" disabled><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAC0ElEQVR4nO2ZS2jUUBSGPx+l4hOh44yKC6sgiIrgpqIbURF3uhAEQVdWRMStC0FxVaTTEe1OcCFIQUHE11JFcOFjY20VBHXhG3xW1IqPkQN/4BLSmWSSZhKZD8JMknvvnJ//5Nx7M9CiRYv/hZnAAeAJcJMcsgQ4CYwAVR2PyQkTgA3AOeC3I8A7zJlMMwPoBoYDgvcOc2YWGWUR0AN8dAJ+BfQDL31CTpDB9NkEXAX+OIFeB7YAJWBQ117o86+emUwwXekz5AQ/CpwBVqhNwRHxCOjV92tkgE6lzwdHwGvgCNDhtCv4RMwHnul8cxPjZ21A9bkP7AQm+9oWfCIsvbbq3OaPiWkHP0WBPvSljwnqGqNPkAjjhq7tb3b6vFH6WKBEFLFMD/iIZvbU0udXQPq01ek7lgjjlK4fJ4X08YKw46cErQ45Ri0Rs4Fv41ly5ylV3jsC3iqlrMKQgAjjoO5dIaX06ZY7JChiEvBc923SjE270udBQPqsaXDMeiKMbUmV3KD0eaf0WRBj3DAijFtqs48Y9Psmr3tyxdwhIRGDNcrxSrX5rNVww3jLgapSainxCSvCOK12FWJS0iDfNaCtTAdiCIoiogD80G8ubvD3AgftUS33BF2W9Uk/Ex6H1PZSzNgTFRRVhC0gvX3HxgTjjyUoqghju9PeNl3jTj1BjYgwbqvPXlKmCJR9ggYiPNguq9Tnk3aQTaFDk+cXp2xHcQJtc62fbWmbzhzgvAIyZ6I4OypHO8kI5s5XBbU8ZJ/DEn+RjNEbwZU2573VejJGUQUgjCs7JGI4rZIblXJIV+6o3R4ySjGEK11OyZ1GhinXceWs7h8j4xRruDJXO03b9ywkB/SN4cpRXb9ATigFuNKuty4mZB05os/nyi6dD2W15IZ15a6E7CaHVJx3AFW9G55KDik5y/2q9jO5pSIRuSm5tVx5qv/MW7RoQbr8A2pLKcu/QDhRAAAAAElFTkSuQmCC" alt="sent--v1"></button>
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
