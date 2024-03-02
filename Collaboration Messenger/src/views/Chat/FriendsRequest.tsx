import { useEffect, useState } from 'react';
import { friendRequests, acceptFriendRequest, rejectFriendRequest } from '../../service/friends';
import { useAppContext } from '../../context/appContext';
import { onValue, ref } from 'firebase/database';
import { db } from '../../config/config-firebase';
import { NavLink } from 'react-router-dom';
import ImageComp from '../../components/imageComp/ImageComp';

interface Request {
    id: string;
   uid: string;
   username: string;
}

interface User {
    username: string;
    uid: string;
}

interface FriendsRequestProps {
    username: string | any;
    friendUser: User | any;

}

export default function FriendsRequest() {
    const [requests, setRequests] = useState<Request[]>([]);
const {userData} = useAppContext();


    useEffect(() => {
       onValue(ref(db, `users/${userData?.username}/friendsRequest`), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const requests = Object.keys(data).map((key) => ({
                    id: key,
                   uid: data[key].uid,
                   username: data[key].username
                }));
                setRequests(requests);
            }
        });
    }, [userData]);

    const handleAccept = (friendUser:any) => {
        acceptFriendRequest(userData, friendUser);
    };

    const handleReject = (friendUser: any) => {
        rejectFriendRequest(userData, friendUser);
    };
console.log('FriendsRequest');

    return (
        <div>
            {requests.map(request => (
                <div key={request.id}>
                    <ImageComp unique={request.username} type={'user'} />
                    <NavLink to={`/profile/${request.username}`} >{request.username}</NavLink>
                    <button onClick={() => handleAccept(request)}>Accept</button>
                    <button onClick={() => handleReject(request)}>Reject</button>
                </div>
            ))}
        </div>
    );
}