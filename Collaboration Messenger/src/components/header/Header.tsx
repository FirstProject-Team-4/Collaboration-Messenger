import './Header.css';
import { NavLink, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {useAppContext, useCallContext, useDyteContext } from "../../context/appContext";
import { logoutUser } from "../../service/auth";
import {  onValue, ref, remove,update } from 'firebase/database';
import { db } from '../../config/config-firebase';
import ChatIcon from '@mui/icons-material/Chat';
import Groups2Icon from '@mui/icons-material/Groups2';
import Diversity2Icon from '@mui/icons-material/Diversity2';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LogoutIcon from '@mui/icons-material/Logout';
import React, { useEffect, useState } from 'react';
import { DyteMeeting} from '@dytesdk/react-ui-kit';
import { setStatusToBusy, toggleStatus} from '../../service/status';
import toast from 'react-hot-toast';
import ImageComp from '../imageComp/ImageComp';
// import logo from '/image/busyChat_logo.png';
/**
 * Renders the header component.
 * 
 * @returns The header component.
 */
export const Header = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { userData, setContext } = useAppContext();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { meeting, initMeeting } = useDyteContext();
  const { inCall, setInCall } = useCallContext();
  const [minimizedMeeting, setMinimizedMeeting] = useState(false);
  const [groupNotifications, setGroupNotifications] = useState(false);
  const [privateNotif, setPrivatNotif] = useState(false);

  useEffect(() => {
    if (meeting) {
      meeting.self.on('roomLeft', () => { //Handle Navigation
        setInCall(false);
        toggleStatus(userData);
      });
      meeting.self.on(`roomJoined`, () => {//Send message to chat
        setStatusToBusy(userData);
        console.log("roomJoined");
      });
    }
  }, [meeting, userData]);
  useEffect(() => {
    if (!userData) {
      return;
    }
    onValue(ref(db, `users/${userData.username}/callNotification`), (snapshot) => {
      if (snapshot.exists()) {
        if (snapshot.val().status !== 'pending') {
          remove(ref(db, `users/${userData.username}/callNotification`));
          return;
        }
        const data = snapshot.val();
        console.log(data);
        const callAudio = new Audio();
        callAudio.play();
        const toastID = toast((t) => (
          <div id='custom-toast'>
            <ImageComp unique={data.caller} type='user'></ImageComp>
                        Incoming Call <b>{data.caller.username}</b>
            <button onClick={() => {
              update(ref(db, `users/${userData.username}/callNotification`), { status: 'declined' });

              toast.dismiss(t.id);
              callAudio.pause();
              callAudio.currentTime = 0;
            }}>
                            Decline
            </button>
            <button onClick={async () => {


              await initMeeting({
                authToken: data.offer,
                defaults: {
                  audio: false,
                  video: false,
                },
              });
              update(ref(db, `users/${userData.username}/callNotification`), { status: 'accepted' });
              callAudio.pause();
              callAudio.currentTime = 0;
              toast.dismiss(t.id);
              setInCall(true);
            }}>
                            Accept
            </button>
          </div>
        ), {
          duration: 20000
        });


      }
    });

  }, [userData]);
  useEffect(() => {
    if (!userData) {
      return;
    }
    onValue(ref(db, `users/${userData.username}/groupNotifications`), (snapshot) => {
      if (snapshot.exists()) {
        setGroupNotifications(true);
      }
      else {
        setGroupNotifications(false);
      }
    });
    onValue(ref(db, `users/${userData.username}/privateNotifications`), (snapshot) => {
      if (snapshot.exists()) {
        setPrivatNotif(true);
      }
      else {
        setPrivatNotif(false);
      }
    });
  }, [userData]);




  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
    // const location = useLocation();
  const logout = async () => {
    await logoutUser();
    setContext({ user: null, userData: null });
    update(ref(db, `users/${userData.username}/status`), { status: 'offline' });
    const groups = userData.groups ? Object.keys(userData.groups) : [];
    groups.forEach(id => {
      update(ref(db, `groups/${id}/members/${userData.username}`), { status: 'offline' });
    });
     
       
    navigate('/login');
  };

  const profile = () => {
    navigate(`/profile/${userData?.username}`);
  };

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }
  return (
    userData &&
        <>
          <div className='logo'><NavLink to='/home' className='logo'>
            <img src='/image/busy-logo.webp' alt="Logo" style={{ width: 100, height: 100 }} />
          </NavLink></div>
          <div className="header-view">
            <NavLink to="/privateChats" className={'header-nav'}> <ChatIcon /><br />{privateNotif ? 'Chat ' :"Chat"} </NavLink>
            <NavLink to="/group" className={'header-nav'} ><Groups2Icon /><br />{groupNotifications ? 'Group !' : "Group"}</NavLink>

            {/* <NavLink to="/privateChats" className={'header-nav'}> <ChatIcon /><br />Chats </NavLink>
                <NavLink to="/group" className={'header-nav'} ><Groups2Icon /><br />Groups</NavLink> */}
            <NavLink to='/friends' className={'header-nav'}><Diversity2Icon /><br />Friends</NavLink>
            <NavLink to="/calendar" className={'header-nav'} ><CalendarMonthIcon /><br />Calendar </NavLink>

          </div>
          <div className='logout'>
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
            >
              <MenuItem className="logout-menu-item" onClick={profile}>Profile</MenuItem>
              <MenuItem className="logout-menu-item" onClick={logout}>Logout</MenuItem>
            </Menu>
          </div>
            
          {inCall && <div onClick={() => { setMinimizedMeeting(!minimizedMeeting); }} className="top-div">

            <p onClick={() => { setMinimizedMeeting(!minimizedMeeting); }} >{minimizedMeeting ? 'Return to meeting' : 'Hide'}</p>


          </div>}

          {inCall && <div className={minimizedMeeting ? "dyte-meeting-minimized-container" : "dyte-meeting-fullscreen-container"}>
            <DyteMeeting meeting={meeting} />
          </div>}
        </>
  );
};

