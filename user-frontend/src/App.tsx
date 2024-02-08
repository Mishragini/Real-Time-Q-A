import { BrowserRouter,Route,Routes } from 'react-router-dom'
import './App.css'
import Signup from './components/Signup'
import Signin from './components/Signin'
import JoinMeeting from './components/JoinMeeting'
import MeetingRoom from './components/MeetingRoom'

function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/signin' element={<Signin/>}/>
      <Route path='/join-meeting' element={<JoinMeeting/>}/>
      <Route path='/meeting-room' element={<MeetingRoom/>}/>

    </Routes>
    </BrowserRouter>
  )
}

export default App
