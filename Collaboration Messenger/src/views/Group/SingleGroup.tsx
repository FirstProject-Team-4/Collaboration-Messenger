import Button from '../../components/Button';
import Chat from '../../components/Chat';
import InviteMembers from '../../components/group-components/InviteMembers';
import './Group.css';
import Popup from 'reactjs-popup';
export default function SingleGroup() {
    console.log('SingleGroup')
    return (
        <>
            <div className="single-group-container">
                SingleGroup
            </div>
            <div className="members-container">
                <div className="members-buttons">
                    <InviteMembers/>
                  
                </div>
                Members
            </div>
        </>
    )
}