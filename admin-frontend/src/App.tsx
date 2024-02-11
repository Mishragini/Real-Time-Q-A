import {BrowserRouter,Routes,Route} from 'react-router-dom';

import './App.css'
import Signup from './Components/Signup';
import Signin from './Components/Signin';
import Landing from './Components/Landing';
import CreateMeeting from './Components/CreateMeeting';
import MeetingRoom from './Components/MeetingRoom';
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing />}></Route>
        <Route path='/signup' element={<Signup />}></Route>
        <Route path='/signin' element={<Signin />}></Route>
        <Route path='/create-meeting' element={<CreateMeeting />}></Route>
        <Route path='/meeting-room/:meetingId' element={<MeetingRoom/>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
