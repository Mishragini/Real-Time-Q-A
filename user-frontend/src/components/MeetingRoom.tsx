import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface Message {
  id: number;
  message: string;
  upvotes: number;
  author:string
}

export default function MeetingRoom () {
  const{meetingId='0'}=useParams();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messageboxValue, setMessageboxValue] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const[userId,setUserId]=useState(0);
  const [upvotedMessages, setUpvotedMessages] = useState<string[]>([]);

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

    const message = `${messageboxValue}:${userId}:${meetingId}`;
    
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
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    

    fetchData();
   initWebSocket();
  }, []); 
  useEffect(() => {
  }, [messages]);


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Real Time Messaging.</h1>
      <div className="max-h-400  mb-4" id="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <div>{msg.author}</div>
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
      <div className="min-h-screen flex flex-col justify-end">
      <div className='flex justify-between'>
        <input
          type="text"
          id="messagebox"
          placeholder="Type your message here"
          className="w-full p-2 border rounded-md focus:outline-none focus:border-green-500 mr-2"
          value={messageboxValue}
          onChange={(e) => setMessageboxValue(e.target.value)}
        />
        <button
          id="send"
          title="Send Message!"
          className=" h-10 bg-green-500 text-white px-2 py-2 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
      
    </div>
  );
};

