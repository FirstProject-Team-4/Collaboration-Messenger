import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { NavLink } from "react-router-dom";
import ImageComp from "../../components/imageComp/ImageComp";

interface Chat {
  id: string;
  user1: {
    username: string;
  };
}

const Information: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const db = getDatabase();
    const chatsRef = ref(db, 'chats');

    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : [];
      setChats(list);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="column-inf">
      <h3>Messages information </h3>
      <p>Choose with who to chat</p>
      {chats.map((chat, index) => (
        <div key={index}>

          <NavLink to={`/privateChats/${chat.id}`}>
            <div className="chat-user">
              <ImageComp unique={chat.user1.username} type={'user'} />
              <p>{chat.user1.username}</p>
            </div>
          </NavLink>
        </div>
      ))}
    </div>
  )
}

export default Information;