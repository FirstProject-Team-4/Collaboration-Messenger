import { useEffect, useState } from "react";
import { useAppContext } from "../../context/appContext";
import ImageComp from "../imageComp/ImageComp";
import { get, getDatabase, onValue, ref, remove} from "firebase/database";
import { NavLink } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './BlockList.css';

/**
 * Component for displaying a list of blocked users.
 */
const BlockList = () => {
    const { userData } = useAppContext();
    const [blockUsers, setBlockUsers] = useState<any>([]);

    /**
     * Fetches the list of blocked users from the database.
     */
    useEffect(() => {
        const db = getDatabase();
        const blockRef = ref(db, `users/${userData.username}/blockedUsers`);

        onValue(blockRef, async (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const blockUsers = await Promise.all(Object.keys(data).map(async (key) => {
                    const userRef = ref(db, `users/${key}`);
                    const snapshot = await get(userRef);
                    const userInfo = snapshot.val();
                    return {
                        id: key,
                        username: data[key],
                        ...userInfo
                    };
                }));

                setBlockUsers(blockUsers);
            } else {
                setBlockUsers([]);
            }
        });
    }, [userData]);

    console.log(blockUsers);

    /**
     * Handles unblocking a user.
     * @param id - The ID of the user to unblock.
     */
    const handleUnblock = (id: string) => {
        const db = getDatabase();
        const blockUserRef = ref(db, `users/${userData.username}/blockedUsers/${id}`);
        remove(blockUserRef).then(() => {
            setBlockUsers(blockUsers.filter((user: any) => user.id !== id));
            toast.success('User unblocked successfully');
        });
    }

    return (
        <>
            <h3 className="title-friends-view">Block List</h3>
            <div className="card-container">
                {blockUsers && blockUsers.map((user: any, index: number) => (
                    <div key={index} className="card">
                        <div className="infos">
                            <div className="image">
                                <ImageComp className="image-friends" unique={user} type={'user'} />
                            </div>
                            <div className="info">
                                <NavLink className="name" to={`/profile/${user.username}`}>{user.username}</NavLink>
                            </div>
                        </div>
                        <button className="request" onClick={() => handleUnblock(user.id)}>Unblock</button>
                    </div>
                ))}
            </div>
        </>
    );
}
export default BlockList;

