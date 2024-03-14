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
    const [remoteStream, setRemoteStream] = useState<MediaStream[]>([]);
    const [offer, setOffer] = useState<any>();
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
            onValue(ref(db, `GroupCalls/${id}/offers/${userData.username}`), snapshot => {
                const data = snapshot.val();
                const offer = Object.values(data).filter((offer: any) => offer.target === userData.username) as { offer: any }[];

                if (offer.length > 0) {
                    console.log(offer[0].offer);
                    // setJoinGroupCall(true); // Set incomingCall to true when an offer is received
                }
            });
        }
    }, [userData, id]);

    const leaveGroup = () => {
        removeGroupMember(currentGroup.id, userData.username);
    }




    const startGroupVideoCall = async () => {
        try {
            setIsCallStarted(true);
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });// access the user media
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream;
                // setLocalStream(localStream);
                console.log(localStream);
            }

            groupMembers.forEach(async member => { // loop through the members of the group
                const peerConnection = new RTCPeerConnection(stunConfig); // create a new peer connection
                peerConnections.current.push(peerConnection);
                localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));// add the local stream to the peer connection
                console.log(localStream.getTracks());
                // Listen for ICE candidates
                onValue(ref(db, `GroupCalls/${id}/iceCandidates/${member.username}`), (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const candidates = Object.values(data);
                        candidates.forEach(async (candidate: any) => {
                            if (candidate.target === userData?.username) {
                                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate.candidate));
                            }
                        });
                    }
                });

                // Handle ICE candidate generation
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
                peerConnection.ontrack = (event) => {
                    setRemoteStream(prevStreams => [...prevStreams, event.streams[0]]);
                }
                onValue(ref(db, `GroupCalls/answers/${userData?.username}`), async snapshot => {
                    const data = snapshot.val();
                    if (data && data.caller === member.username) {
                        const answer = new RTCSessionDescription(data.answer);
                        await peerConnection.setRemoteDescription(answer);
                    }
                });



                const offerRef = ref(db, `GroupCalls/${id}/offers/${member.username}`);
                const offer = await peerConnection.createOffer()
                await peerConnection.setLocalDescription(offer);
                await push(offerRef, {
                    target: member.username,
                    caller: userData?.username,
                    offer: {
                        type: offer.type,
                        sdp: offer.sdp
                    }
                });

            });

        }
        catch (e) {
            console.log(e);
        }
    }
    const answerCall = async (offer: any) => {
        const peerConnection = new RTCPeerConnection(stunConfig);
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    
        // Set up event handlers before calling setRemoteDescription and createAnswer
        peerConnection.ontrack = (event) => {
            setRemoteStream(prevStreams => [...prevStreams, event.streams[0]]);
        };
        peerConnection.onicecandidate = async (event) => {
            if (event.candidate) {
                const candidate = event.candidate.toJSON();
                const iceCandidateRef = ref(db, `GroupCalls/${id}/iceCandidates/${offer.caller}`);
                await push(iceCandidateRef, {
                    target: offer.caller,
                    candidate: candidate,
                });
            }
        };
    
        // Now call setRemoteDescription and createAnswer
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer.offer));
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
    
        // Listen for offers after setting up the peer connection
        onValue(ref(db, `GroupCalls/${id}/offers/${userData?.username}`), async snapshot => {
            const data = snapshot.val();
            if (data) {
                setOffer(data.offer);
                setIsCallStarted(true);
            }
        });
    };


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
                            if (!isCallStarted) {
                                startGroupVideoCall();
                            }
                            else {
                                answerCall(offer)
                            }

                        }}>VideoCall</button>
                    </div>

                    {isCallStarted && <video ref={localVideoRef} id="localVideo" autoPlay  playsInline style={{ height: '300px', width: '300px', zIndex: 0 }} ></video>}
                    {isCallStarted && remoteStream.map((stream, index) => (
                        <video key={index} autoPlay playsInline ref={video => video ? video.srcObject = stream : null}></video>
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
