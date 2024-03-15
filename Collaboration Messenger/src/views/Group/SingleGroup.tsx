import { useEffect, useRef, useState } from 'react';
import Button from '../../components/Button';
import InviteMembers from '../../components/group-components/InviteMembers';
import './Group.css';

import { useNavigate, useParams } from 'react-router-dom';
import GroupMembers, { MembersProps } from '../../components/group-components/GroupMembers';
import { get, onValue, push, ref, set, update } from 'firebase/database';
import { Group } from '../../components/group-components/JoinedGroup';
import { db } from '../../config/config-firebase';
import { getGroupByID, getGroupMembers, removeGroupMember } from '../../service/group';
import { useAppContext } from '../../context/appContext';
import Chat from '../../components/chat/Chat';
import { connect, createLocalTracks } from 'twilio-video';

export default function SingleGroup() {
    const [open, setOpen] = useState(false);
    const [groupMembers, setGroupMembers] = useState<MembersProps[]>([]);
    const [currentGroup, setCurrentGroup] = useState<Group>({} as Group);
    const [remoteStream, setRemoteStream] = useState<{ }[]>([]);
    const [offers, setOffers] = useState<any[]>([]);
    const [localStream, setLocalStream] = useState<any>(null);
    const [isCallStarted, setIsCallStarted] = useState(false);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnections = useRef<RTCPeerConnection[]>([]);

    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const { userData } = useAppContext();
   

    const nav = useNavigate();
    const { id } = useParams();
    useEffect(() => {
        if (id) {
            getGroupByID(id).then((group) => {

                if (group) {
                    setCurrentGroup(group);
                }
                else {
                    nav('/*');
                }
            })
            onValue(ref(db, `groups/${id}/members`), () => {
                getGroupMembers(id).then((members) => {
                    setGroupMembers(members);
                })
            });
        }

    }, [id])
    useEffect(() => {
        onValue(ref(db, `GroupCalls/${id}/offers`), async snapshot => {
            const data = snapshot.val();
            if (data) {
                if (data.caller !== userData?.username) {
                    setOffers(prevOffers => [...prevOffers, data]);
                }
               
            }
        });
    }, [id, userData?.username]);

    
    const leaveGroup = () => {
        removeGroupMember(currentGroup.id, userData.username);
    }





    async function fetchAccessTokenFromYourServer(username:string, roomName:string) {
        const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5175';
        const response = await fetch(serverUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, roomName })
        });
    
        const data = await response.json();
        return data.token;
    }
    
    const startGroupVideoCall = async () => {
        try {
            setIsCallStarted(true);
    
            const localTracks = await createLocalTracks({ video: true, audio: true });
            setLocalStream(localTracks);
    if(id){
            const token = await fetchAccessTokenFromYourServer(userData?.username, id);
            update(ref(db, `GroupCalls/${id}/offers`), {
                token: token,
                caller: userData?.username
            });
                
    
            const room = await connect(token, {
                name: id,
                tracks: localTracks
            });
    
            room.on('participantConnected', participant => {
                console.log(`Participant "${participant.identity}" connected`);
    
                participant.on('trackSubscribed', track => {
                    setRemoteStream(prevStreams => [...prevStreams, { track: track, username: participant.identity }]);
                });
            });
    
            room.on('participantDisconnected', participant => {
                console.log(`Participant "${participant.identity}" disconnected`);
            });
        }
        } catch (e) {
            console.error(e);
        }
    }
    
    const answerCall = async (offer: any) => {
        setIsCallStarted(true);
    
        const localTracks = await createLocalTracks({ video: true, audio: true });
        setLocalStream(localTracks);
    
        // const token = await fetchAccessTokenFromYourServer(userData?.username, id);
    
        const room = await connect(offer.token, {
            name: id,
            tracks: localTracks
        });
    
        room.on('participantConnected', participant => {
            console.log(`Participant "${participant.identity}" connected`);
    
            participant.on('trackSubscribed', track => {
                setRemoteStream(prevStreams => [...prevStreams, { track: track, username: participant.identity }]);
            });
        });
    
        room.on('participantDisconnected', participant => {
            console.log(`Participant "${participant.identity}" disconnected`);
        });
    }


    const handleEndCall = () => {
        setRemoteStream([]);
        setIsCallStarted(false);

        localStream?.getTracks().forEach((track: { stop: () => any; }) => track.stop());

        peerConnections.current.forEach(connection => connection.close());
        peerConnections.current = [];
    };
    const startScreenSharing = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = screenStream;
                setIsScreenSharing(true);
            }
        } catch (e) {
            console.log(e);
        }
    };
    const stopScreenSharing = () => {
        if (localVideoRef.current) {
            const screenStream = localVideoRef.current.srcObject as MediaStream;
            screenStream.getTracks().forEach(track => track.stop());
            peerConnections.current.forEach(connection => connection.close());
            peerConnections.current = [];
            setIsScreenSharing(false);
        };
    }
    return (
        <>
            <div className="single-group-container">
                <div className="chat-container">
                    <div className='chat-header'>
                        <button onClick={() => { handleEndCall() }}>End Call</button>
                        <button onClick={isScreenSharing ? stopScreenSharing : startScreenSharing}>
                            {isScreenSharing ? 'Stop Sharing Screen' : 'Share Screen'}
                        </button>
                        <button onClick={() => {
                            if (offers.length === 0) {
                                console.log(remoteStream)
                                startGroupVideoCall();
                            }
                            else {
                                offers.forEach(offer => {
                                    answerCall(offer);
                                });
                            }

                        }}>VideoCall</button>
                    </div>

                    {isCallStarted && <video ref={localVideoRef} id="localVideo" autoPlay playsInline style={{ height: '300px', border: '2px solid red', width: '300px', zIndex: 0 }} ></video>}
                    {isCallStarted && remoteStream.map((element, index) => (
                        <video key={index} style={{ height: '300px', border: '2px solid red', width: '300px', zIndex: 0 }} autoPlay playsInline 
                           
                        ></video>
                    ))}
                    {!isCallStarted && <Chat type={'group'} />}
                </div>
                <div className="members-container">
                    <div className="members-buttons">
                        <h4>{`members ${groupMembers.length}`}</h4>
                        {currentGroup.owner === userData?.username && <Button onClick={() => setOpen(true)}>Invite </Button>}
                        {currentGroup.owner !== userData?.username && <Button onClick={leaveGroup}>Leave </Button>}
                        {open && <InviteMembers closeFn={setOpen} />}
                    </div>
                    <GroupMembers members={groupMembers} owner={currentGroup.owner} />
                </div>
            </div>
        </>
    )
}
