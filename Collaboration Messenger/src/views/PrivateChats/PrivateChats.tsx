import './PrivateChats.css';
import Chat from "../../components/chat/Chat";
import Information from "../Information/Information";
import { useParams } from 'react-router-dom';
import UserSearch from '../../components/Search/UserSearch';
import { useEffect } from 'react';
// import Profile from '../Profile/Profile';
import UserProfile from '../Profile/UserProfile';





const PrivateChats = () => {
    const { id } = useParams<{ id: string }>();
    console.log('PrivateChats');

    useEffect(() => {
    }, [id])
    console.log('PrivateChats');

    return (
        <>
            <div className='search-users'>

                <UserSearch />
            </div>
            <div className="inf">
                <Information />
            </div>
            <div className="chat-container">
                <Chat type={'private'} />
            </div>

            <div className="profile">
                <UserProfile />
                {/* <Profile /> */}
            </div>

            </>
            );
}
            export default PrivateChats;