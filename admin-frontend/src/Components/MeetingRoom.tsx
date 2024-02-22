import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Message {
  id: number;
  content: string;
  upvotes: number;
  author:string;
  answered:boolean
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
        id: parseInt(data.message.id),
        content: data.message.content,
        upvotes: data.message.upvotes,
        author:data.author,
        answered:false
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
    const fetchMessages=async()=>{
      try{
        const response=await axios.get(`http://localhost:3000/messages/${meetingId}`);
        console.log(response);
        const messages=response.data;
        setMessages(messages);
      }
      catch(error){
        console.error('Error fetching data:', error);
  
      }
     }
    initWebSocket();
   fetchMessages();
  }, []);
 
  const updateAnswered = async (messageId: number) => {
    console.log(typeof(messageId));
    try {
      // Send a request to mark the message as answered on the server
      await axios.put(`http://localhost:3000/messages/${messageId}`, {}, {
        headers: {
          'Authorization': window.localStorage.getItem('Authorization'),
        },
      });
  
      setMessages((prevMessages) =>
        prevMessages.filter((msg) =>{ 
          console.log(typeof(msg.id));
          return (msg.id !== messageId)})
      );
  
      console.log('Message marked as answered successfully');
    } catch (error) {
      console.error('Error marking message as answered:', error);
    }
  };

   messages.sort((a, b) => b.upvotes - a.upvotes);

   return (
    <div className='container'>
      <h1 className='text-3xl font-bold mb-4 ml-2'>Admin Meeting Room</h1>
      <div className="max-h-400 mb-4 " id="messages">
        {messages.length === 0 ? (
          <p>No messages yet. Waiting for messages...</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`mb-2 ml-4 ${msg.answered ? 'hidden' : ''}`}>
              <div className='text-lg font-bold ml-4'>{msg.author}:</div>
              <div className='ml-4'>{msg.content}</div>
              <button
                className="bg-blue-500 text-white px-2 py-1 rounded ml-4"
              >
                Upvotes: {msg.upvotes}
              </button>
              <button
                onClick={() => {
                  updateAnswered(msg.id);
                }}
                className="bg-green-500 focus:bg-green-400 text-white px-2 py-1 rounded ml-2"
              >
                Answered
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

