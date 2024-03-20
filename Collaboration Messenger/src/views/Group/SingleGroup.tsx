import { useEffect, useState } from 'react';
import Button from '../../components/button/Button';
import InviteMembers from '../../components/group-components/InviteMembers';
import { useNavigate, useParams } from 'react-router-dom';
import GroupMembers, { MembersProps } from '../../components/group-components/GroupMembers';
import { onValue, ref, remove, set } from 'firebase/database';
import { Group } from '../../components/group-components/JoinedGroup';
import { db } from '../../config/config-firebase';
import { getGroupByID, getGroupMembers, removeGroupMember } from '../../service/group';
import { useAppContext, useCallContext, useDyteContext } from '../../context/appContext';
import Chat from '../../components/chat/Chat';

import { setStatusToBusy } from '../../service/status';
import CallIcon from '@mui/icons-material/Call';
import './Group.css';
import { toast } from 'react-hot-toast';

export default function SingleGroup() {
  const [open, setOpen] = useState(false);

  const [groupMembers, setGroupMembers] = useState<MembersProps[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group>({} as Group);
  const { userData } = useAppContext();
  const [token, setToken] = useState<string>("");
  const {meeting, initMeeting} = useDyteContext();
  const {inCall, setInCall} = useCallContext();
  const[status,setStatus]=useState('');





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
      });
      onValue(ref(db, `groups/${id}/members`), (snapshot) => {
        if(snapshot.exists()){
          setGroupMembers(Object.keys(snapshot.val()).map((key)=>{
            return{
              username:key,
              ...snapshot.val()[key]
            };
          }));
        }
        else{
          setGroupMembers([]);
        }
      });
            
    }
    onValue(ref(db, `users/${userData.username}/status`), (snapshot) => {
      if (snapshot.exists()) {
        setStatus(snapshot.val());
      }
    });

  }, [id,userData]);
  useEffect(() => {

    onValue(ref(db, `groups/${id}/members/${userData.username}/token`), (snapshot) => {
      if (snapshot.exists()) {
        setToken(snapshot.val().token);

      }
    });
  }, [userData]);
  useEffect(() => {
    if(!userData || !id){
      return;
    }
    const subscribe= onValue(ref(db, `users/${userData.username}/groupNotifications/${id}`), (snapshot) => {
      remove(ref(db, `users/${userData.username}/groupNotifications/${id}`));
        
    });
    return ()=>subscribe();
    //off(ref(db, `users/${userData.username}/groupNotifications/${id}`));
  },[userData,id]);
    



  


  const leaveGroup = () => {
    removeGroupMember(currentGroup.id, userData.username);
  };
  return (
        
    <>
      <div className="chat-container">
        <button onClick={async () => {

          if (status === 'busy') {
            toast.error('You are already in a call'),{
              duration:8000
            };
            return;
          }
          await initMeeting({
            authToken: token,
            defaults: {
              audio: false,
              video: false,
            },
          });
          setInCall(true);
          setStatusToBusy(userData);
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
    </>
       
                
  );
}
