// src/components/ChatWindow.jsx
import React from 'react';
import Message from './Message';

const ChatWindow = ({ messages, isLoading }) => {
    const chatWindowRef = React.useRef(null);

    // Tự động cuộn xuống cuối cùng khi có tin nhắn mới
    React.useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="chat-window" ref={chatWindowRef}>
            {messages.map((msg, index) => (
                <Message key={index} text={msg.text} sender={msg.sender} />
            ))}
            {isLoading && <Message text="..." sender="bot" isLoading={true} />}
        </div>
    );
};

export default ChatWindow;