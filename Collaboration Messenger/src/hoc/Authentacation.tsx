import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/appContext";
import { auth } from "../config/config-firebase";

/**
 * Higher-order component for authentication.
 * 
 * @param children - The child components to render if the user is authenticated.
 * @returns The authenticated child components or a redirect to the login page.
 */
const Authantication = ({ children }: { children: React.ReactNode }) => {
  const { userData } = useAppContext();
  const [user, loading] = useAuthState(auth);
  const location = useLocation();
  if (!user && !loading) {

    return <Navigate replace to="/login" state={{ from: location.pathname }} />;
  }

  return <>{!loading && userData && userData.username && children}</>;
};



export default Authantication;