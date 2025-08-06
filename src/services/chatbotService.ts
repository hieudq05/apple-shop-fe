// src/services/aiApiService.js

// Hàm này sẽ gọi đến endpoint streaming của backend
export const fetchChatbotStream = async (query, userId, onData, onComplete, onError) => {
    try {
        const response = await fetch('http://localhost:8080/api/v1/ai/chat', { // Gọi đến Spring Boot backend
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({query, userId}),
        });

        if (!response.body) {
            throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                break; // Stream kết thúc
            }
            const chunk = decoder.decode(value, {stream: true});

            // Dify streaming response thường có dạng "data: {...}\n\n"
            // Ta cần parse để lấy nội dung JSON bên trong
            const lines = chunk.split('\n\n');
            lines.forEach(line => {
                if (line.startsWith('data: ')) {
                    const jsonData = line.substring(6);
                    try {
                        const parsed = JSON.parse(jsonData);
                        if (parsed.event === 'message') {
                            onData(parsed.answer); // Lấy phần text trả về
                        }
                    } catch (e) {
                        // Bỏ qua các dòng không phải JSON hợp lệ
                    }
                }
            });
        }

        onComplete(); // Báo hiệu stream đã hoàn tất

    } catch (error) {
        console.error("Error fetching chatbot stream:", error);
        onError(error);
    }
};