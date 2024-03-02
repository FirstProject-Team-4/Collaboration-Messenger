import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "../../config/config-firebase";
import { useAppContext } from "../../context/appContext";
import FriendsRequest from "./FriendsRequest";
import FriendsList from "./FriendsList";

export default function Friends() {
    const { userData } = useAppContext();
    const [requests, setRequests] = useState<any>({});
console.log('Friends');

    useEffect(() => {
        if (userData?.friendsRequest) {
            setRequests(userData.friendsRequest);
        }
        const friendsRequestRef = ref(db, `users/${userData?.username}/friendsRequest`);
        const unsubscribe = onValue(friendsRequestRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log(data);
                setRequests(data);
            }
        });
        return () => {
            unsubscribe();
        };
    }, [userData]);
    console.log('Friends');

    return (
        <>
            {Object.keys(requests).length > 0 ? (
                <div className='friend-request-id'>
                    <FriendsRequest  />
                </div>
            ) : (
                <div className="no-friend">No requests</div>
            )}

            {userData?.friends ? (
                <div className='friends-container-id'>
                    <FriendsList friends={userData.friends} />
                </div>
            ) : (
                <div className="no-friend">No friends</div>
            )}
        </>
    );
}
