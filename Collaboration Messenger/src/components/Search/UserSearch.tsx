import { useEffect, useState } from "react";
import { getAllUsers } from "../../service/user";
import Button from "../Button";
import { NavLink, useNavigate } from "react-router-dom";
import { commbineId } from "../../service/friends";
import { useAppContext } from "../../context/appContext";
import { get, getDatabase, push, ref, set, update } from "firebase/database";
import { db } from "../../config/config-firebase";
import './UserSearch.css';


const UserSearch = () => {
    const { userData } = useAppContext();
    const [users, setUsers] = useState([] as any);
    const [search, setSearch] = useState('');
    const navigate = useNavigate(); 
    const [isModalOpen, setIsModalOpen] = useState(false);
console.log('UserSearch');

    useEffect(() => {
        if (search !== '') {
            searchUser();
        }
    }, [search])

    const handleSearch = (value: string) => {
        setSearch(value);
        if (value !== '') {
            searchUser();
        } else {
            setUsers([]);
        }
    }

    const searchUser = async () => {
        const snapshot = await getAllUsers();
        const filtered = snapshot.filter((user: any) => {
            return user.username && user.username.includes(search);
        })
        setUsers(filtered);
    }

    const handleChat = async (user: { uid: string, username: string}) => {
        const chatId = commbineId(userData.uid, user.uid);
        console.log(chatId);
        console.log(user, userData)
        const snapshot = await get(ref(db, `/chats/${chatId}`));
        if ((snapshot).exists()) {
            navigate(`/privateChats/${chatId}`);
            console.log('chat exists')
        } else {
            console.log('chat does not exist');
            update(ref(db, `/chats/${chatId}`), {user1:{username:user.username, uid:user.uid}, user2:{username:userData.username, uid:userData.uid} });
  
            
        }
        setSearch('');
        setUsers([]);

    }
    console.log('UserSearch');
  
   const handleAddFriend = async (user: { username: string, uid: string }) => {
       const db= getDatabase();
       const friendRequestRef=ref(db, `/users/${user.username}/friendsRequest/`);
       const newRequest = {
        username: userData.username,
        uid: userData.uid,
      };
      await push(friendRequestRef, newRequest);
}
    return (
        <div>
            <Button onClick={() => setIsModalOpen(true)} id='btn-search'>Open Search</Button>

            {isModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <button onClick={() => {console.log('Close button clicked'); setIsModalOpen(false);}}>Close</button>
                        <input type="text" value={search} className="search" placeholder="Search by Username..." onChange={e => handleSearch(e.target.value)} />
                        <Button onClick={searchUser}>Search</Button>
                        <div className="inf">
                            {users.map((user: any) => {
                                return (
                                    <div className="border-users" key={user.uid}>
                                        <div className="information">
                                            <NavLink to={`/profile/${user.username}`}>{user.username}</NavLink>
                                            <Button onClick={() => handleChat(user)}>Chat</Button>
                                          <Button onClick={() => handleAddFriend(user)}>Add Friend</Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        </div>
                </div>
            )}
        </div>)
}
export default UserSearch;