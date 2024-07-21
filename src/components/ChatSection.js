import React from 'react';

const ChatSection = ({ activeChat, connectionDetails, messages, input, onInputChange, onSendMessage }) => {
  const activeUsers = Object.values(connectionDetails).filter(
    (details) => details.organisation === activeChat.organisation
  );

  return (
    <div className="chat-section">
      <header className="App-header">
        <h1>{activeChat.organisation}</h1>
      </header>
      <div className="active-users">
        <h2>Active Users</h2>
        <ul>
          {activeUsers.map((user) => (
            <li key={user.email}>{user.name}</li>
          ))}
        </ul>
      </div>
      <div className="chat-window">
        <h2>Chat</h2>
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={onSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatSection;
