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

    const ws = new WebSocket(`ws://localhost:${address}/socket`);

    ws.onopen = () => {
      console.log('Connected to the WebSocket server');
      setSocket(ws);
      setConnectionDetails(prevDetails => ({
        ...prevDetails,
        [email]: { websocket: ws, organisation: selectedOrg, email, name }
      }));
      setErrorMessage('');
      setActiveChat({ organisation: selectedOrg, email, name });
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
    };

    // Clean up WebSocket connection when component unmounts
    return () => {
      ws.close();
    };
  };

  const sendMessage = () => {
    if (socket && input.trim()) {
      console.log('Sending message:', input);
      socket.send(JSON.stringify({ text: input }));
      setInput('');
    }
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
