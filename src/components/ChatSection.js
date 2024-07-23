import React from 'react';

const ChatSection = ({ activeChat, connectionDetails, messages, input, onInputChange, onSendMessage, activeUsers, onUserClick }) => {
  // Filter out the current user from the list of active users
  const filteredActiveUsers = activeUsers.filter(user => user.email !== activeChat.email);

  // Create the list of active users with unique keys and click handling
  const activeUserList = filteredActiveUsers.map(user => (
    <li key={user.email} onClick={() => onUserClick(user.Email, user.Name)}>
      {user.Name}
    </li>
  ));

  return (
    <div className="chat-section">
      <header className="App-header">
        <h1>{activeChat.organisation.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/^\w/, c => c.toUpperCase())}</h1>
      </header>
      <div className="active-users">
        <h2>Active Users</h2>
        <ul>
          {activeUserList}
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
