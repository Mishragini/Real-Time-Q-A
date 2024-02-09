import { useEffect, useState } from 'react';


interface Message {
  id: string;
  message: string;
  upvotes: number;
}

export default function MeetingRoom() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const showMessage = (data: any) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: data.message.id,
        message: data.message.content,
        upvotes: data.message.upvotes,
      },
    ]);
  };

  const updateUpvote = (data: any) => {

    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === data.messageId
          ? { ...msg, upvotes: data.upvotes }
          : msg
      )
    );
  };

  const initWebSocket = () => {
    let newWs = new WebSocket('ws://localhost:3000');
    newWs.onopen = () => {
      console.log('WebSocket connection opened!');
    };
    newWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'upvote') {
        updateUpvote(data);
      } else if (data.type === 'message') {
        showMessage(data);
      }
    };

    setWs(newWs);

    return () => {
      newWs.onerror = newWs.onopen = newWs.onclose = null;
    };
  };

  useEffect(() => {
    initWebSocket();
  }, []);

   messages.sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div>
      <h1>Admin Meeting Room</h1>
      <div className="max-h-400  mb-4" id="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <div>{msg.message}</div>
            <button
             
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              Upvote: {msg.upvotes}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

