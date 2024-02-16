import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function JoinMeeting(){
const[roomCode,setCode]=useState('');
const navigate=useNavigate();
return(
<div>
<div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-md shadow-md ">
      <div className="flex flex-col items-center">
        <h3 className="text-md font-semibold mb-2">Enter your Meeting Code.</h3>
        <input onChange={(e)=>{
          setCode(e.target.value)
        }}
          className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 mb-4"
          type="text"
        />
          <button
        className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:shadow-outline-gray"
        onClick={async () => {
          const postData={
           roomCode
          }
          const response=await axios.post("http://localhost:3000/user/joinMeeting",postData,{
            headers: {
              'Authorization': window.localStorage.getItem('Authorization'),
              'Content-Type': 'application/json',  
            },});
          navigate(`/meeting-room/${response.data.meetingId}`);
        }}
      >
        Join Meeting
      </button>
      </div>
      </div>
      </div>
)
}