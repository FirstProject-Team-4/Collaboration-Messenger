import { useState } from "react";
import FriendsRequest from "../../components/friends/FriendsRequest";
import FriendsList from "../../components/friends/FriendsList";
import UserSearch from "../../components/Search/UserSearch";
import Button from "../../components/button/Button";
import './Friends.css';
import BlockList from "../../components/BlockList/BlockList";

/**
 * Renders the Friends component.
 * @returns {React.ReactNode} - The rendered Friends component.
 */
export default function Friends() {
    const [view, setView] = useState('friendsList');//status->default

    /**
     * Handles the change of view based on the provided view parameter.
     * @param {string} view - The view to be displayed.
     * @returns {React.ReactNode} - The React node representing the view.
     */
    const handleViewChange = (view: string): React.ReactNode => {
        switch (view) {
            case 'friendsList':
                return <FriendsList />;
            case 'friendsRequest':
                return <FriendsRequest />;
            case 'block':
                return <BlockList />;
            default:
                return <FriendsList />; // Default view is the FriendsList
        }
    }
    return (
        <div className="view-frineds">
          
            <div className="header-frineds">
                <Button className="friends-button" onClick={() => setView('friendsList')}><span>Friends</span></Button>
                <Button className="friends-button" onClick={() => setView('friendsRequest')}><span>Requests</span></Button>
                <Button className="friends-button" onClick={() => setView('block')}><span>Block</span></Button>
                <UserSearch type="Add friend" />
            </div>
            <div className="view">
               
                {handleViewChange(view)}
            </div>
        </div>
    )
}