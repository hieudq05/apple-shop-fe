// src/components/Chatbot.tsx

import React from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Định nghĩa kiểu dữ liệu cho tin nhắn để nhất quán với backend
interface ChatMessage {
    type: 'CHAT' | 'JOIN' | 'LEAVE';
    content: string;
    sender: string;
}

// URL của WebSocket endpoint trên backend Spring Boot
const SOCKET_URL = 'http://localhost:8080/api/v1/ws-chat';

const ChatbotComponent: React.FC = () => {
    const [messages, setMessages] = React.useState<ChatMessage[]>([]);
    const [currentMessage, setCurrentMessage] = React.useState('');
    const stompClientRef = React.useRef<Client | null>(null);

    React.useEffect(() => {
        // Khởi tạo STOMP client
        const client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Connected to WebSocket!');

                // Sau khi kết nối, subscribe vào topic để nhận tin nhắn
                client.subscribe('/topic/public', (payload) => {
                    const receivedMessage: ChatMessage = JSON.parse(payload.body);
                    setMessages((prevMessages) => [...prevMessages, receivedMessage]);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        // Kích hoạt client
        client.activate();

        // Lưu lại instance của client để có thể sử dụng ở các hàm khác
        stompClientRef.current = client;

        // Cleanup: Deactivate client khi component unmount
        return () => {
            client.deactivate();
        };
    }, []);

    const handleSendMessage = (event: React.FormEvent) => {
        event.preventDefault();
        if (currentMessage && stompClientRef.current) {
            const chatMessage: ChatMessage = {
                sender: 'User', // Bạn có thể thay bằng tên người dùng đã đăng nhập
                content: currentMessage,
                type: 'CHAT',
            };

            // Gửi tin nhắn đến server
            stompClientRef.current.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(chatMessage),
            });

            // Thêm tin nhắn của người dùng vào danh sách để hiển thị ngay lập tức
            setMessages((prevMessages) => [...prevMessages, chatMessage]);
            setCurrentMessage('');
        }
    };

    return (
        <div style={styles.chatContainer}>
            <h2>Chatbot Gemini</h2>
            <div style={styles.messageArea}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.message,
                            ...(msg.sender === 'User' ? styles.userMessage : styles.botMessage)
                        }}
                    >
                        <strong>{msg.sender}: </strong>{msg.content}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSendMessage} style={styles.inputForm}>
                <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Nhập câu hỏi của bạn..."
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Gửi</button>
            </form>
        </div>
    );
};

// CSS-in-JS cơ bản để tạo kiểu
const styles: { [key: string]: React.CSSProperties } = {
    chatContainer: {
        width: '400px',
        margin: '20px auto',
        border: '1px solid #ccc',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        height: '600px',
        fontFamily: 'Arial, sans-serif'
    },
    messageArea: {
        flexGrow: 1,
        padding: '10px',
        overflowY: 'auto',
        borderBottom: '1px solid #ccc',
        backgroundColor: '#f9f9f9'
    },
    message: {
        padding: '8px',
        borderRadius: '5px',
        marginBottom: '10px',
        maxWidth: '80%',
    },
    userMessage: {
        backgroundColor: '#007bff',
        width: 'fit-content',
        color: 'white',
        alignSelf: 'flex-end',
        marginLeft: 'auto'
    },
    botMessage: {
        backgroundColor: '#e9e9eb',
        color: 'black',
        alignSelf: 'flex-start'
    },
    inputForm: {
        display: 'flex',
        padding: '10px',
    },
    input: {
        flexGrow: 1,
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        marginRight: '10px'
    },
    button: {
        padding: '10px 15px',
        border: 'none',
        backgroundColor: '#007bff',
        color: 'white',
        borderRadius: '5px',
        cursor: 'pointer'
    }
};

export default ChatbotComponent;