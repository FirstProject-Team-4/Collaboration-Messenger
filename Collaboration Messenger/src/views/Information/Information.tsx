import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { NavLink } from "react-router-dom";
import ImageComp from "../../components/imageComp/ImageComp";
import { useAppContext } from "../../context/appContext";
import './Information.css';
import { db } from "../../config/config-firebase";
import NotificationsIcon from '@mui/icons-material/Notifications';

interface Chat {
  uid: string;
  id: string;
  username: string;
}

const Information: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [privateNotifications, setPrivateNotifications] = useState<string[]>([]);
  const { userData } = useAppContext();
  useEffect(() => {
    const db = getDatabase();
    const chatsRef = ref(db, `users/${userData?.username}/privateChats`);

    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : [];
      setChats(list);
    });

    return () => unsubscribe();
  }, [userData]);
  useEffect(() => {
    if(!userData){
      return;
    }
    onValue(ref(db, `users/${userData.username}/privateNotifications`), (snapshot) => {
      if (!snapshot.exists()) {
        setPrivateNotifications([]);
      }
      setPrivateNotifications(Object.keys(snapshot.val()));
    })
  }, [userData]);


  return (
    <div className="column-inf">
      <h3 >Messages</h3>


      {chats.map((chat) => (
        <div key={chat.id}>
          {userData?.username !== chat.username &&
            <NavLink to={`/privateChats/${chat.id}`}>
              <div className="chat-user">
                <ImageComp className={'image-inf-message image'} unique={chat} type={'user'} />
                <p id="user-name">{chat.username}</p>
                {privateNotifications.includes(chat.id)&&<span><NotificationsIcon/></span>}
              </div>
            </NavLink>
          }
        </div>
      ))}
    </div>
  )
}

export default Information;