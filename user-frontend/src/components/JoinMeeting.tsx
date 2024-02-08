import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function JoinMeeting(){
const[roomCode,setCode]=useState('');
const navigate=useNavigate();
return(
<div>
        <h3 className="text-sm font-semibold">Enter your Meeting Code.</h3>
        <input onChange={(e)=>{
          setCode(e.target.value)
        }}
          className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
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
          window.localStorage.setItem("Authorization","Bearer "+response.data.token)
          navigate("/meeting-room");
        }}
      >
        Join Meeting
      </button>
      </div>
)
}