import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { NavLink } from "react-router-dom";
import ImageComp from "../../components/imageComp/ImageComp";
import { useAppContext } from "../../context/appContext";
import './Information.css';

interface Chat {
  uid: string;
  id: string;
  username: string;
}

const Information: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
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


  return (
    <div className="column-inf">
      <h3 >Messages</h3>


      {chats.map((chat) => (
        <div key={chat.id}>
          {userData?.username !== chat.username &&
            <NavLink to={`/privateChats/${chat.id}`}>
              <div className="chat-user">
                <ImageComp className={'image-inf-message'} unique={chat.username} type={'user'} />
                <p id="user-name">{chat.username}</p>
              </div>
            </NavLink>
          }
        </div>
      ))}
    </div>
  )
}

export default Information;