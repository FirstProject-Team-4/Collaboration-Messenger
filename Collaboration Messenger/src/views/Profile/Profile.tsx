import React, { useEffect, useState } from 'react';
import { useAppContext } from "../../context/appContext";
import { saveImage } from "../../service/storage";
import { ref, update } from "firebase/database";
import { db } from "../../config/config-firebase";
// import { useParams } from 'react-router-dom'; 
import './Profile.css';


const Profile = () => {
    // const { id } = useParams<{ id: string }>();
    const { userData } = useAppContext();
    const [showEdit, setShowEdit] = useState(false);
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [errorMessage] = useState('');

useEffect(() => {
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
}, [userData]);


    //for the image
    const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const imgUrl = await saveImage(file);
            update(ref(db, `users/${userData.username}/`), { image: imgUrl });
            // setContext({ ...userData, image: imgUrl });
        }
    };
    //for the first and last name (edit)
    const handleSubmit = () => {
        console.log('1');

        update(ref(db, `users/${userData.username}/`), { firstName: firstName, lastName: lastName });
        // setContext({ ...userData, firstName, lastName });
    };
    const loadUserProfile = () => {
        setFirstName(userData?.firstName || ''); 
        setLastName(userData?.lastName || ''); 
        setShowEdit(!showEdit);
      }

    return (
        <div>
            <h1 className='profile'>Profile</h1>
            <div className="profile-container">
                <div className="profile-img">
                    {userData && userData.image && <img src={userData.image} alt="Profile" />}
                </div>
                <div className="profile-edit">
                    <label htmlFor="file-input" className='file-input-label'>Upload Image</label>
                    <input type="file" id="file-input" className='file-input' onChange={handleImage} />
                    {userData && <button onClick={loadUserProfile} className="button-profile">Edit✎</button>}
                </div>
            </div>
            {showEdit ? (
                <form  className='edit-form-overlay'>
                    <div className='edit-form'>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <label>
                        First Name:
                        <input className='edit-info-input' type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    </label><br></br>
                    <label>
                        Last Name:
                        <input className='edit-info-input' type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
                    </label><br></br><br></br>
                    {userData && <button onClick={handleSubmit} className="button-profile">Submit</button>}
                  </div>
                </form>
            ) : null}

            <div className='info-profile'>
                <p>First Name: {userData?.firstName}</p>
                <p>Last Name: {userData?.lastName}</p>
                <p>Username: {userData?.username}</p>
                <p>Email: {userData?.email}</p>
                <p>Joined on: {new Date(userData?.createdOn).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
            </div>
        </div>
    );
}

export default Profile;