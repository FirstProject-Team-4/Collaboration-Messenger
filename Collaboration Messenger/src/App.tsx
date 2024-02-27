import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { auth } from './config/config-firebase';
import { useState, useEffect } from 'react';
import RegisterView from './views/About/Register';

function App() {

  const [context, setContext] = useState({
    user: null as any,
    userData: null,
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
          <Header />
          <div className="main-content">
            <Routes>
           
              <Route path="/home" element={<HomeView />} />
              <Route path="/chat/:id" element />
              <Route path="/allUsers" element />
              <Route path="/login" element={<LoginView />} />
              <Route path="/register" element={<RegisterView />} />
              <Route path="*" element={<h1> 404 Not Found</h1>} />
            </Routes>
          </div>
          <Footer />
        </AppContext.Provider>
      </BrowserRouter>
    </>
  
  )
}

export default App;
