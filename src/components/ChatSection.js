import React from 'react';

const ChatSection = ({ activeChat, connectionDetails, messages, input, onInputChange, onSendMessage, activeUsers, onUserClick }) => {
  const filteredActiveUsers = activeUsers.filter(user => user.Email !== activeChat.email);

  const activeUserList = filteredActiveUsers.map(user => (
    <li
      key={user.Email}
      onClick={() => onUserClick(user.Email, user.Name)}
      className={activeChat.receiver === user.Email ? 'active-user' : ''}
      style={{ cursor: 'pointer' }}
    >
      {user.Name}
    </li>
  ));

  return (
    <div className="chat-section">
      <header className="App-header">
        <h1>Chat with {activeChat.name}</h1>
      </header>
      <div className="active-users">
        <h2>Active Users</h2>
        <ul>
          {activeUserList}
        </ul>
      </div>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            {msg.sender} - {msg.payload}
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
        <button onClick={onSendMessage} style={{ cursor: 'pointer' }}>Send</button>
      </div>
    </div>
  );
};

export default ChatSection;
