import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDatabase, ref, query, orderByChild, equalTo, onValue, set } from "firebase/database";
import { useAppContext } from '../../context/appContext';
import './UserProfile.css';
import ImageComp from '../../components/imageComp/ImageComp';
import Button from '../../components/button/Button';


export type UserProfileData = {

  username: string;
  email: string;
  createdOn?: number;
  groups?: Record<string, unknown>;
  image?: string;
  status?: string;
  firstName?: string;
  lastName?: string;
  uid?: string;
  isBlock?: boolean;
  blockedUsers?: any
  friendsRequest?: Record<string, unknown>;
};

/**
 * Represents the user profile component.
 */
const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { userData } = useAppContext();
  const [myBlockList, setMyBlockList] = useState<string[]>([]);
  const [userProfileData, setUserProfileData] = useState<UserProfileData | null>(null);

  const currentId = id?.split(userData.uid).join('');

  useEffect(() => {
    if (currentId) {
      const db = getDatabase();
      const dbRef = ref(db, "users");
      const q = query(dbRef, orderByChild('uid'), equalTo(currentId));

      onValue(q, (snapshot) => {
        if (snapshot.exists()) {
          setUserProfileData(Object.keys(snapshot.val()).map((key) => snapshot.val()[key])[0]);
        } else {
          console.log("No data available");
        }
      });

      onValue(ref(db, `users/${userData.username}/blockedUsers`), (snapshot) => {
        if (snapshot.exists()) {
          setMyBlockList(Object.keys(snapshot.val()));
        } else {
          setMyBlockList([]);
        }
      });
    } else {
      setUserProfileData(null);
    }
  }, [currentId]);



  const handleBlockUser = () => {
    if (userProfileData) {
      const db = getDatabase();
      const blockUserRef = ref(db, `users/${userData.username}/blockedUsers/${userProfileData.username}`);
      if (myBlockList.includes(userProfileData.username)) {
        //  unblock the user
        set(blockUserRef, null);
      } else {
        set(blockUserRef, true);
      }
    }
  };
  const toggleBlock = () => {
    if (userProfileData?.username && myBlockList.includes(userProfileData?.username)) {
      return 'Unblock';
    }
    return 'Block';
  };
  console.log(myBlockList);



  return (
    <div>
      {userProfileData && (
        <div>
          <h1>Profile</h1>
          <div className='profile-container'>
            <div className='profile-user-img'>
              <ImageComp unique={userProfileData} type={'user'} />
            </div>
            <h2>{userProfileData.username}</h2>
            <Button onClick={() => { handleBlockUser(); }}>{toggleBlock()}</Button>


            <p>{userProfileData?.firstName ? userProfileData.firstName : ''}</p>
            <p>{userProfileData?.lastName ? userProfileData.lastName : ''}</p>
            <p>Email: {userProfileData.email}</p>
            <p>Joined on: {new Date(userProfileData?.createdOn || 0).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;