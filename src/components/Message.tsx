// src/components/Message.jsx
import React from 'react';

const Message = ({ text, sender, isLoading }) => {
    const messageClass = sender === 'bot' ? 'bot-message' : 'user-message';

    return (
        <div className={`message ${messageClass}`}>
            {isLoading ? <span className="loading-dots"></span> : text}
        </div>
    );
};

export default Message;