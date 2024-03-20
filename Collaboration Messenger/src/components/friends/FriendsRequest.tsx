import { useEffect, useState } from 'react';
import { acceptFriendRequest, rejectFriendRequest } from '../../service/friends';
import { useAppContext } from '../../context/appContext';
import { onChildRemoved, onValue, ref } from 'firebase/database';
import { db } from '../../config/config-firebase';
import { NavLink } from 'react-router-dom';
import ImageComp from '../imageComp/ImageComp';
import './FriendsList.css';

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

/**
 * Renders a component that displays friend requests.
 */
export default function FriendsRequest() {
    // State to store the friend requests
    const [requests, setRequests] = useState<Request[]>([]);
    // Access the user data from the app context
    const { userData } = useAppContext();

    useEffect(() => {
        // Listen for changes in the friend requests
        onValue(ref(db, `users/${userData?.username}/friendsRequest`), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Convert the data into an array of requests
                const requests = Object.keys(data).map((key) => ({
                    id: key,
                    uid: data[key].uid,
                    username: data[key].username
                }));
                setRequests(requests);
            } else {
                setRequests([]);
            }
        });

        // Listen for removed friend requests
        onChildRemoved(ref(db, `users/${userData?.username}/friendsRequest`), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Convert the data into an array of requests
                const requests = Object.keys(data).map((key) => ({
                    id: key,
                    uid: data[key].uid,
                    username: data[key].username
                }));
                setRequests(requests);
            } else {
                setRequests([]);
            }
        });
    }, [userData]);

    /**
     * Handles accepting a friend request.
     * @param friendUser - The friend user object.
     */
    const handleAccept = (friendUser: any) => {
        acceptFriendRequest(userData, friendUser);
    };

    /**
     * Handles rejecting a friend request.
     * @param friendUser - The friend user object.
     */
    const handleReject = (friendUser: any) => {
        rejectFriendRequest(userData, friendUser);
    };


    return (
        <>
            <h4 className="title-friends-view">Friend Requests</h4>
            <div className="card-container">
                {requests.map(request => (
                    <div key={request.id} className="card">
                        <div className="infos">
                            <div className="image">
                                <ImageComp className="image-friends" unique={request} type={'user'} />
                            </div>
                            <div className="info">
                                <NavLink className="name" to={`/profile/${request.username}`}>{request.username}</NavLink>
                            </div>
                        </div>
                        <button className="request" onClick={() => handleAccept(request)}>Accept</button>
                        <button className="request" onClick={() => handleReject(request)}>Reject</button>
                    </div>
                ))}
            </div>
        </>
    );
}