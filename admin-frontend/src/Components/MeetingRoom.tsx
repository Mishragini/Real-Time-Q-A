import { useEffect, useState } from 'react';
import { w3cwebsocket as WebSocket } from 'websocket';

interface Message {
  id: string;
  content: string;
  upvotes: number;
  type:String
}

export default function MeetingRoom() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000'); 

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data.toString()) as Message;
      if (message&&message.type === 'message') {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const sortedMessages = messages.sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div>
      <h1>Admin Meeting Room</h1>
      <ul>
        {sortedMessages.map((message) => (
          <li key={message.id}>
            {message.content} - Upvotes: {message.upvotes}
          </li>
        ))}
      </ul>
    </div>
  );
};

