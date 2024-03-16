import React, { useState } from 'react';
import { Calendar, momentLocalizer, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import Modal from 'react-modal';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './MyCalendar.css'; 

const localizer = momentLocalizer(moment);

interface Event {
  start: Date;
  end: Date;
  title: string;
}

const MyCalendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [title, setTitle] = useState('');

  const handleSelect = (slotInfo: SlotInfo) => {
    setSelectedSlot(slotInfo);
    setModalIsOpen(true);
  };

  const handleSave = () => {
    if (title && selectedSlot) {
      setEvents([
        ...events,
        {
          start: selectedSlot.start,
          end: selectedSlot.end,
          title,
        },
      ]);
    }
    setModalIsOpen(false);
    setTitle('');
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
      <Modal isOpen={modalIsOpen}>
        <h2>New Event</h2>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event name" />
        <button onClick={handleSave}>Save</button>
        <button onClick={() => setModalIsOpen(false)}>Cancel</button>
      </Modal>
    </div>
    </>
  );
};

export default MyCalendar;