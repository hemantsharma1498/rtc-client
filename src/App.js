import React, { useState, useEffect } from 'react';
import './App.css';
import OrganisationList from './components/OrganisationList';
import UserDetails from './components/UserDetails';
import ChatSection from './components/ChatSection';

const App = () => {
  const [organisations, setOrganisations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [connectionDetails, setConnectionDetails] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [input, setInput] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [pollingIntervalId, setPollingIntervalId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3010/cserver-list')
      .then(response => response.json())
      .then(data => {
        setOrganisations(data);
      })
      .catch(error => console.error('Error fetching server list:', error));
  }, []);

  const handleConnect = () => {
    if (connectionDetails[email]) {
      setErrorMessage('Email already in use, please check the entered email');
      return;
    }

    const orgDetails = organisations.find(org => org.Organisation === selectedOrg);
    const address = orgDetails.Address;

    const ws = new WebSocket(`ws://localhost:${address}/socket/${selectedOrg}?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);

    ws.onopen = () => {
      console.log('Connected to the WebSocket server');
      setSocket(ws);
      setConnectionDetails(prevDetails => ({
        ...prevDetails,
        [email]: { websocket: ws, organisation: selectedOrg, email, name }
      }));
      setErrorMessage('');
      setActiveChat({ organisation: selectedOrg, email, name });

      // Start polling for active connections
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }
      const id = setInterval(() => {
        fetch(`http://localhost:3020/active-connections/${selectedOrg}`)
          .then(response => response.json())
          .then(data => {
            // Filter out the current user based on their email
            const filteredUsers = data.filter(user => user.email !== email);
            setActiveUsers(filteredUsers);
          })
          .catch(error => console.error('Error fetching active connections:', error));
      }, 5000); // Poll every 5 seconds

      setPollingIntervalId(id);
    };

    ws.onmessage = (event) => {
      console.log('Message received:', event.data);
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from the WebSocket server');
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }
    };

    // Clean up WebSocket connection when component unmounts
    return () => {
      ws.close();
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }
    };
  };

  const handleUserClick = (receiverEmail, receiverName) => {
    const body = {
      Organisation: selectedOrg,
      Sender: email,
      Receiver: receiverEmail,
    };

    fetch('http://localhost:3020/create-channel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then(response => response.json())
      .then(data => {
        const channelId = data.channelId;
        console.log('Channel created:', channelId);
        setActiveChat(prevChat => ({ ...prevChat, channelId, receiver: receiverEmail }));
      })
      .catch(error => console.error('Error creating channel:', error));
  };

  const sendMessage = () => {
    const { channelId, receiver } = activeChat;
    const payload = input.trim();
    if (!payload || !channelId || !receiver) return;

    const message = {
      payload,
      org: selectedOrg,
      channel: channelId,
      sender: email,
      receiver,
      createdAt: Date.now(), // Epoch timestamp in milliseconds
    };

    fetch('http://localhost:3030/save-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('Message sent successfully');
        setMessages((prevMessages) => [...prevMessages, { text: payload }]);
        setInput('');
      })
      .catch(error => console.error('Error sending message:', error));
  };

  if (activeChat) {
    return (
      <ChatSection
        activeChat={activeChat}
        connectionDetails={connectionDetails}
        messages={messages}
        input={input}
        onInputChange={setInput}
        onSendMessage={sendMessage}
        activeUsers={activeUsers}
        onUserClick={handleUserClick} // Pass the handleUserClick function
      />
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Choose Your Organisation</h1>
      </header>
      <OrganisationList
        organisations={organisations}
        selectedOrg={selectedOrg}
        onSelectOrg={setSelectedOrg}
      />
      {selectedOrg && (
        <UserDetails
          name={name}
          email={email}
          onNameChange={setName}
          onEmailChange={setEmail}
          onConnect={handleConnect}
          isConnectDisabled={!selectedOrg || !name || !email}
          errorMessage={errorMessage}
        />
      )}
    </div>
  );
};

export default App;
