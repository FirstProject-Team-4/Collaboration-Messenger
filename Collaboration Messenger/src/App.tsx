import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { auth } from './config/config-firebase';
import React,{ useState, useEffect } from 'react';
import Register from './views/Register/Register';
import Login from './views/Login/Login';
import About from './views/About/About';
import { getUserData } from './service/user';
import { AppContext } from './context/appContext';
import { useAuthState } from 'react-firebase-hooks/auth';

function App() {
console.log(React);
  const [context, setContext] = useState({
    user: null as any,
    userData:  null as any,
  })
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      getUserData(user.uid)
        .then(snapshot => {
          if (snapshot.exists()) {
            setContext({ user, userData: snapshot.val()[Object.keys(snapshot.val())[0]] });
          }
        })
    }



  }, [user, context.user]);
  return (
    <>
<BrowserRouter>
        <AppContext.Provider value={{ ...context, setContext }}>
          {/* <Header /> */}
          <div className="main-content">
            <Routes>
            <Route path="/" element={<About />} />
              <Route path="/about" element={<About />} />
              <Route path="/chat/:id" element />
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
