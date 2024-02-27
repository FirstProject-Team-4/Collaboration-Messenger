import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// import { useLocation } from "react-router-dom";
import { useAppContext } from "../context/appContext";
import { logoutUser } from "../service/auth";
import Button from "./Button";

/**
 * Renders the header component.
 * 
 * @returns The header component.
 */
export const Header = () => {
    const navigate = useNavigate();
    const { user, setContext } = useAppContext();
    // const location = useLocation();

    /**
     * Logs out the user, clears the user context, and navigates to the about page.
     */
    const logout = async () => {
        await logoutUser();
        setContext({ user: null, userData: null });
        navigate('/about');
    }


    return (
        <div>
            <NavLink to="/about"> About </NavLink> 
            <NavLink to="/chat" > Chat </NavLink>
            <NavLink to="/profile" > Profile </NavLink>
            <NavLink to="/login" > Login </NavLink>
            <NavLink to="/register" > Register </NavLink>
            {user && <Button onClick={logout}>Logout </Button>}
        </div>
    )
}