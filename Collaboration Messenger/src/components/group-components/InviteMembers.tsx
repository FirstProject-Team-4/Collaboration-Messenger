import React, { useState } from 'react';
import Popup from 'reactjs-popup';
import InviteSearch from '../Search/InviteSearch';

export const InviteMembers = ({closeFn}:any) => {
    const [openFriend, setOpenFriend] = useState(true);
    console.log('invitememebers')
    return (
        <div className='invite-members-container'>
                <div className='invite-members-form'>
                    <div className='invite-members-header'>
                        <button onClick={() => setOpenFriend(true)}>Invite Friends</button>
                        <button onClick={() => setOpenFriend(false)}>Invite People</button>
                    </div>
                 {!openFriend&&< InviteSearch type={'invite'}/>}
                    <button className='invite-memebers-close-btn' onClick={
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