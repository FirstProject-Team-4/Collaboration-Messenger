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
    const eventsRef = ref(db, 'events');
    onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const events = Object.keys(data).map((key) => {
          return {
            id: key,
            ...data[key]
          }
        })
        setEvents(events);
      } else {
        setEvents([]);
      }
    });
  }, [userData]);

  const handleSelect = (slotInfo: SlotInfo) => {
    setSelectedSlot(slotInfo);
    setModalIsOpen(true);
  };

  // const handleUserSelect = (userId: string) => {
  //   setSelectedUsers(prevSelectedUsers => {
  //     if (prevSelectedUsers.includes(userId)) {
  //       return prevSelectedUsers.filter(id => id !== userId); // Deselect if already selected
  //     } else {
  //       return [...prevSelectedUsers, userId]; // Select if not already selected
  //     }
  //   });
  // };
  const handleUserSelect = (userId: string) => {
    setSelectedUsers([userId]);
  };

  const handleSave = () => {
    const db = getDatabase();
    const newEvent = {
      title,
      start,
      end,
      attendees,
      sharedWith: selectedUsers // Include selected users/groups
    };

    // Save the event to the 'events' node
    push(ref(db, 'events'), newEvent)
      .then(() => {
        console.log('Event saved!');
        // Reset the state values after saving the event
        setTitle('');
        setStart(new Date().toISOString());
        setEnd(new Date().toISOString());
        setAttendees([]);
        setSelectedUsers([]);
        setModalIsOpen(false); // Close the modal after saving
      })
      .catch((error) => {
        console.error('Error saving event: ', error);
      });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const toggleUserList = () => {
    setIsUserListVisible(prevIsUserListVisible => !prevIsUserListVisible);
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
          selectable
          className="my-calendar"
        />
      </div>
      <div>
        {!isModalOpen && (
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
