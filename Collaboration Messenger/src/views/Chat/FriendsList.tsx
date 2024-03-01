import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
// import { chatId } from "../../service/friends";
import { useAppContext } from "../../context/appContext";
// import { commbineId } from "../../service/friends";

export default function FriendsList({ friends }: { friends: any }) {
    const [friendList, setFriendList] = useState<any>([]);
    const { userData } = useAppContext();
    // const navigate = useNavigate();
    console.log('FriendsList');

    useEffect(() => {
        if (friends) {
            const currentFriendList = Object.keys(friends).map((key) => friends[key]);
            setFriendList(currentFriendList);
        }
    }, [userData]);

    // const navigateToChat = () => {
    //     navigate(`/chat/${commbineId()}`);
    // };
   
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
