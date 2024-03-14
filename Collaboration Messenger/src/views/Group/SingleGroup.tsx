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
import { createGroupOffer, stunConfig } from '../../service/video-audio-calls';

export default function SingleGroup() {
    const [open, setOpen] = useState(false);
    const [groupMembers, setGroupMembers] = useState<MembersProps[]>([]);
    const [currentGroup, setCurrentGroup] = useState<Group>({} as Group);
    const [remoteStream, setRemoteStream] = useState<{ stream: MediaStream, username: string }[]>([]);
    const [offers, setOffers] = useState<any[]>([]);
    const [isCallStarted, setIsCallStarted] = useState(false);
    const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<RTCPeerConnection[]>([]);
    // const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const { userData } = useAppContext();
    // const [joinGroupCall, setJoinGroupCall] = useState(false);

    const nav = useNavigate();
    const { id } = useParams();
    useEffect(() => {
        if (id) {
            getGroupByID(id).then((group) => {
                console.log(group);
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
        if (userData) {
                    onValue(ref(db, `GroupCalls/${id}/offers`), snapshot => {
                        if (!snapshot.exists()) {
                           return;
                        }
                        const data = snapshot.val();
                        console.log(data);
                        const offer=Object.keys(data).filter(key=>key!==userData.username).map(key=>data[key]);
                        

                         console.log(offer);
                       offer.forEach(async (offer:any)=>{
                        
                        setOffers([...offers,offer]);
                           console.log(offers);
                        });
                    });
                }
            }, [userData, id]);

    const leaveGroup = () => {
        removeGroupMember(currentGroup.id, userData.username);
    }
   




    const startGroupVideoCall = async () => {
        try {
            setIsCallStarted(true);
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream;
            }
    
            // Use for...of instead of forEach
            for (const member of groupMembers) {
                const peerConnection = new RTCPeerConnection(stunConfig);
                peerConnections.current.push(peerConnection);
                localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    
                peerConnection.onicecandidate = async (event) => {
                    if (event.candidate) {
                        const candidate = event.candidate.toJSON();
                        const iceCandidateRef = ref(db, `GroupCalls/${id}/iceCandidates/${member.username}`);
                        await update(iceCandidateRef, {
                            target: member.username,
                            candidate: candidate,
                        });
                    }
                };
    
                onValue(ref(db, `GroupCalls/answers/${userData?.username}`), async snapshot => {
                    console.log('answer event called');
                    const data = snapshot.val();
                    if (data && data.caller === member.username) {
                        const answer = new RTCSessionDescription(data.answer);
                        await peerConnection.setRemoteDescription(answer);
                    }
                });
    
                peerConnection.ontrack = (event) => {
                    setRemoteStream(prevStreams => {
                        if (!prevStreams.some(existingStream => existingStream.username === member.username)) {
                            return [...prevStreams, { stream: event.streams[0], username: member.username }];
                        } else {
                            return prevStreams;
                        }
                    });
                };
    
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                const offerRef = ref(db, `GroupCalls/${id}/offers/${member.username}`);
                await update(offerRef, {
                    target: member.username,
                    caller: userData?.username,
                    offer: {
                        type: offer.type,
                        sdp: offer.sdp
                    }
                });
            }
        } catch (e) {
            console.log(e);
        }
    }
  

    const answerCall = async (offer: any) => {
        setIsCallStarted(true);
        console.log(offer);
    
        const peerConnection = new RTCPeerConnection(stunConfig);
    
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    
        // Set up event handlers before calling setRemoteDescription and createAnswer
        peerConnection.ontrack = (event) => {
            console.log('ontrack event called');
            console.log(event);
            setRemoteStream(prevStreams => [...prevStreams, { stream: event.streams[0], username: userData?.username }]);
        };
        peerConnection.onicecandidate = async (event) => {
            if (event.candidate) {
                const candidate = event.candidate.toJSON();
                const iceCandidateRef = ref(db, `GroupCalls/${id}/iceCandidates/${offer.caller}`);
                await update(iceCandidateRef, {
                    target: offer.caller,
                    candidate: candidate,
                });
            }
        };
    
        // Now call setRemoteDescription and createAnswer
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer.offer));
    
        // Listen for new ICE candidates and add them to the peer connection
        onValue(ref(db, `GroupCalls/${id}/iceCandidates/${offer.caller}`), async snapshot => {
            const data = snapshot.val();
            console.log(data);
            if (data && data.target === offer.caller) {
                console.log('ice candidate event called');
                const candidate = new RTCIceCandidate(data.candidate);
                await peerConnection.addIceCandidate(candidate);
            }
        });
    
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
    
        const answerRef = ref(db, `GroupCalls/${id}/answers/${offer.caller}`);
        await set(answerRef, {
            caller: userData?.username,
            answer: {
                type: answer.type,
                sdp: answer.sdp
            }
        });
    }
    

    
    
      


    const handleEndCall = () => {
        setRemoteStream([]);
        setIsCallStarted(false);
    
        (localVideoRef.current?.srcObject as MediaStream)?.getTracks().forEach(track => track.stop());
    
        // Close the peer connections
        peerConnections.current.forEach(connection => connection.close());
    
        // Clear the peer connections
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
                            if (offers.length===0) {
                                startGroupVideoCall();
                            }
                            else {
                                offers.forEach(offer => {
                                    answerCall(offer);
                                });
                            }

                        }}>VideoCall</button>
                    </div>

                    {isCallStarted && <video ref={localVideoRef} id="localVideo" autoPlay  playsInline style={{ height: '300px',border:'2px solid red', width: '300px', zIndex: 0 }} ></video>}
                    {isCallStarted && remoteStream.map((element, index) => (
                        <video key={index} style={{ height: '300px',border:'2px solid red', width: '300px', zIndex: 0 }} autoPlay playsInline ref={video => video ? video.srcObject = element.stream : null}></video>
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
