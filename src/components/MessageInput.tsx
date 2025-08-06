// src/components/MessageInput.jsx
import React, {useState} from 'react';
import {Send} from "lucide-react";

const MessageInput = ({onSendMessage}) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSendMessage(input);
        setInput('');
    };

    return (
        <form className="message-input-form" onSubmit={handleSubmit}>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                autoFocus
            />
            <button type="submit">
                <Send />
            </button>
        </form>
    );
};

export default MessageInput;