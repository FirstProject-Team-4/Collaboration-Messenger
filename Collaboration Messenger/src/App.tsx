import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { auth, db } from './config/config-firebase';
import { useState, useEffect } from 'react';
import Register from './views/Register/Register';
import Login from './views/Login/Login';
import About from './views/About/About';
import { getUserData } from './service/user';
import { AppContext } from './context/appContext';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Header } from './components/Header';
import Home from './views/Home/Home';
import Group from './views/Group/Group';
import PrivateChats from './views/PrivateChats/PrivateChats';
import Friends from './views/Friends/Friends';
import { toggleStatus } from './service/status';
import Profile from './views/Profile/Profile';
import { onDisconnect, ref, update } from 'firebase/database';
import firebase from 'firebase/compat/app';


function App() {
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
      // update(ref(db, `users/${context.userData.username}`), { status:'online'});
      // const address = ref(db, `users/${context.userData.username}`);
      // onDisconnect(address).update({status:'offline'});
      toggleStatus(context.userData);
    }
    
  }, [context.userData]);

 
  return (
    <>
      <BrowserRouter>
        <AppContext.Provider value={{ ...context, setContext }}>
          <Header />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<About />} />
              
              <Route path='/profile/:id' element={<Profile />} />
              <Route path="/about" element={<About />} />
              <Route path="/home" element={<Home />} />
              <Route path="/group/:id" element={<Group/>} />
              <Route path="/group" element={<Group/>} />
              <Route path="/chat/:id" element />
              <Route path="/friends" element={<Friends />} />
              <Route path="/privateChats" element={<PrivateChats />} />
              <Route path="/privateChats/:id" element={<PrivateChats />} />
              <Route path="/allUsers" element />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<h1> 404 Not Found</h1>} />
            </Routes>
          </div>
          {/* <Footer /> */}
        </AppContext.Provider>
      </BrowserRouter>
    </>

  )
}

export default App;
