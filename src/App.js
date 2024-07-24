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
  const [activeUsers, setActiveUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Fetch organisations on mount
    fetch('http://localhost:3010/cserver-list')
      .then(response => response.json())
      .then(data => {
        console.log(data); // Debugging line
        setOrganisations(data);
      })
      .catch(error => console.error('Error fetching organisations:', error));
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      const interval = setInterval(() => {
        fetch(`http://localhost:3020/active-connections/${selectedOrg}`)
          .then(response => response.json())
          .then(data => setActiveUsers(data.filter(user => user.email !== email))) // Filter out the current user
          .catch(error => console.error('Error fetching active users:', error));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedOrg, email]);

  const handleConnect = () => {
    if (connectionDetails[email]) {
      setErrorMessage('Email already in use, please check the entered email');
      return;
    }

    const orgAddress = organisations.find(org => org.Organisation === selectedOrg).Address;
    const socket = new WebSocket(`ws://localhost:${orgAddress}/socket/${selectedOrg}?email=${email}&name=${name}`);

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setConnectionDetails({
        ...connectionDetails,
        [email]: { socket, organisation: selectedOrg, name, email }
      });
      setActiveChat(selectedOrg);
    };

    socket.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      setMessages(messages => [...messages, { sender: messageData.sender, payload: messageData.payload }]);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
      const updatedDetails = { ...connectionDetails };
      delete updatedDetails[email];
      setConnectionDetails(updatedDetails);
    };
  };

  const handleUserClick = (receiverEmail, receiverName) => {
    const { organisation, email: senderEmail } = connectionDetails[email];
    fetch('http://localhost:3020/create-channel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ Organisation: organisation, Sender: senderEmail, Receiver: receiverEmail })
    })
      .then(response => response.json())
      .then(data => {
        setActiveChat({ channelId: data.channelId, receiverEmail, receiverName });
      })
      .catch(error => console.error('Error creating channel:', error));
  };

  const sendMessage = () => {
    if (!activeChat || !input.trim()) return;
    const { channelId, receiverEmail } = activeChat;
    const { organisation, email: senderEmail } = connectionDetails[email];

    fetch('http://localhost:3030/save-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        payload: input,
        org: organisation,
        channel: channelId,
        sender: senderEmail,
        receiver: receiverEmail,
        createdAt: Date.now()
      })
    })
      .then(() => {
        setMessages([...messages, { sender: senderEmail, payload: input }]);
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
        onUserClick={handleUserClick}
      />
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="choose-org-header">Choose Your Organisation</h1>
      </header>
      <div className="choose-org-section">
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
    </div>
  );
};

export default App;
