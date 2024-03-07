import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDatabase, ref, query, orderByChild, equalTo, onValue } from "firebase/database";
import { useAppContext } from '../../context/appContext';
import './UserProfile.css';
import ImageComp from '../../components/imageComp/ImageComp';

type UserProfileData = {
    [key: string]: {
        username: string;
        email: string;
        createdOn?: number;
        groups?: Record<string, unknown>;
        image?: string;
        status?: string;
        firstName?: string;
        lastName?: string;
        uid?: string;
    };
};

const UserProfile = () => {
    const { id } = useParams<{ id: string }>();
    const { userData } = useAppContext();
    const currentId = id?.split(userData.uid).join('');
    console.log(currentId); //get id of the user

    const [userProfileData, setUserProfileData] = useState<UserProfileData | null>(null);
    useEffect(() => {
        if (currentId) {
            const db = getDatabase();
            const dbRef = ref(db, "users");
            const q = query(dbRef, orderByChild('uid'), equalTo(currentId));

            onValue(q, (snapshot) => {
                if (snapshot.exists()) {
                    setUserProfileData(snapshot.val());
                } else {
                    console.log("No data available");
                }
            });
        } else {
            setUserProfileData(null);
        }
    }, [currentId]);
    console.log(currentId);

    console.log(userProfileData);


    return (
        <div>
            <h1>User Profile</h1>
            {userProfileData && Object.keys(userProfileData).map((key) => {
                const user = userProfileData[key];
                return (
                    <div key={key}>
                        <ImageComp unique={user.username} type={'user'} />
                        {/* <button onClick={()=>()}>Block</button> */}
                        <h2>{user.username}</h2>
                        <p>Email: {user.email}</p>
                        <p>Joined on: {new Date(userData?.createdOn).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                        <p>{user?.firstName ? user.firstName : ''} </p>
                        <p>{user?.lastName ? user.lastName : '' }</p>
                    </div>
                );
            })
            }
        </div>
    );
}

export default UserProfile;