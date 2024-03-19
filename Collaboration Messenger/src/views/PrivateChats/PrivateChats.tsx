import './PrivateChats.css';
import Chat from "../../components/chat/Chat";
import Information from "../Information/Information";
import { useParams } from 'react-router-dom';
import UserSearch from '../../components/Search/UserSearch';
import { useEffect, useState } from 'react';
// import Profile from '../Profile/Profile';
import UserProfile, { UserProfileData } from '../UserProfile/UserProfile';
import { useAppContext, useCallContext, useDyteContext } from '../../context/appContext';
import { equalTo, getDatabase, off, onValue, orderByChild, query, ref, remove, set, update } from 'firebase/database';
import { toast } from 'react-hot-toast';
import { createDytePrivateRoom, sendPrivateParticipantToken } from '../../service/video-audio-calls';
import { db } from '../../config/config-firebase';
import ImageComp from '../../components/imageComp/ImageComp';
import callSound from '../../../Audio/ringtone-126505.mp3';




const PrivateChats = () => {
    const { id } = useParams<{ id: string }>();
    const { userData } = useAppContext();
    const [userProfileData, setUserProfileData] = useState<UserProfileData | null>(null);
    const {setInCall}=useCallContext();
    const {initMeeting}=useDyteContext();
    const [callRequest, setCallRequest] = useState(false);

    const currentId = id?.split(userData.uid).join('');
    const callAudio = new Audio(callSound)

    useEffect(() => {
        (async () => {
            if (currentId) {
                const db = getDatabase();
                const dbRef = ref(db, "users");
                const q = await query(dbRef, orderByChild('uid'), equalTo(currentId));
                onValue(q, (snapshot) => {
                    if (snapshot.exists()) {
                        setUserProfileData(Object.keys(snapshot.val()).map((key) => snapshot.val()[key])[0]);
                    } else {
                        console.log("No data available");
                    }
                });
            }
        })()
    }, [id, userData])

    const sendCallRequest = async (calleeData: UserProfileData | null) => {

        if (calleeData?.status === 'busy') {
            toast.error('The user is busy!', {
                duration: 5000
            });
            return;
        }
  setCallRequest(true);
        callAudio.play()
        const toastID = toast((t) => (
            <div id='custom-toast'>
                <ImageComp unique={calleeData} type='user'></ImageComp>
                Calling... <b>{calleeData?.username}</b>
                <button onClick={() => {
                    remove(ref(db, `users/${calleeData?.username}/callNotification`))
                    toast.dismiss(t.id)
                    callAudio.pause()
                    callAudio.currentTime = 0;
                    setCallRequest(false);

                }}>
                    Cancel
                </button>
            </div>
        ), {
            duration: 20000
        })
        const roomId = id ? await createDytePrivateRoom(id) : null

        const calleeToken = await sendPrivateParticipantToken(roomId, calleeData)
        const callerToken = await sendPrivateParticipantToken(roomId, userData)
        update(ref(db, `users/${calleeData?.username}/callNotification`), { caller: userData, offer: calleeToken, status: 'pending' });
        const timeoutID = setTimeout(() => {
            remove(ref(db, `users/${calleeData?.username}/callNotification`));
            toast.dismiss(toastID)
            callAudio.pause()
            callAudio.currentTime = 0;
            setCallRequest(false);
          }, 20000);
          let declinedMessageShown = false;
        onValue(ref(db, `users/${calleeData?.username}/callNotification`), async (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.status === 'accepted') {
                    declinedMessageShown = true;
                   clearTimeout(timeoutID);
                   
                    await initMeeting({
                        authToken: callerToken,
                        defaults: {
                            audio: false,
                            video: false,
                        },
                    });
                    setInCall(true);
                    toast.dismiss(toastID)
                    callAudio.pause()
                    callAudio.currentTime = 0;
                    setCallRequest(false);
                }
                else if (data.status === 'declined' && !declinedMessageShown){
                    toast.dismiss(toastID)
                    toast.error('The user declined the call!', {
                        duration: 5000
                    });
                    callAudio.pause()
                    callAudio.currentTime = 0;
                    clearTimeout(timeoutID);
                    setCallRequest(false);
                    off(ref(db, `users/${calleeData?.username}/callNotification`));
                
                }
            }
           
        })

    }



    return (
        <>
            <div className='search-users'>

                <UserSearch />
            </div>
            <div className="inf">
                <Information />
            </div>

            <div className="chat-container">
                {!callRequest&&id&&<button onClick={() => { sendCallRequest(userProfileData) }} className="btn-profile">Profile</button>}
                <Chat type={'private'} />
            </div>
            <div className="user-profile">
                <UserProfile />

            </div>

        </>
    );
}
export default PrivateChats;