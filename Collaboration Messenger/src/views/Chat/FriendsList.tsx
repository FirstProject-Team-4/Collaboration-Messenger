import { onChildRemoved, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { db } from "../../config/config-firebase";
import { useAppContext } from "../../context/appContext";
import ImageComp from "../../components/imageComp/ImageComp";


export default function FriendsList() {
    const [friendList, setFriendList] = useState<any>([]);
    const { userData } = useAppContext();
  
    console.log('FriendsList');

    useEffect(() => {
        onValue(ref(db, `users/${userData?.username}/friends`), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const friends = Object.keys(data).map((key) => ({
                    id: key,
                    uid: data[key].uid,
                    username: data[key].username
                }));
                setFriendList(friends);
            } else {
                setFriendList([]);
            }
        });
        onChildRemoved(ref(db, `users/${userData?.username}/friends`), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const friends = Object.keys(data).map((key) => ({
                    id: key,
                    uid: data[key].uid,
                    username: data[key].username
                }
                ));
                setFriendList(friends);
            } else {
                setFriendList([]);
            }
        });
    }, [userData]);


    return (
        <>
            <h4>Friends</h4>
            { friendList.map((friend: any, index: number) => (
                <div key={index} className="friend-info">
                    <ImageComp unique={friend.username} type={'user'} />
                    <NavLink to={`/profile/${friend.username}`}>{friend.username}</NavLink>
                    <button className='btn' onClick={() => {}}>Chat</button>
                  
                </div>
            ))}
        </>
    );
}
