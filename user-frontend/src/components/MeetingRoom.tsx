import { useState, useEffect } from 'react';
import axios from 'axios';

interface Message {
  id: number;
  message: string;
  upvotes: number;
}

export default function MeetingRoom () {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messageboxValue, setMessageboxValue] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const[userId,setUserId]=useState(0);
  const [upvotedMessages, setUpvotedMessages] = useState<string[]>([]);
  const[name,setName]=useState('');

  const showMessage = (data: any) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: data.message.id,
        message: data.message.content,
        upvotes: data.message.upvotes,
      },
    ]);
    setMessageboxValue('');
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

  const sendMessage = () => {
    if (!ws) {
      showMessage("No WebSocket connection :(");
      return;
    }

    const message = `${messageboxValue} ${userId}`;
    
    ws.send(message);
  };

  const upvoteMessage = (messageId:number) => {
    if (!ws ) {
      showMessage('No WebSocket connection :(');
      return;
    }
    ws.send(`upvote:${messageId}`);
    setUpvotedMessages((prevUpvotedMessages) => [
      ...prevUpvotedMessages,
      messageId.toString(),
    ]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/user',{
          headers:{
            'Authorization':window.localStorage.getItem('Authorization')
          }
        });
        // Handle the response data as needed
        setUserId(response.data.userId);
        setName(response.data.name);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
   initWebSocket();
  }, []); 

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Real Time Messaging.</h1>
      <div className="max-h-400  mb-4" id="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <div>{msg.message}</div>
            <button
              onClick={() => {if(!upvotedMessages.includes(msg.id.toString()))
                {upvoteMessage(msg.id)
              }}}
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              Upvote: {msg.upvotes}
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        id="messagebox"
        placeholder="Type your message here"
        className="block w-full mb-2 p-2"
        value={messageboxValue}
        onChange={(e) => setMessageboxValue(e.target.value)}
      />
      <button
        id="send"
        title="Send Message!"
        className="w-full bg-green-500 text-white px-2 py-1 rounded"
        onClick={sendMessage}
      >
        Send Message
      </button>
    </div>
  );
};

