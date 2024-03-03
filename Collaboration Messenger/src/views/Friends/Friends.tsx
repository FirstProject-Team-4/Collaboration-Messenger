import { useState } from "react";
import FriendsRequest from "../Chat/FriendsRequest";
import FriendsList from "../Chat/FriendsList";
import UserSearch from "../../components/Search/UserSearch";
import Button from "../../components/Button";
import './Friends.css';

export default function Friends() {
  const [view, setView]=useState('friendsList');//status->default

  const handleViewChange = (view: string) => {
  switch(view){
    case 'friendsList':
        return <FriendsList />;
    case 'friendsRequest':
        return <FriendsRequest />;
        case 'addFriends':
            return <UserSearch type="addFriend" />;
       //добави после
    // case 'Block':
    //     return < />;//block
    // case 'status':
    //     return < />;//status
    default:
        return <FriendsList />;//status
  }
}
return(
    <div className="view-frineds">
        <Button onClick={()=>setView('friendsList')}>Friends</Button>
        <Button onClick={()=>setView('status')}>Status</Button>
        <Button onClick={()=>setView('friendsRequest')}>Requests</Button>
        <Button onClick={()=>setView('addFriends')}>Add Friends</Button>
        <Button onClick={()=>setView('block')}>Block</Button> 
        <div className="view">
        {handleViewChange(view)}
        </div>
        </div>
)
}