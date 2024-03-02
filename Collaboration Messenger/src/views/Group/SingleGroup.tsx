import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Chat from '../../components/Chat';
import InviteMembers from '../../components/group-components/InviteMembers';
import './Group.css';

import { useParams } from 'react-router-dom';
import GroupMembers, { MembersProps } from '../../components/group-components/GroupMembers';
import { get, onValue, ref } from 'firebase/database';
import { Group } from '../../components/group-components/JoinedGroup';
import { db } from '../../config/config-firebase';
import { getGroupByID, getGroupMembers } from '../../service/group';
export default function SingleGroup() {
    const [open, setOpen] = useState(false);
    const [groupMembers, setGroupMembers] = useState<MembersProps[]>([]);
    const [currentGroup, setCurrentGroup] = useState<Group>({} as Group);
    const { id } = useParams();
    useEffect(() => {
        if (id) {
            getGroupByID(id).then((group) => {
                setCurrentGroup(group);
            })
            onValue(ref(db, `groups/${id}/members`), () => {
                getGroupMembers(id).then((members) => {
                    setGroupMembers(members);
                })
            });
        }
    }, [id])

    return (
        <>
            <div className="single-group-container">
                <div className="chat-container">
                    SingleGroup
                </div>
                <div className="members-container">
                    <div className="members-buttons">
                        <h4>{`members ${groupMembers.length}`}</h4>
                        <Button onClick={() => setOpen(true)}>Invite </Button>
                        {open && <InviteMembers closeFn={setOpen} />}
                    </div>
                    <GroupMembers members={groupMembers} owner={currentGroup.owner} />
                </div>
            </div>
        </>
    )
}