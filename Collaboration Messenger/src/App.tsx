import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { auth, db } from './config/config-firebase';
import { useState, useEffect } from 'react';
import Register from './views/Register/Register';
import Login from './views/Login/Login';
import About from './views/About/About';
import { getUserData } from './service/user';
import { AppContext, CallContext, DyteContext } from './context/appContext';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Header } from './components/header/Header';
import Home from './views/Home/Home';
import Group from './views/Group/Group';
import PrivateChats from './views/PrivateChats/PrivateChats';
import Friends from './views/Friends/Friends';
import { toggleStatus, updateStatusToOnline } from './service/status';
import Profile from './views/Profile/Profile';
import MyCalendar from './views/MyCalendar/MyCalendar';
import { useDyteClient } from '@dytesdk/react-web-core';
import { get, ref, set, update } from 'firebase/database';
import { Toaster } from 'react-hot-toast';
import Authantication from './hoc/Authentacation';
// import { ToastContainer } from 'react-toastify';



function App() {
  const [meeting, initMeeting] = useDyteClient();
  const [inCall, setInCall] = useState(false)
  const [context, setContext] = useState({
    user: {} as any,
    userData: {} as any,
  })
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      console.log(user);
      getUserData(user.uid)
        .then(snapshot => {
          if (snapshot.exists()) {
            setContext({ user, userData: snapshot.val()[Object.keys(snapshot.val())[0]] });
          }
        })
    }
  }, [user]);

  useEffect(() => {
    if (context.userData) {
      toggleStatus(context.userData);
    }

  }, [context.userData]);
 
  const toggleTheme = () => {
    document.body.classList.toggle('dark-mode');
  };
  const updateLastClick=async()=>{
    if(context.userData){
      const lastClick=Number(Date.now());
  
      update(ref(db, `users/${context.userData.username}`),{lastClick:lastClick})
      const status= await get(ref(db, `users/${context.userData.username}/status`));
      console
      if(status.val()==='away'||status.val()==='offline'){
        setContext({user,userData:{...context.userData,status:'online'}});
       updateStatusToOnline(context.userData);
      }
   
    }
  }
  console.log(context.userData)
  return (
    <>
      {/* <ToastContainer /> */}

      <BrowserRouter>
        <AppContext.Provider value={{ ...context, setContext }}>
          <DyteContext.Provider value={{ meeting, initMeeting }}>
            <CallContext.Provider value={{inCall,setInCall}}>
              <Toaster />
            <Header />
            <div onClick={()=>{updateLastClick()}} className="main-content">
              <label className="switch">
                <input type="checkbox" onClick={toggleTheme} />
                <span className="slider"></span>
              </label>
              <Routes>
                <Route path="/" element={<Authantication><Home /></Authantication>} />
                <Route path='/profile/:id' element={<Authantication><Profile /></Authantication>} />
                {/* <Route path="/about" element={<About />} /> */}
                <Route path="/home" element={<Authantication><Home /></Authantication>} />
                <Route path="/group/:id" element={<Authantication><Group /></Authantication>} />
                <Route path="/group" element={<Authantication><Group /></Authantication>} />

                <Route path="/friends" element={<Authantication><Friends /></Authantication>} />
                <Route path="/privateChats" element={<Authantication><PrivateChats /></Authantication>} />
                <Route path="/privateChats/:id" element={<Authantication><PrivateChats /></Authantication>} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path='/calendar' element={<Authantication><MyCalendar /></Authantication>} />
                <Route path="*" element={<h1> 404 Not Found</h1>} />
              </Routes>
            </div>
            {/* <Footer /> */}
            </CallContext.Provider>
          </DyteContext.Provider>
        </AppContext.Provider>
      </BrowserRouter>
    </>

  )
}

export default App;
