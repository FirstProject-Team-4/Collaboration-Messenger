import { useEffect, useState } from "react";
import { getAllUsers } from "../../service/user";
import Button from "../Button";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { commbineId } from "../../service/friends";
import { useAppContext } from "../../context/appContext";
import { get, ref, set, update } from "firebase/database";
import { db } from "../../config/config-firebase";
import './UserSearch.css';
import { inviteToGroup } from "../../service/group";
import ImageComp from "../imageComp/ImageComp";


const InviteSearch = ({ type = 'add' }: { type: string }) => {
    const { id } = useParams();
    const { userData } = useAppContext();
    const [users, setUsers] = useState([] as any);
    const [search, setSearch] = useState('');
    const navigate = useNavigate(); // Get the navigate function


console.log('UserSearch')
    const searchUser = async () => {
        if (search === '') {
            return;
        }
        const allUsers = await getAllUsers();
        const filtered=allUsers.filter((user: any) => {
            console.log(user);
            return user.username.toLowerCase().includes(search.toLowerCase());
        });
        setUsers(filtered);
           
        }
       
       
        
    

    const handleChat = async (user: { uid: string, username: string }) => {
        const chatId = commbineId(userData.uid, user.uid);
        console.log(chatId);
        console.log(user, userData)
        const snapshot = await get(ref(db, `/chats/${chatId}`));
        if ((snapshot).exists()) {
            navigate(`/privateChats/${chatId}`);
            console.log('chat exists')
        } else {
            console.log('chat does not exist');
            update(ref(db, `/chats/${chatId}`), { user1: { username: user.username, uid: user.uid }, user2: { username: userData.username, uid: userData.uid } });
        }
        setSearch('');
        setUsers([]);
    }
    const handleInvite = async (user: { uid: string, username: string }) => {
        
        console.log(id);
        console.log(user);
        if (id) {
            inviteToGroup(id, user.username);
        }
    }
    return (
        <div>
            <input type="text" value={search} className="search" placeholder="Search by Username..." onChange={e => setSearch(e.target.value)} />
            <Button onClick={searchUser} id='btn-search'>Search</Button>
            <div className="inf">
                {users.map((user: any) => {
                    return (
                        <div className="border-users" key={user.uid}>
                            <div className="information">
                                <ImageComp unique={user.username} type='user' />
                                <NavLink to={`/profile/${user.username}`}>{user.username}</NavLink>
                                {type === 'add' && <Button onClick={() => handleChat(user)}>Chat</Button>}
                                {type === 'invite' && <Button onClick={() => handleInvite(user)}>Invite</Button>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
export default InviteSearch;