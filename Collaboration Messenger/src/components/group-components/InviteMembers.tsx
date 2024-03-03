import React, { useEffect, useState } from 'react';

import InviteSearch from '../Search/InviteSearch';
import { useAppContext } from '../../context/appContext';
import Button from '../Button';
import { inviteToGroup } from '../../service/group';
import { useParams } from 'react-router-dom';

export const InviteMembers = ({ closeFn }: any) => {
    const [openFriend, setOpenFriend] = useState(true);
    const [friends, setFriends] = useState<any>([]);
    const { userData } = useAppContext();
    const {id}=useParams();
    useEffect(() => {
        if (userData.friends) {
            setFriends(Object.keys(userData.friends));
        }
        else {
            setFriends([]);
        }
    }, [userData]);
    const inviteFriend = (username:string) => {
        if (id){
        inviteToGroup(id, username)
        }
    }
    return (
        <div className='invite-members-container'>
            <div className='invite-members-form'>
                <div className='invite-members-header'>
                    <button onClick={() => setOpenFriend(true)}>Invite Friends</button>
                    <button onClick={() => setOpenFriend(false)}>Invite People</button>
                </div>
                {!openFriend && < InviteSearch type={'invite'} />}
                {openFriend && friends && friends.map((friend: any, index: any) => {
                    return (
                        <div key={index} className='invite-members-friends'>
                            <h5>{friend}</h5>
                            <button onClick={() => inviteFriend(friend)}>Invite</button>
                        </div>
                    );
                })}
                {openFriend&&friends.length===0&&<h5>No friends</h5>}
                
                <button className='invite-members-close-btn' onClick={
                    () => {
                        closeFn(false);
                        setOpenFriend(true);
                    }
                }>Close</button>
            </div>

        </div>
    );
};

export default InviteMembers;