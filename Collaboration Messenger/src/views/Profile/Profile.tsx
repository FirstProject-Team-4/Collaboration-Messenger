import React, { useEffect, useState } from 'react';
import { useAppContext } from "../../context/appContext";
import { saveImage } from "../../service/storage";
import { ref, update } from "firebase/database";
import { db } from "../../config/config-firebase";
import './Profile.css';


/**
 * Renders the user profile page.
 * 
 * @returns {JSX.Element} The rendered user profile page.
 */
const Profile = () => {
    // const { id } = useParams<{ id: string }>();
    const { userData } = useAppContext();
    const [showEdit, setShowEdit] = useState(false);
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [image, setImage] = useState<string>('');
    const [errorMessage] = useState('');

useEffect(() => {
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setImage(userData.image);
}, [userData]);


    /**
     * Handles the image change event.
     * 
     * @param e - The change event triggered by the input element.
     * @returns {Promise<void>} - A promise that resolves when the image is saved and updated.
     */
    const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const imgUrl = await saveImage(file);
            imgUrl && setImage(imgUrl);
            update(ref(db, `users/${userData.username}/`), { image: imgUrl });
        }
    };

  
    /**
     * Handles the form submission by updating the user's first name and last name in the database.
     */
    const handleSubmit = () => {
        update(ref(db, `users/${userData.username}/`), { firstName: firstName, lastName: lastName });
    };

    /**
     * Loads the user profile data and updates the state variables.
     */
    const loadUserProfile = () => {
        setFirstName(userData?.firstName || ''); 
        setLastName(userData?.lastName || ''); 
        setImage(userData?.image || '');
        setShowEdit(!showEdit);
    }

    return (
        <div>
            <h1 className='profile'>Profile</h1>
            <div className="profile-container">
                <div className="profile-img">
                    {userData && userData.image && <img src={image} alt="Profile" />}
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