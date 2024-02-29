import { useEffect, useState } from 'react';
import { friendRequests, acceptFriendRequest, rejectFriendRequest } from '../../service/friends';

interface Request {
    id: string;
    fromUser: string;
}

interface User {
    username: string;
    uid: string;
}

interface FriendsRequestProps {
    username: string | any;
    requests: any;
    friendUser: User | any;
}

export default function FriendsRequest({ username, friendUser }: FriendsRequestProps) {
    const [requests, setRequests] = useState<Request[]>([]);

    useEffect(() => {
        friendRequests(username).then(setRequests);
    }, [username]);

    const handleAccept = (requestId: any) => {
        acceptFriendRequest(requestId, friendUser);
        // Remove this request from state
        setRequests(requests.filter(request => request.id !== requestId));
    };

    const handleReject = (requestId: any) => {
        rejectFriendRequest(requestId, friendUser);
        // Remove this request from state
        setRequests(requests.filter(request => request.id !== requestId));
    };

    return (
        <div>
            {requests.map(request => (
                <div key={request.id}>
                    <p>{request.fromUser}</p>
                    <button onClick={() => handleAccept(request.id)}>Accept</button>
                    <button onClick={() => handleReject(request.id)}>Reject</button>
                </div>
            ))}
        </div>
    );
}