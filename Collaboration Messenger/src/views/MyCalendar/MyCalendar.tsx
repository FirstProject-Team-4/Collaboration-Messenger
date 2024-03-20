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

/**
 * Represents the MyCalendar component.
 */
const MyCalendar: React.FC = () => {
  // State variables
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<any>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>([]); //group
  const [groups, setGroups] = useState<Group[]>([]); //group
  const [start, setStart] = useState(new Date().toISOString());
  const [end, setEnd] = useState(new Date().toISOString());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [users, setUsers] = useState<any>([]);
  const [title, setTitle] = useState('');
  const { userData } = useAppContext();
  const navigate = useNavigate();

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getAllUsers();
      setUsers(snapshot);
    };
    fetchUsers();
  }, []);

  // Fetch user events
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
          };
        });
        setEvents(userEvents);
      } else {
        setEvents([]);
      }
    });
  }, [userData]);

  // Fetch user groups
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
          };
        });
        setGroups(userGroups);
        console.log(userGroups);
      } else {
        setGroups([]);
      }
    });
  }, [userData]);


  /**
   * Handles the selection of a time slot in the calendar.
   * @param slotInfo - The information about the selected time slot.
   */
  const handleSelect = (slotInfo: SlotInfo) => {
    console.log('handleSelect called', slotInfo);
    setIsModalOpen(true); // Open the modal when a slot is selected
    setSelectedSlot(slotInfo);
    setStart(slotInfo.start.toISOString());
    setEnd(slotInfo.end.toISOString());
  };


  /**
   * Handles the selection of a user.
   * @param {string} userId - The ID of the selected user.
   */
  const handleUserSelect = (userId: string) => {
    setSelectedUsers([userId]);
    setSelectedGroup([]);
  };

  /**
   * Handles the selection of a group.
   * @param {string} groupId - The ID of the selected group.
   */
  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup([groupId]);
    setSelectedUsers([]);
  };

  useEffect(() => {
    console.log('selectedGroup changed', selectedGroup);
  }, [selectedGroup]);
  console.log('selectedGroup', selectedGroup);

  /**
   * Handles the save event functionality.
   * Saves the event to the database and performs necessary state updates.
   */
  const handleSave = async () => {
    const db = getDatabase();
    const userId = await get(ref(db, `users/${selectedUsers[0]}/uid`));
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
      push(ref(db, `users/${userId}/events`), newEvent);
    });

    // Save the event to the 'events' node GROUP
    selectedGroup.forEach((groupId: any) => {
      push(ref(db, `groups/${groupId}/events`), newEvent);
    });

    if (selectedGroup.length > 0) {
      const snapshot = await get(ref(db, `groups/${selectedGroup}/members`));
      const members = Object.keys(snapshot.val());
      members.forEach((member: any) => {
        push(ref(db, `users/${member}/events`), newEvent);
      });
    } else {
      push(ref(db, `users/${userId}/events`), newEvent);
    }
  };

  /**
   * Closes the modal and resets the selected group and users.
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGroup([]);
    setSelectedUsers([]);
  };

  /**
   * Handles the selection of an event.
   * @param event - The selected event.
   */
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
