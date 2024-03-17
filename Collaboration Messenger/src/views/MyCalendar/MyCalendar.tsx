import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import Modal from 'react-modal';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './MyCalendar.css';
import { getDatabase, onValue, push, ref } from 'firebase/database';
import { useAppContext } from '../../context/appContext';
import UserSearch from '../../components/Search/UserSearch';
import { getAllUsers } from '../../service/user';
import { useNavigate } from 'react-router-dom';

const localizer = momentLocalizer(moment);

interface Event {
  start: Date;
  end: Date;
  title: string;
  sharedWith?: string[]; // Add sharedWith field to Event interface
}

const MyCalendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState(new Date().toISOString());
  const [end, setEnd] = useState(new Date().toISOString());
  const [attendees, setAttendees] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserListVisible, setIsUserListVisible] = useState(false);
  const { userData } = useAppContext();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<any>([]);

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
            ...data[key]
          }
        });
        setEvents(userEvents);
      } else {
        setEvents([]);
      }
    });
  }, [userData]);

  const handleSelect = (slotInfo: SlotInfo) => {
    console.log('handleSelect called', slotInfo);
    setIsModalOpen(true);// Open the modal when a slot is selected
    setSelectedSlot(slotInfo);
    setStart(slotInfo.start.toISOString());
    setEnd(slotInfo.end.toISOString());
    
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers([userId]);
  };
  const handleSave = () => {
    const db = getDatabase();
    const newEvent = {
      title,
      start, // Use the start time of the selected slot
      end, // Use the end time of the selected slot
      attendees,
      sharedWith: selectedUsers // Include selected users/group in the event 
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
        setIsModalOpen(false); // Close the modal after saving
      })
      .catch((error) => {
        console.error('Error saving event: ', error);
      });
  
    // Save the event to the selected user's node
    selectedUsers.forEach((userId) => {
      push(ref(db, `users/${userId}/events`), newEvent)
        .then(() => {
          console.log(`Event saved in user ${userId}'s database!`);
        })
        .catch((error) => {
          console.error(`Error saving event in user ${userId}'s database: `, error);
        });
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const toggleUserList = () => {
    setIsUserListVisible(prevIsUserListVisible => !prevIsUserListVisible);
  };



  // const handleSelectEvent = (event: Event) => {
  //   // Find the chat that corresponds to the user
  //   const chat = chats.find(chat => chat.uid === event.sharedWith[0]);
  
  //   if (chat) {
  //     // If the chat is found, navigate to the chat with the user
  //     navigate(`/privateChats/${chat.id}`);
  //   } else {
  //     // If the chat is not found, handle the error (e.g., show an error message)
  //     console.error('Chat not found');
  //   }
  // };

  return (
    <>
      <div className="my-calendar-container">
        <Calendar
          localizer={localizer}
          defaultDate={new Date()}
          defaultView="month"
          events={events}
          onSelectSlot={handleSelect}
          // onSelectEvent={handleSelectEvent} // Add this line
          selectable
          className="my-calendar"
        />
      </div>
      <div>
        {isModalOpen && (
          <div className="modal">
            <h2>New Event</h2>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            <button onClick={handleSave}>Save Event</button>
            <button onClick={closeModal}>Cancel</button>

            <div>
              <h3>Share with:</h3>

              <select value={selectedUsers[0] || ''} onChange={(e) =>
                 handleUserSelect(e.target.value)}>
                {users.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyCalendar;
