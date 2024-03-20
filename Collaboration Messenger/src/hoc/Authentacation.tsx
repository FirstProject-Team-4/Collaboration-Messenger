import { ReactComponentElement, useContext } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/appContext";
import { auth } from "../config/config-firebase";

const Authantication = ({ children }: { children: React.ReactNode }) => {
  const { userData } = useAppContext();
  const [user,loading] = useAuthState(auth);
  const location = useLocation();
  console.log(userData);
  if (!user&&!loading) {

    return <Navigate replace to="/login" state={{ from: location.pathname }} />;
  }
    
  return <>{!loading&&userData&&userData.username&&children}</>;
};
  
  
  
export default Authantication;