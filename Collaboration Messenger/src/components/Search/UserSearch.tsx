import { useEffect, useState } from "react";
import { getAllUsers } from "../../service/user";
import Button from "../Button";
import { NavLink, useNavigate } from "react-router-dom";
import { commbineId } from "../../service/friends";
import { useAppContext } from "../../context/appContext";
import { get, ref, update } from "firebase/database";
import { db } from "../../config/config-firebase";


const UserSearch = () => {
    const { userData } = useAppContext();
    const [users, setUsers] = useState([] as any);
    const [search, setSearch] = useState('');
    const navigate = useNavigate(); // Get the navigate function

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
            return (user.username.includes(search))
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

    }

    return (
        <div>
            <input type="text" value={search} className="search" placeholder="Search by Username..." onChange={e => handleSearch(e.target.value)} />
            <Button onClick={searchUser} id='btn-search'>Search</Button>
            <div className="inf">
                {users.map((user: any) => {
                    return (
                        <div className="border-users" key={user.uid}>
                            <div className="information">
                                <NavLink to={`/profile/${user.username}`}>{user.username}</NavLink>
                                <Button onClick={() => handleChat(user)}>Chat</Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
export default UserSearch;