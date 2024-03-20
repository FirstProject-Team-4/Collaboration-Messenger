import { useEffect, useState } from "react";
import { getAllUsers } from "../../service/user";
import Button from "../button/Button";
import { NavLink, useNavigate } from "react-router-dom";
import { commbineId } from "../../service/friends";
import { useAppContext } from "../../context/appContext";
import { get, getDatabase, ref, update } from "firebase/database";
import { db } from "../../config/config-firebase";
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import './UserSearch.css';


interface UserSearchProps {
    type?: string;
}
/**
 * UserSearch component for searching and interacting with users.
 * 
 * @param type - The type of search (default: 'Search').
 */
const UserSearch = ({ type = 'Search' }: UserSearchProps) => {
  const { userData} = useAppContext();
  const [users, setUsers] = useState<any>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);



  const navigate = useNavigate();

  console.log('UserSearch');

  useEffect(() => {
    if (search !== '') {
      searchUser();
    }
  }, [search]);

  const handleSearch = (value: string) => {
    setSearch(value);

    if (value !== '') {
      searchUser();
    } else {
      setUsers([]);
    }
  };

  const searchUser = async () => {
    const snapshot = await getAllUsers();
    const filtered = snapshot.filter((user: any) => {
      return user.username && user.username.includes(search);
    });
    setUsers(filtered);
  };

  const handleChat = async (user: { uid: string, username: string }) => {
    const chatId = commbineId(userData.uid, user.uid);
    console.log(chatId);
    console.log(user, userData);
    const snapshot = await get(ref(db, `/chats/${chatId}`));
    if ((snapshot).exists()) {
      navigate(`/privateChats/${chatId}`);
      console.log('chat exists');
    } else {
      update(ref(db, `/chats/${chatId}`), { user1: { username: user.username, uid: user.uid }, user2: { username: userData.username, uid: userData.uid } });
      update(ref(db, `/users/${userData.username}/privateChats/${chatId}`), { username: user.username, uid: user.uid });
      update(ref(db, `/users/${user.username}/privateChats/${chatId}`), { username: userData.username, uid: userData.uid });
    }
    setSearch('');
    setUsers([]);

  };


  const handleAddFriend = async (user: { username: string, uid: string }) => {
    const db = getDatabase();
    const friendRequestRef = ref(db, `/users/${user.username}/friendsRequest/${userData.username}`);
    const newRequest = {
      username: userData.username,
      uid: userData.uid,
    };
    await update(friendRequestRef, newRequest);
  };


  return (

    <div>
      {<Button
        onClick={() => setIsModalOpen(true)}
        id='btn-search'
        className="bg-gradient-to-r from-purple-600 via-purple-400 to-blue-500 text-white px-4 py-2 font-bold rounded-md hover:opacity-80"
      >
        <PersonSearchIcon fontSize="small" />
        {type}
      </Button>}

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">

            <button className="close-search-btn" onClick={() => setIsModalOpen(false)}>  <HighlightOffIcon /> </button>
            <input type="text" value={search} className="search" placeholder="Search by Username..." onChange={e => handleSearch(e.target.value)} />
            <Button
              onClick={searchUser}
              className="bg-gradient-to-r from-purple-600 via-purple-400 to-blue-500 text-white px-4 py-2 font-bold rounded-md hover:opacity-80"
            >Search</Button>
            <div className="inf">
              {users.map((user: any) => {

                const isAlreadyFriend = userData?.friends ? Object.keys(userData?.friends)?.includes(user.username) : false;
                const isAlreadyRequested = user?.friendsRequest ? Object.keys(user.friendsRequest)?.includes(userData?.username) : false;

                return (
                  <div className="border-users" key={user.uid}>
                    <div className="information">
                      <NavLink className='user-profile-btn' to={`/profile/${user.username}`}>{user.username}</NavLink>
                      <Button className="chat-search-btn" onClick={() => handleChat(user)}><QuestionAnswerIcon /></Button>

                      {userData?.username !== user?.username && !isAlreadyFriend && !isAlreadyRequested && <Button className='search-modal-btn' onClick={() => handleAddFriend(user)}>Add Friend</Button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>);
};
export default UserSearch;