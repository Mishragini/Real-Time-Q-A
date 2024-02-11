import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';


interface Message {
  id: string;
  message: string;
  upvotes: number;
  author:string
}

export default function MeetingRoom() {
  const {meetingId='0'}=useParams();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const showMessage = (data: any) => {
    if(parseInt(meetingId)!==data.message.meetingId) return ;

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: data.message.id,
        message: data.message.content,
        upvotes: data.message.upvotes,
        author:data.author
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
        console.log(data);
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
  useEffect(() => {
  }, [messages]);


   messages.sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div>
      <h1 className='text-3xl font-bold mb-4'>Admin Meeting Room</h1>
      <div className="max-h-400  mb-4 " id="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            
            <div>{msg.author}</div>
            <div>{msg.message}</div>
            <button
             
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              Upvotes: {msg.upvotes}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

