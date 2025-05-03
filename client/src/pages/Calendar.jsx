import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar = () => {
  const calendarRef = useRef(null);

  // Sample events
  const events = [
    { title: 'Meeting', start: '2025-05-05T10:00:00', end: '2025-05-05T11:00:00' },
    { title: 'Lunch Break', start: '2025-05-06T12:00:00', end: '2025-05-06T13:00:00' },
    { title: 'Project Deadline', start: '2025-05-10' }, // All-day event
  ];

  // Handle date click
  const handleDateClick = (arg) => {
    alert(`Date clicked: ${arg.dateStr}`);
  };

  // Handle event click
  const handleEventClick = (arg) => {
    alert(`Event: ${arg.event.title} on ${arg.event.start.toISOString()}`);
  };

  // Handle view change
  const handleViewChange = (view) => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(view);
  };

  return (
    <section className="container overflow-hidden">
      <h1 className="h2 text-center mb-8">Event Calendar</h1>
      <div className="calendar-controls mb-6 flex justify-center gap-4">
        <button
          className="fc-button"
          onClick={() => handleViewChange('dayGridMonth')}
        >
          Monthly
        </button>
        <button
          className="fc-button"
          onClick={() => handleViewChange('timeGridWeek')}
        >
          Weekly
        </button>
        <button
          className="fc-button"
          onClick={() => handleViewChange('timeGridDay')}
        >
          Daily
        </button>
      </div>
      <div className="calendar-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '', // Removed default view buttons
          }}
          height="auto"
          aspectRatio={1.5}
          weekends={true}
          editable={true}
          selectable={true}
          views={{
            dayGridMonth: {
              titleFormat: { year: 'numeric', month: 'long' },
            },
            timeGridWeek: {
              titleFormat: { year: 'numeric', month: 'short', day: 'numeric' },
              slotLabelFormat: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              },
            },
            timeGridDay: {
              titleFormat: { year: 'numeric', month: 'short', day: 'numeric' },
              slotLabelFormat: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              },
            },
          }}
        />
      </div>
    </section>
  );
};

export default Calendar;