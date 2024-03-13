import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import InviteMembers from '../../components/group-components/InviteMembers';
import './Group.css';

import { useNavigate, useParams } from 'react-router-dom';
import GroupMembers, { MembersProps } from '../../components/group-components/GroupMembers';
import { get, onValue, push, ref } from 'firebase/database';
import { Group } from '../../components/group-components/JoinedGroup';
import { db } from '../../config/config-firebase';
import { getGroupByID, getGroupMembers, removeGroupMember } from '../../service/group';
import { useAppContext } from '../../context/appContext';
import Chat from '../../components/chat/Chat';
import { createGroupOffer, stunConfig } from '../../service/video-audio-calls';
import firebase from 'firebase/compat/app';
export default function SingleGroup() {
    const [open, setOpen] = useState(false);
    const [groupMembers, setGroupMembers] = useState<MembersProps[]>([]);
    const [currentGroup, setCurrentGroup] = useState<Group>({} as Group);
    const [remoteStream, setRemoteStream] = useState<MediaStream [] >([]);
    const [offer, setOffer] = useState<any>();
    const [isCallStarted, setIsCallStarted] = useState(false);
    const { userData } = useAppContext();
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

    const leaveGroup = () => {
        removeGroupMember(currentGroup.id, userData.username);
    }




    const startGroupVideoCall = async () => {
        try{
        const localStream = await navigator.mediaDevices.getUserMedia({video:true, audio: true });// access the user media
        
        
        groupMembers.forEach(async member => { // loop through the members of the group
            const peerConnection = new RTCPeerConnection(stunConfig); // create a new peer connection
    
            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));// add the local stream to the peer connection
     let iceCandidateQueue=[]
            // Listen for ICE candidates
            onValue(ref(db, `answers/${userData?.username}`), async snapshot => {
                const data = snapshot.val();
                if (data && data.caller === member.username) {
                    const answer = new RTCSessionDescription(data.answer);
                    await peerConnection.setRemoteDescription(answer);
                }
            });
    
            // Handle ICE candidate generation
            peerConnection.onicecandidate = async (event) => {
                if (event.candidate) {
                    const candidate = event.candidate.toJSON();
                    const iceCandidateRef = ref(db, 'iceCandidates');
                    await push(iceCandidateRef, {
                        target: member.username,
                        candidate: candidate,
                    });
                }
            };
            peerConnection.ontrack = (event) => {
                setRemoteStream(prevStreams => [...prevStreams, event.streams[0]]);   
            }
            onValue(ref(db, `answers/${userData?.username}`), async snapshot => {
                const data = snapshot.val();
                if (data && data.caller === member.username) {
                    const answer = new RTCSessionDescription(data.answer);
                    await peerConnection.setRemoteDescription(answer);
                }
            });

        
    
            const offerRef = ref(db, 'offers');
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
        setIsCallStarted(true);
    }
    catch(e){
        console.log(e);
    }
    }
    const answerCall = async (offer: any) => {
        const peerConnection = new RTCPeerConnection(stunConfig);
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
        peerConnection.ontrack = (event) => {
            setRemoteStream(prevStreams => [...prevStreams, event.streams[0]]);
        }
        onValue(ref(db, `offers/${userData?.username}`), async snapshot => {
            const data = snapshot.val();
            if (data) {
                setOffer(data.offer);
                setIsCallStarted(true);
            }
        });
        peerConnection.onicecandidate = async (event) => {
            if (event.candidate) {
                const candidate = event.candidate.toJSON();
                const iceCandidateRef = ref(db, 'iceCandidates');
                await push(iceCandidateRef,{
                    target: userData?.username,
                    candidate: candidate,
                });
            }
        };
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        const answerRef = ref(db, 'answers');
        await push(answerRef,{
            caller: offer.target,
            answer: {
                type: answer.type,
                sdp: answer.sdp
            }
        });
    }

    return (
        <>
            <div className="single-group-container">
                <div className="chat-container">
                    <button onClick={()=>{
                        if(!isCallStarted){
                            startGroupVideoCall();
                        }
                        else{
                            answerCall(offer)
                        }
                    }}>VideoCall</button>
                   {isCallStarted&& <video id="localVideo" autoPlay playsInline style={{height:'300px' , width:'300px'}} ></video>}
                    {isCallStarted&&remoteStream.map((stream, index) => (
                    <video key={index} autoPlay playsInline ref={video => video?video.srcObject = stream:null}></video>
                ))}
                    <Chat type={'group'} />
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