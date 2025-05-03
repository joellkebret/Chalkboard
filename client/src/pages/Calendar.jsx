import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar = () => {
  const ref = useRef(null);
  const [events, setEvents] = useState([]);

  const classes = [
    {
      course: 'CIS 2750 Software System Development & Integration',
      colour: 'bg-blue-500',
      schedule: [
        {
          type: 'Class', days: ['Tuesday', 'Thursday'],
          time: '11:30 AM - 12:50 PM', room: 'ALEX 100',
          maps: 'https://www.google.com/maps/place/Alexander+Hall,+University+of+Guelph/',
        },
        {
          type: 'Lab', days: ['Friday'],
          time: '11:30 AM - 01:20 PM', room: 'THRN 2418',
          maps: 'https://www.google.com/maps/place/Thornbrough+Building/',
        },
      ],
    },
    {
      course: 'CIS 3110 Operating System',
      colour: 'bg-teal-500',
      schedule: [
        {
          type: 'Class', days: ['Tuesday', 'Thursday'],
          time: '04:00 PM - 05:20 PM', room: 'ROZH 101',
          maps: 'https://www.google.com/maps/place/Rozanski+Hall/',
        },
        {
          type: 'Lab', days: ['Wednesday'],
          time: '04:30 PM - 05:20 PM', room: 'ALEX 028',
          maps: 'https://www.google.com/maps/place/Alexander+Hall,+University+of+Guelph/',
        },
      ],
    },
    {
      course: 'CIS 3490',
      colour: 'bg-purple-500',
      schedule: [
        {
          type: 'Class', days: ['Tuesday', 'Thursday'],
          time: '05:30 PM - 06:50 PM', room: 'ROZH 101',
          maps: 'https://www.google.com/maps/place/Rozanski+Hall/',
        },
        {
          type: 'Lab', days: ['Wednesday'],
          time: '11:30 AM - 01:20 PM', room: 'MCKN 231',
          maps: 'https://www.google.com/maps/place/McKinnon+Building,+University+of+Guelph/',
        },
      ],
    },
  ];

  const colourOf = (title) =>
    title.startsWith('CIS 2750') ? 'bg-blue-500'
      : title.startsWith('CIS 3110') ? 'bg-teal-500'
        : title.startsWith('CIS 3490') ? 'bg-purple-500'
          : 'bg-gray-500';

  const buildLocalDateTime = (isoDate, clock) => {
    const [Y, M, D] = isoDate.split('-').map(Number);
    const [, hhmm, period] = clock.toUpperCase().match(/(\d{1,2}:\d{2})\s*(AM|PM)/);
    let [h, m] = hhmm.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return new Date(Y, M - 1, D, h, m, 0, 0);
  };

  const hydrateEvents = ({ start, end }) => {
    const items = [];
    for (let day = new Date(start); day < end; day.setDate(day.getDate() + 1)) {
      const weekday = day.toLocaleString('en-US', { weekday: 'long' });
      const iso = day.toLocaleDateString('en-CA');

      classes.forEach((c) =>
        c.schedule.forEach((s) => {
          if (!s.days.includes(weekday)) return;
          const [beg, fin] = s.time.split(' - ');
          items.push({
            title: `${c.course} (${s.type})`,
            start: buildLocalDateTime(iso, beg),
            end: buildLocalDateTime(iso, fin),
            extendedProps: { ...s, icon: s.type === 'Class' ? '🏫' : '🔬' },
            classNames: [colourOf(c.course)],
          });
        })
      );
    }
    setEvents(items);
  };

  return (
    <section className="min-h-screen bg-[#292f36] text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-5xl font-extrabold mb-6 tracking-tight">Event Calendar</h1>

      <div className="flex gap-4 mb-8">
        <button
          className="px-5 py-2 bg-[#3c3f44] text-white rounded-full hover:bg-[#52555b] shadow-sm transition"
          onClick={() => ref.current?.getApi().changeView('timeGridWeek')}
        >
          Weekly
        </button>
        <button
          className="px-5 py-2 bg-[#3c3f44] text-white rounded-full hover:bg-[#52555b] shadow-sm transition"
          onClick={() => ref.current?.getApi().changeView('timeGridDay')}
        >
          Daily
        </button>
      </div>

      <div className="w-full max-w-6xl bg-[#1f232a] text-white rounded-xl shadow-xl overflow-hidden ring-1 ring-slate-700">
        <FullCalendar
          ref={ref}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
          slotMinTime="08:00:00"
          slotMaxTime="19:00:00"
          slotDuration="00:15:00"
          expandRows
          height="auto"
          aspectRatio={2}
          dayMaxEvents
          eventMinHeight={40}
          events={events}
          datesSet={hydrateEvents}

          eventContent={({ event }) => {
            const { room, maps, icon } = event.extendedProps;
            return (
              <div className="flex flex-col justify-between h-full px-2 py-1">
                <div className="flex items-center text-sm font-semibold">
                  <span className="mr-2">{icon}</span>
                  <span className="truncate">{event.title}</span>
                </div>
                <div className="flex justify-between text-xs opacity-80 mt-1">
                  {room && <span>{room}</span>}
                  {maps && (
                    <a
                      href={maps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-yellow-300"
                    >
                      📍
                    </a>
                  )}
                </div>
              </div>
            );
          }}

          eventClassNames={({ event }) =>
            `${event.classNames[0]} text-white rounded-lg px-2 py-1 shadow-lg
             hover:shadow-xl hover:scale-[1.03] transition-transform
             ${
               event.classNames[0] === 'bg-blue-500'
                 ? 'bg-gradient-to-br from-blue-600 to-blue-400'
                 : event.classNames[0] === 'bg-teal-500'
                 ? 'bg-gradient-to-br from-teal-600 to-teal-400'
                 : event.classNames[0] === 'bg-purple-500'
                 ? 'bg-gradient-to-br from-purple-600 to-purple-400'
                 : ''
             }`
          }

          eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}

          views={{
            timeGridWeek: {
              slotLabelFormat: { hour: 'numeric', minute: '2-digit', meridiem: 'short' },
            },
            timeGridDay: {
              slotLabelFormat: { hour: 'numeric', minute: '2-digit', meridiem: 'short' },
            },
          }}

          slotLaneClassNames="border-t border-slate-700"
          dayCellClassNames="border-r border-slate-800"
          slotLabelClassNames="text-slate-400 text-sm pl-1"
        />
      </div>
    </section>
  );
};

export default Calendar;
