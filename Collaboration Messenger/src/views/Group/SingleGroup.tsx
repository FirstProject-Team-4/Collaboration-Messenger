import { useEffect, useRef, useState } from 'react';
import Button from '../../components/button/Button';
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



    return (
        <>
            <div className="single-group-container">
                <div className="chat-container">
                   
                     

                    
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
