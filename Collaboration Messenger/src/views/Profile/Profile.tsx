import React, { useState } from 'react';
import { useAppContext } from "../../context/appContext";
import { saveImage } from "../../service/storage";
import { ref, update } from "firebase/database";
import { db } from "../../config/config-firebase";
// import { useParams } from 'react-router-dom'; 
import './Profile.css';


const Profile = () => {
    // const { id } = useParams<{ id: string }>();
    const {  userData, setContext } = useAppContext();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [showEdit, setShowEdit] = useState(false);
    const [errorMessage] = useState('');




    //for the image
    const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const imgUrl = await saveImage(file);
            update(ref(db, `users/${userData.username}`), { image: imgUrl });
            setContext({ ...userData, image: imgUrl });
        }
    };
    //for the first and last name (edit)
    const handleSubmit = () => {
        update(ref(db, `users/${userData.username}`), { firstName, lastName });
        setContext({ ...userData, firstName, lastName });
    };
    const loadUserProfile = () => {
        setFirstName(userData.firstName);
        setLastName(userData.lastName);

        setShowEdit(!showEdit);
    }

    return (
        <div>
            <h1>Profile</h1>
            <div className="profile-container">
                <div className="profile-img">
                    {userData && userData.image && <img src={userData.image} alt="Profile" />}
                </div>
                <input type="file" onChange={handleImage} />
                {userData && <button onClick={loadUserProfile} className="button-profile">Edit✎</button>}
            </div>
            {showEdit ? (
                <form onSubmit={handleSubmit}>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <label>
                        First Name:
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    </label><br></br>
                    <label>
                        Last Name:
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
                    </label><br></br><br></br>
                    <input type="submit" value="Submit" />
                </form>
            ) : null}

            <div>
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