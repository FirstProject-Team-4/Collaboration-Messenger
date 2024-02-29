import './PrivateChats.css';
import Chat from "../../components/Chat";
import Information from "../Information/Information";
import { NavLink } from 'react-router-dom';
import UserSearch from '../../components/Search/UserSearch';




const PrivateChats = () => {
    return (
        <>
            <div className='search-users'>
                <NavLink to='/friends' className='btn-friends'>Friends</NavLink>
                <UserSearch />
            </div>
            <div className="information">
                <Information />
            </div>
            <div className="chat">
                <Chat />
            </div>
        </>
    );
}
export default PrivateChats;