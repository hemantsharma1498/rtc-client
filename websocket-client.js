let socket;

document.getElementById('connect').onclick = function() {
    socket = new WebSocket('ws://localhost:3010/socket');

    socket.onopen = function(event) {
        console.log("Connected to the WebSocket server.");
        document.getElementById('messages').innerHTML += '<p>Connected to the WebSocket server.</p>';
    };

    socket.onmessage = function(event) {
        console.log("Received from server: " + event.data);
        document.getElementById('messages').innerHTML += '<p>Received: ' + event.data + '</p>';
    };

    socket.onclose = function(event) {
        console.log("Disconnected from the WebSocket server.");
        document.getElementById('messages').innerHTML += '<p>Disconnected from the WebSocket server.</p>';
    };

    socket.onerror = function(error) {
        console.log("WebSocket error: " + error);
        document.getElementById('messages').innerHTML += '<p>Error: ' + error + '</p>';
    };
};

document.getElementById('disconnect').onclick = function() {
    if (socket) {
        socket.close();
    }
};

document.getElementById('sendMessage').onclick = function() {
    const message = document.getElementById('messageInput').value;
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(message);
        console.log("Sent to server: " + message);
        document.getElementById('messages').innerHTML += '<p>Sent: ' + message + '</p>';
    }
};

