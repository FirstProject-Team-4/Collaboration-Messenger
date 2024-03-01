import React, { useState } from 'react';
import Popup from 'reactjs-popup';
import InviteSearch from './InviteSearch';

export const InviteMembers = () => {
    const [openFriend, setOpenFriend] = useState(true);
    console.log('invitememebers')
    return (
        <Popup
            trigger={<button>Invite Members</button>}
            modal
            overlayStyle={{ background: 'rgba(0,0,0,0.6)' }} // Add a shadow to the rest of the page
            contentStyle={{ width: '300px', borderRadius: '20px', padding: '20px' }} // Style the modal
        >
            {(close) => (
                <div className='invite-members-form'>
                    <div className='invite-members-header'>
                        <button onClick={() => setOpenFriend(true)}>Invite Friends</button>
                        <button onClick={() => setOpenFriend(false)}>Invite People</button>
                    </div>
                 {!openFriend&&< InviteSearch type={'invite'}/>}
                    <button className='invite-memebers-close-btn' onClick={
                        () => {
                            close();
                            setOpenFriend(true);
                        }
                    }>Close</button>
                </div>
            )}
        </Popup>
    );
};

export default InviteMembers;