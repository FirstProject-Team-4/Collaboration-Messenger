import './Header.css';
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/appContext";
import { logoutUser } from "../service/auth";
import Button from "./Button";
import Group from '../views/Group/Group';

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
             <>
        <div className="header-view">
            <NavLink to="/privateChats" className={'header-nav'}> Private </NavLink>
            <NavLink to="/group" className={'header-nav'} >Groups</NavLink>
            <NavLink to='/friends' className={'header-nav'}>Friends</NavLink>
            <NavLink to="/calendar" className={'header-nav'} > Calendar </NavLink>
        </div>
            <Button id='logout' onClick={logout} >Logout </Button>
            </>
    );
}
