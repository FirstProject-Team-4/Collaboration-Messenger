import './Header.css';
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/appContext";
import { logoutUser } from "../../service/auth";
import { ref, update } from 'firebase/database';
import { db } from '../../config/config-firebase';
import ChatIcon from '@mui/icons-material/Chat';
import Groups2Icon from '@mui/icons-material/Groups2';
import Diversity2Icon from '@mui/icons-material/Diversity2';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LogoutIcon from '@mui/icons-material/Logout';
import React from 'react';
// import logo from '/image/busyChat_logo.png';
/**
 * Renders the header component.
 * 
 * @returns The header component.
 */
export const Header = () => {

    const navigate = useNavigate();
    const { userData, setContext } = useAppContext();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    // const location = useLocation();
    const logout = async () => {
        update(ref(db, `users/${userData.username}/status`), { status: 'offline' });
        const groups = userData.groups ? Object.keys(userData.groups) : []
        groups.forEach(id => {
            update(ref(db, `groups/${id}/members/${userData.username}`), { status: 'offline' });
        })
        await logoutUser();
        setContext({ user: null, userData: null });
        navigate('/about');
    }

    const profile = () => {
        navigate(`/profile/${userData?.username}`);
    }

    return (
        userData &&
        <>
             
            <div className="header-view">
                {/* <NavLink to='/home' className='logo'>
                    <img src={logo} alt="Logo" />
                </NavLink> */}
                <NavLink to="/privateChats" className={'header-nav'}> <ChatIcon /><br />Chats </NavLink>
                <NavLink to="/group" className={'header-nav'} ><Groups2Icon /><br />Groups</NavLink>
                <NavLink to='/friends' className={'header-nav'}><Diversity2Icon /><br />Friends</NavLink>
                <NavLink to="/calendar" className={'header-nav'} ><CalendarMonthIcon /><br />Calendar </NavLink>

            </div>
            <IconButton
                id="logout"
                aria-controls="logout-menu"
                aria-haspopup="true"
                onClick={handleClick}
                className="logout-button"
                style={{ color: 'white' }}
            >
                <LogoutIcon />
            </IconButton>
            <Menu
                id="logout-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            //   className="logout-menu"
            >
                <MenuItem className="logout-menu-item" onClick={profile}>Profile</MenuItem>
                <MenuItem className="logout-menu-item" onClick={logout}>Logout</MenuItem>
            </Menu>
            <div className="top-div">This is a hardcoded div at the top of the page</div>
        </>
    );
}
