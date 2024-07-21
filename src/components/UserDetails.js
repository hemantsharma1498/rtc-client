import React from 'react';

const UserDetails = ({ name, email, onNameChange, onEmailChange, onConnect, isConnectDisabled, errorMessage }) => {
  return (
    <div className="user-details">
      <h2>Enter Your Details</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder="Email"
      />
      <button
        onClick={onConnect}
        disabled={isConnectDisabled}
      >
        Connect
      </button>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default UserDetails;
