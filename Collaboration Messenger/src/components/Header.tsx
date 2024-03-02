import './Header.css';
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/appContext";
import { logoutUser } from "../service/auth";
import Button from "./Button";
import Group from '../views/Group/Group';
import { ref, update } from 'firebase/database';
import { db } from '../config/config-firebase';

/**
 * Renders the header component.
 * 
 * @returns The header component.
 */
export const Header = () => {
    const navigate = useNavigate();
    const { user,userData, setContext } = useAppContext();
    // const location = useLocation();
    const logout = async () => {
        await logoutUser();
        update(ref(db, `users/${userData.username}/status`), { status:'offline'});
        const groups=userData.groups?Object.keys(userData.groups):[]
        groups.forEach(id=>{
            update(ref(db, `groups/${id}/members/${userData.username}`), { status:'offline'});
        })
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
