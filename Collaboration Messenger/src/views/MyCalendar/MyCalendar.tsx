import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './MyCalendar.css';
import { get, getDatabase, onValue, push, ref } from 'firebase/database';
import { useAppContext } from '../../context/appContext';
import { getAllUsers } from '../../service/user';
import { useNavigate } from 'react-router-dom';
import { commbineId } from '../../service/friends';


const localizer = momentLocalizer(moment);

interface Event {
  start: Date;
  end: Date;
  title: string;
  sharedWith?: {
    type: string;
    id: string;
  };
}

interface Group {
  id: string;
  username: string;
  members: string[];
}

const MyCalendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<any>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>([]);//group
  const [groups, setGroups] = useState<Group[]>([]);//group
  const [start, setStart] = useState(new Date().toISOString());
  const [end, setEnd] = useState(new Date().toISOString());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [users, setUsers] = useState<any>([]);
  const [title, setTitle] = useState('');
  const { userData } = useAppContext();
  const navigate = useNavigate();

  //users 
  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getAllUsers();
      setUsers(snapshot);
    }
    fetchUsers();
  }, []);


  useEffect(() => {
    const db = getDatabase();
    const userEventsRef = ref(db, `users/${userData?.username}/events`);
    onValue(userEventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userEvents = Object.keys(data).map((key) => {
          return {
            id: key,
            start: new Date(data[key].start),
            end: new Date(data[key].end),
            title: data[key].title,
            sharedWith: data[key].sharedWith,
          }
        });
        setEvents(userEvents);
      } else {
        setEvents([]);
      }
    });
  }, [userData]);

  //group
  useEffect(() => {
    const db = getDatabase();
    const userGroupsRef = ref(db, `users/${userData?.username}/groups`);
    onValue(userGroupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userGroups = Object.keys(data).map((key) => {
          return {
            id: key,
            ...data[key]
          }
        });
        setGroups(userGroups);
        console.log(userGroups);
      } else {
        setGroups([]);
      }
    });
  }, [userData]);

  // console.log(selectedUsers);



  const handleSelect = (slotInfo: SlotInfo) => {
    console.log('handleSelect called', slotInfo);
    setIsModalOpen(true);// Open the modal when a slot is selected
    setSelectedSlot(slotInfo);
    setStart(slotInfo.start.toISOString());
    setEnd(slotInfo.end.toISOString());

  };

  //user select
  const handleUserSelect = (userId: string) => {
    setSelectedUsers([userId]);
    setSelectedGroup([]);

  };


  //group select
  // const handleGroupSelect = (groupId: string) => {

  //   setSelectedGroup(groupId);

  //   const group = groups.find(group => group.id === groupId);
  //   if (group) {
  //     setSelectedUsers(group.members);
  //   }
  //   console.log('handleGroupSelect called', selectedGroup);
  //   console.log('handleGroupSelect called', groupId);
  // };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup([groupId]);
    setSelectedUsers([]);
  };

  useEffect(() => {
    console.log('selectedGroup changed', selectedGroup);
  }, [selectedGroup]);
  console.log('selectedGroup', selectedGroup);

  const handleSave = async () => {
    const db = getDatabase();
    const userId = await get(ref(db, `users/${selectedUsers[0]}/uid`));
    // console.log('userId', userId.val());
    // console.log('userData', userData.uid);
    const chatId = commbineId(userId.val(), userData.uid);


    const newEvent = {
      title,
      start,
      end,
      attendees,
      sharedWith: selectedGroup.length > 0 ? { type: 'group', id: selectedGroup } : { type: 'privateChat', id: chatId },
    };

    // Save the event to the 'events' node
    push(ref(db, `users/${userData?.username}/events`), newEvent)
      .then(() => {
        console.log('Event saved!');
        // Reset the state values after saving the event
        setTitle('');
        setStart(new Date().toISOString());
        setEnd(new Date().toISOString());
        setAttendees([]);
        setSelectedUsers([]);
        setSelectedGroup([]); //group?
        setIsModalOpen(false); // Close the modal after saving
      })
      .catch((error) => {
        console.error('Error saving event: ', error);
      });

    // Save the event to the 'events' node USER
    selectedUsers.forEach((userId: any) => {
      push(ref(db, `users/${userId}/events`), newEvent)

    });

    //group
    selectedGroup.forEach((groupId: any) => {
      push(ref(db, `groups/${groupId}/events`), newEvent)

    });

    if (selectedGroup.length > 0) {
      const snapshot= await get(ref(db, `groups/${selectedGroup}/members`));
      const members= Object.keys(snapshot.val());
      members.forEach((member: any) => {
        push(ref(db, `users/${member}/events`), newEvent)
      });
    } else {
      push(ref(db, `users/${userId}/events`), newEvent)
    }
   

  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGroup([]);
    setSelectedUsers([]);
  };



  const handleSelectEvent = (event: Event) => {
    console.log('handleSelectEvent called', event);

    if (event.sharedWith?.type === 'privateChat') {
      navigate(`/privateChats/${event.sharedWith?.id}`);
    } else {
      navigate(`/group/${event.sharedWith?.id}`);
    }

  };




  return (
    <>
      <div className="my-calendar-container">
        <Calendar
          localizer={localizer}
          defaultDate={new Date()}
          defaultView="month"
          events={events}
          onSelectSlot={handleSelect}
          views={['month', 'day', 'agenda']} // Only these views will be enabled
          onSelectEvent={handleSelectEvent} // Add this line
          selectable
          className="my-calendar"
        />
      </div>
      <div>
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>New Event</h2>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
              <button onClick={handleSave}>Save Event</button>
              <button onClick={closeModal}>Cancel</button>

              <div>
                <h3>Share with:</h3>
                <select value={selectedUsers ? selectedUsers[0] : ''} onChange={(e) =>
                  handleUserSelect(e.target.value)}>
                  {users.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h3>Select group:</h3>
                <select value={selectedGroup ? selectedGroup[0] : ''} onChange={(e) =>

                  handleGroupSelect(e.target.value)}>

                  {groups.map((group: any) => (
                    <option key={group.id} value={group.id}>
                      {group.title}

                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

    </>
  );
};

export default MyCalendar;
