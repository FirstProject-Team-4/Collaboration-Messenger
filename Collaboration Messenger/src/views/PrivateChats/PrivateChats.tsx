import './PrivateChats.css';
import Chat from "../../components/chat/Chat";
import Information from "../Information/Information";
import { useParams } from 'react-router-dom';
import UserSearch from '../../components/Search/UserSearch';
import { useEffect, useState } from 'react';
import CallIcon from '@mui/icons-material/Call';
import UserProfile, { UserProfileData } from '../UserProfile/UserProfile';
import { useAppContext, useCallContext, useDyteContext } from '../../context/appContext';
import { equalTo, getDatabase, off, onValue, orderByChild, query, ref, remove, update } from 'firebase/database';
import { toast } from 'react-hot-toast';
import { createDytePrivateRoom, sendPrivateParticipantToken } from '../../service/video-audio-calls';
import { db } from '../../config/config-firebase';
import callSound from '../../../Audio/ringtone-126505.mp3';


/**
 * Represents the PrivateChats component.
 * This component displays private chats and allows users to send call requests to other users.
 */
const PrivateChats = () => {
    const { id } = useParams<{ id: string }>();
    const { userData } = useAppContext();
    const [userProfileData, setUserProfileData] = useState<UserProfileData | null>(null);
    const {inCall,setInCall}=useCallContext();
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

    /**
     * Sends a call request to a user.
     * @param calleeData - The user profile data of the callee.
     */
    const sendCallRequest = async (calleeData: UserProfileData | null) => {
        const blockedUsers = userProfileData?.blockedUsers ? Object.keys(userProfileData?.blockedUsers) : [];

        // Check if the callee has blocked the user
        if (blockedUsers.includes(userData?.username)) {
            toast.error('The user blocked you!...sad face', {
                duration: 5000
            });
            return;
        }

        // Check if the callee is busy
        if (calleeData?.status === 'busy') {
            toast.error('The user is busy!', {
                duration: 5000
            });
            return;
        }

        // Check if the user is already in a call
        if (inCall) {
            toast.error('You are busy!', {
                duration: 5000
            });
            return;
        }

        setCallRequest(true);
        callAudio.play();

        // Display a custom toast with the call information
        const toastID = toast((t) => (
            <div id='custom-toast'>
                <div>Calling...</div> <b>{calleeData?.username}</b>
                <button onClick={() => {
                    remove(ref(db, `users/${calleeData?.username}/callNotification`));
                    toast.dismiss(t.id);
                    callAudio.pause();
                    callAudio.currentTime = 0;
                    setCallRequest(false);
                }}>
                    Cancel
                </button>
            </div>
        ), {
            duration: 20000
        });

        // Create a private room and get the room ID
        const roomId = id ? await createDytePrivateRoom(id) : null;

        // Send participant tokens to the callee and the caller
        const calleeToken = await sendPrivateParticipantToken(roomId, calleeData);
        const callerToken = await sendPrivateParticipantToken(roomId, userData);

        // Update the callee's call notification with the caller's information
        update(ref(db, `users/${calleeData?.username}/callNotification`), { caller: userData, offer: calleeToken, status: 'pending' });

        // Set a timeout to cancel the call if it's not accepted within 20 seconds
        const timeoutID = setTimeout(() => {
            remove(ref(db, `users/${calleeData?.username}/callNotification`));
            toast.dismiss(toastID);
            callAudio.pause();
            callAudio.currentTime = 0;
            setCallRequest(false);
        }, 20000);

        let declinedMessageShown = false;

        // Listen for changes in the callee's call notification
        onValue(ref(db, `users/${calleeData?.username}/callNotification`), async (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();

                // If the call is accepted, initialize the meeting and set the user in call
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
                    toast.dismiss(toastID);
                    callAudio.pause();
                    callAudio.currentTime = 0;
                    setCallRequest(false);
                }
                // If the call is declined, show an error message and cancel the call
                else if (data.status === 'declined' && !declinedMessageShown) {
                    toast.dismiss(toastID);
                    toast.error('The user declined the call!', {
                        duration: 5000
                    });
                    callAudio.pause();
                    callAudio.currentTime = 0;
                    clearTimeout(timeoutID);
                    setCallRequest(false);
                    off(ref(db, `users/${calleeData?.username}/callNotification`));
                }
            }
        });
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
                {!callRequest&&id&&<button onClick={() => { sendCallRequest(userProfileData) }} className="btn-profile"><CallIcon/></button>}
                <Chat type={'private'} />
            </div>
            <div className="user-profile">
                <UserProfile />

            </div>

        </>
    );
}
export default PrivateChats;