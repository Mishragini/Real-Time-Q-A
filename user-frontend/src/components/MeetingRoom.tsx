import { useEffect, useState } from 'react';
import { w3cwebsocket as WebSocket } from 'websocket';
import axios from 'axios';

interface Message {
    id: string;
    content: string;
    upvotes: number;
    type:String;
    authorId:number
  }

export default function MeetingRoom(){

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');

    const [userId,setUserId]=useState(0);
  
    useEffect(() => {
       async()=>{
        const response= await axios.get('http://localhost:3000/user');
         setUserId(response.data.userId);
       }
      
      const ws = new WebSocket('ws://localhost:3000');
  
      ws.onmessage = (event) => {
        const rawMessage = JSON.parse(event.data.toString());
        const message = rawMessage as Message;
  
        if (message && message.type === 'message') {
          setMessages((prevMessages) => [...prevMessages, message]);
        } else if (message && message.type === 'upvote') {
        }
      };
  
      return () => {
        ws.close();
      };
    }, []);
  
    const sendMessage = () => {
      const ws = new WebSocket('ws://localhost:3000'); 
  
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'sendMessage',
            content: newMessage,
            userId,
          })
        );
  
        setNewMessage('');
      };
    };
  
    const upvoteMessage = (messageId: string) => {
      const ws = new WebSocket('ws://localhost:3000'); 
  
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'upvote',
            messageId,
            userId, 
          })
        );
      };
    };
  
    return (
      <div>
        <h1>User Meeting Room</h1>
        <div>
          <input
            className='w-full p-2 border rounded-md focus:outline-none focus:border-blue-500'
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:shadow-outline-gray" onClick={sendMessage}>Send Message</button>
        </div>
        <ul>
          {messages.map((message) => (
            <li key={message.id}>
              {message.authorId}
              {message.content} - Upvotes: {message.upvotes}
              <button onClick={() => upvoteMessage(message.id)}>Upvote</button>
            </li>
          ))}
        </ul>
      </div>
    );
  };