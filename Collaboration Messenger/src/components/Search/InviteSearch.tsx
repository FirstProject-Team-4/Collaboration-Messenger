import { useEffect, useState } from "react";
import { getAllUsers } from "../../service/user";
import Button from "../button/Button";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { commbineId } from "../../service/friends";
import { useAppContext } from "../../context/appContext";
import { get, ref, set, update } from "firebase/database";
import { db } from "../../config/config-firebase";
import './UserSearch.css';
import { inviteToGroup } from "../../service/group";



const InviteSearch = () => {
    const { id } = useParams();
    const { userData } = useAppContext();
    const [users, setUsers] = useState([] as any);
    const [search, setSearch] = useState('');
    const navigate = useNavigate(); // Get the navigate function
    const [invited, setInvited] = useState<{[key:string]:boolean}>({});
    const [groupMembers, setGroupMembers] = useState<any>([]);
    useEffect(() => {
        if (id) {
            get(ref(db, `groups/${id}/members`)).then((snapshot) => {
                if (snapshot.exists()) {
                    setGroupMembers(Object.keys(snapshot.val()));
                }
            });
        }
    }, [id])


console.log(groupMembers);
    const searchUser = async () => {
        if (search === '') {
            return;
        }
        const allUsers = await getAllUsers();
        const filtered=allUsers.filter((user: any) => {
            return user.username.toLowerCase().includes(search.toLowerCase())&&user.username!==userData.username&&!groupMembers.includes(user.username);
        });
        setUsers(filtered);
           
        }
       
       
        
    

    const handleInvite = async (user: { uid: string, username: string }) => {
        if (id) {
            inviteToGroup(id, user.username);
            setInvited({...invited,[user.username]:true});
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
                                <NavLink to={`/profile/${user.username}`}>{user.username}</NavLink>
                                {invited[user.username]?'Invited': <Button onClick={() => handleInvite(user)}>Invite</Button>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
export default InviteSearch;