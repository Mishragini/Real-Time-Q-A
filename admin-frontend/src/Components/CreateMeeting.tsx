import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateMeeting() {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [meetingCode, setMeetingCode] = useState('');
  const [showMeetingCode, setShowMeetingCode] = useState(false);

  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-md shadow-md ">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">Sign In</h1>
        <p className="text-gray-600 mb-4">Enter your credentials to access your account</p>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold">Topic</h3>
        <input
          onChange={(e) => {
            setTopic(e.target.value);
          }}
          className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
          type="text"
          placeholder="Enter topic"
        />
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold">Description</h3>
        <input
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
          type="text"
          placeholder="Enter description"
        />
      </div>

      <button
        className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:shadow-outline-gray"
        onClick={async () => {
          const postData = {
            topic,
            description,
          };
          const response = await axios.post("http://localhost:3000/admin/create-meeting", postData, {
            headers: {
              'Authorization': window.localStorage.getItem('Authorization'),
              'Content-Type': 'application/json',  
            },
          });
          setMeetingCode(response.data.code);
          setShowMeetingCode(true);
        }}
      >
        Create Meeting
      </button>

      {showMeetingCode && (
        <>
          <h1>Code: {meetingCode}</h1>
          <button
            className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-400 focus:outline-none focus:shadow-outline-gray"
            onClick={() => {
              navigate("/meeting-room");
            }}
          >
            Join Meeting
          </button>
        </>
      )}
    </div>
  );
}
