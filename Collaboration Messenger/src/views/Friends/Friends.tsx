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

  const handleViewChange = (view: string) => {
    switch (view) {
    case 'friendsList':
      return <FriendsList />;
    case 'friendsRequest':
      return <FriendsRequest />;
    case 'block':
      return <BlockList />;
    default:
      return <FriendsList />;//status
    }
  };
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
  );
}