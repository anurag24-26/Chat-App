const WebSocket = require('ws');
const http = require('http');

// Create an HTTP server to serve the chat HTML page
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Simple Chat</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: black; display: flex;  margin: 0;">

        <div style="width:590px; border: 1px solid #dbdbdb; border-radius: 8px;color:white; background-color: black; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <h1 style="text-align: center; font-size: 24px; color:wheat; margin-top: 10px;">Chat Room</h1>
            <div id="chat" style="height: 300px; overflow-y: scroll; padding: 10px; border-bottom: 1px solid #dbdbdb;"></div>
            <input type="text" id="name" placeholder="Your Name" style="width: calc(100% - 20px); padding: 10px; border: 1px solid #dbdbdb; border-radius: 4px; margin: 10px;">
            <button onclick="setName()" style="height: 40px; width: 80px; background-color: #0095f6; color: white; border: none; border-radius: 10px; cursor: pointer;">Set Name</button>
            <input type="text" id="message" placeholder="Type a message..." style="width: calc(100% - 20px); padding: 10px; border: 1px solid #dbdbdb; border-radius: 4px; margin: 10px;" disabled>
            <button onclick="sendMessage()" style="height: 40px; width: 80px; background-color: #0095f6; color: white; border: none; border-radius: 10px; cursor: pointer;" disabled>Send</button>
        </div>
    
            <script>
                // Create a WebSocket connection to the server
                const ws = new WebSocket('ws://' + location.host);
                let userName = '';

                // Display messages received from the server
                ws.onmessage = (event) => {
                    const chat = document.getElementById('chat');
                    const newMessage = document.createElement('div');
                    const messageData = JSON.parse(event.data);

                    // Display sender and message
                    newMessage.innerHTML = '<strong>' + messageData.sender + ':</strong> ' + messageData.message;
                    chat.appendChild(newMessage);
                    chat.scrollTop = chat.scrollHeight; // Scroll to the latest message
                };

                // Function to set the user's name
                function setName() {
                    const nameInput = document.getElementById('name');
                    userName = nameInput.value.trim();
                    
                    if (userName) {
                        nameInput.disabled = true;
                        document.getElementById('message').disabled = false;
                        document.querySelector('button[onclick="sendMessage()"]').disabled = false;
                    } else {
                        alert('Please enter a name.');
                    }
                }

                // Function to send a message to the server
                function sendMessage() {
                    const messageInput = document.getElementById('message');
                    const message = messageInput.value;

                    if (message.trim()) {
                        // Send message along with the user's name
                        ws.send(JSON.stringify({ sender: userName, message: message }));
                    }

                    // Clear the input field
                    messageInput.value = '';
                }
            </script>
        </body>
        </html>
    `);
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    // Handle incoming messages from clients
    ws.on('message', (data) => {
        const messageData = JSON.parse(data);
        
        // Broadcast the message to all connected clients with the sender's info
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messageData));
            }
        });
    });

    // Send a welcome message to the newly connected client
    ws.send(JSON.stringify({ sender: 'Server', message: 'Welcome to the chat!' }));
});

// Start the server
server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
