import { BrowserRouter,Route,Routes } from 'react-router-dom'
import './App.css'
import Signup from './components/Signup'
import Signin from './components/Signin'
import JoinMeeting from './components/JoinMeeting'
import MeetingRoom from './components/MeetingRoom'
import Landing from './components/Landing'

function App() {

  return (
    <BrowserRouter>
    <Routes>
    <Route path='/' element={<Landing/>}/>

      <Route path='/signup' element={<Signup/>}/>
      <Route path='/signin' element={<Signin/>}/>
      <Route path='/join-meeting' element={<JoinMeeting/>}/>
      <Route path='/meeting-room/:meetingId' element={<MeetingRoom/>}/>

    </Routes>
    </BrowserRouter>
  )
}

export default App
