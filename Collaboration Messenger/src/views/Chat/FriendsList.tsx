import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAppContext } from "../../context/appContext";

export default function FriendsList({ friends }: { friends: any }) {
    const [friendList, setFriendList] = useState<any>([]);
    const { userData } = useAppContext();
  
    console.log('FriendsList');

    useEffect(() => {
        if (friends) {
            const currentFriendList = Object.keys(friends).map((key) => friends[key]);
            setFriendList(currentFriendList);
        }
    }, [userData]);

   
    console.log('FriendsList');

    return (
        <>
            <h4>Friends</h4>
            {friendList && friendList.map((friend: any, index: number) => (
                <div key={index} className="friend-info">
                    <NavLink to={`/profile/${friend.username}`}>{friend.username}</NavLink>
                    {/* <button className='btn' onClick={navigateToChat}>Chat</button> */}
                </div>
            ))}
        </>
    );
}
