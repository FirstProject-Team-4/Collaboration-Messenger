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
    const logout = async () => {
        await logoutUser();
        setContext({ user: null, userData: null });
        navigate('/about');
    }


    return (
        user &&
        <div>
            <NavLink to="/privateChats"> Private </NavLink> 
            <NavLink to="/groupChats" > Group </NavLink>
            <NavLink to="/calendar" > Calendar </NavLink>
            <Button onClick={logout}>Logout </Button>
        </div>
    );
}
