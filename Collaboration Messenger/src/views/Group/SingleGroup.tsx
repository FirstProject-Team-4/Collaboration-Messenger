import { useEffect, useState } from 'react';
import Button from '../../components/button/Button';
import InviteMembers from '../../components/group-components/InviteMembers';
import { useNavigate, useParams } from 'react-router-dom';
import GroupMembers, { MembersProps } from '../../components/group-components/GroupMembers';
import { onValue, ref } from 'firebase/database';
import { Group } from '../../components/group-components/JoinedGroup';
import { db } from '../../config/config-firebase';
import { getGroupByID, getGroupMembers, removeGroupMember } from '../../service/group';
import { useAppContext } from '../../context/appContext';
import Chat from '../../components/chat/Chat';
import { useDyteClient } from '@dytesdk/react-web-core';
import { DyteMeeting } from '@dytesdk/react-ui-kit';
import { createDyteRoom } from '../../service/video-audio-calls';
import CallIcon from '@mui/icons-material/Call';
import './Group.css';

export default function SingleGroup() {
    const [open, setOpen] = useState(false);
    const [isCallStarted, setIsCallStarted] = useState(false);
    const [groupMembers, setGroupMembers] = useState<MembersProps[]>([]);
    const [currentGroup, setCurrentGroup] = useState<Group>({} as Group);
    const { userData } = useAppContext();
    const [token, setToken] = useState<string>("");
    const [meeting, initMeeting] = useDyteClient();



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
        onValue(ref(db, `groups/${id}/members/${userData.username}/token`), (snapshot) => {
            if (snapshot.exists()) {
                setToken(snapshot.val().token);
                initMeeting({
                    authToken: snapshot.val().token,
                    defaults: {
                        audio: false,
                        video: false,
                    },
                });
            }
        });
    }, []);


    const leaveGroup = () => {
        removeGroupMember(currentGroup.id, userData.username);
    }




console.log(token)
    return (
       !isCallStarted? <>
            <div className="single-group-container">
                <div className="chat-container">
                    <button onClick={async () => {
                        if (!token) {
                            createDyteRoom(groupMembers,currentGroup.id)
                        }
                        else {
                            setIsCallStarted(true);
                        }
                    }
                    }><CallIcon/></button>

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
        </>:
         <DyteMeeting meeting={meeting} onMeetingEnd={() => setIsCallStarted(false)} />
    )
}
