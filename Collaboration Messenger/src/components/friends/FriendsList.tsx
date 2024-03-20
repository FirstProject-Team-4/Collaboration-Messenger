import { get, getDatabase, onChildRemoved, onValue, ref, remove, update } from "firebase/database";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { db } from "../../config/config-firebase";
import { useAppContext } from "../../context/appContext";
import ImageComp from "../imageComp/ImageComp";
import { commbineId} from "../../service/friends";
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import './FriendsList.css';

export default function FriendsList() {
  const [friendList, setFriendList] = useState<any>([]);
  const { userData } = useAppContext();
  const navigate = useNavigate();
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

  const handleChat = async (user: { uid: string, username: string }) => {
    const chatId = commbineId(userData.uid, user.uid);
    const snapshot = await get(ref(db, `/chats/${chatId}`));
    if ((snapshot).exists()) {
      navigate(`/privateChats/${chatId}`);
    } else {
      update(ref(db, `/chats/${chatId}`), { user1: { username: user.username, uid: user.uid }, user2: { username: userData.username, uid: userData.uid } });
      update(ref(db, `/users/${userData.username}/privateChats/${chatId}`), { username: user.username, uid: user.uid });
      update(ref(db, `/users/${user.username}/privateChats/${chatId}`), { username: userData.username, uid: userData.uid });
      navigate(`/privateChats/${chatId}`);
    }
  };

  const handleRemoveFriend = async (user: { username: string, uid: string }) => {
    const db = getDatabase();
    const friendRef = ref(db, `/users/${userData.username}/friends/${user.username}`);
    await remove(friendRef);
    const friendRef2 = ref(db, `/users/${user.username}/friends/${userData.username}`);
    await remove(friendRef2);
  };
   
  // return (
  //     <>
  //         <h4>Friends</h4>
  //         {friendList && friendList.map((friend: any, index: number) => (
  //             <div key={index} className="friend-info">
  //                 <ImageComp unique={friend.username} type={'user'} />
  //                 <NavLink to={`/profile/${friend.username}`}>{friend.username}</NavLink>
  //                 <button onClick={() => handleChat(friend)}><QuestionAnswerIcon /></button>
  //                 <button onClick={() => handleRemoveFriend(friend)}>Remove </button>
  //             </div>
  //         ))}
  //     </>
  // );

  return (
    <>
      <h4 className="title-friends-view">Friends</h4>
      <div className="card-container">
          
        {friendList && friendList.map((friend: any, index: number) => (
          <div key={index} className="card">
            <div className="infos">
              <div className="image">
                <ImageComp className="image-friends" unique={friend} type={'user'} />
              </div>
              <div className="info">
                <NavLink className="name" to={`/profile/${friend.username}`}>{friend.username}</NavLink> 
              </div>
            </div>
            <button className="request" onClick={() => handleChat(friend)}><QuestionAnswerIcon /></button>
            <button className="request" onClick={() => handleRemoveFriend(friend)}>Remove </button>
          </div>
        ))}
            
      </div>
    </>
  );
   
}
