import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar = () => {
  const ref = useRef(null);
  const [events, setEvents] = useState([]);

  /* ───────────────── course data ───────────────── */
  const courses = [
    {
      code: "STAT*1200",
      name: "Probability and Chance",
      instructor: "Gary Umphrey & Mihai Nica",
      days: ["Monday", "Wednesday", "Friday"],
      startTime: "15:30",
      endTime: "16:20",
      startDate: "2023-09-05",
      endDate: "2026-12-20",
      finalExam: {
        date: "2025-12-11",
        start: "14:30",
        end: "16:30"
      }
    },
    {
      code: "CIS*1300",
      name: "Programming",
      instructor: "Ritu Chaturvedi & Wenjing Zhang",
      days: ["Monday", "Wednesday", "Friday"],
      startTime: "14:30",
      endTime: "15:20",
      startDate: "2023-09-05",
      endDate: "2026-12-20",
      // Final exam TBA, so skip for now
    },
    {
      code: "STAT*2040",
      name: "Statistics I",
      instructor: "Jeremy Balka",
      days: ["Tuesday", "Thursday"],
      startTime: "17:30",
      endTime: "18:50",
      startDate: "2023-09-05",
      endDate: "2026-12-20",
      finalExam: {
        date: "2026-12-13",
        start: "08:30",
        end: "10:30"
      }
    }
  ];

  const studySessions = [
    { day: "Monday", start: "06:00", end: "07:00", course: "STAT*2040" },
    { day: "Monday", start: "07:10", end: "08:10", course: "CIS*1300" },
    { day: "Tuesday", start: "06:00", end: "07:00", course: "CIS*1300" },
    { day: "Tuesday", start: "07:10", end: "08:10", course: "STAT*1200" },
    { day: "Wednesday", start: "06:00", end: "07:00", course: "STAT*2040" },
    { day: "Wednesday", start: "07:10", end: "08:10", course: "CIS*1300" },
    { day: "Thursday", start: "06:00", end: "07:00", course: "CIS*1300" },
    { day: "Thursday", start: "07:10", end: "08:10", course: "STAT*1200" },
    { day: "Friday", start: "06:00", end: "07:00", course: "STAT*2040" },
    { day: "Friday", start: "07:10", end: "08:10", course: "CIS*1300" },
  ];

  // Helper: get weekday index for FullCalendar
  const weekdayIndex = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6
  };

  // Generate events for FullCalendar
  const hydrateEvents = ({ start, end }) => {
    const items = [];

    // Recurring lecture events
    courses.forEach((course) => {
      if (course.days && course.startTime && course.endTime && course.startDate && course.endDate) {
        const daysOfWeek = course.days.map(day => weekdayIndex[day]);
        items.push({
          title: `${course.code} - ${course.name} (Lecture)`,
          daysOfWeek,
          startTime: course.startTime,
          endTime: course.endTime,
          startRecur: course.startDate,
          endRecur: course.endDate,
          allDay: false,
          classNames: ['bg-blue-600'],
          extendedProps: { instructor: course.instructor, icon: '🏫' }
        });
      }
    });

    // One-time final exam events
    courses.forEach((course) => {
      if (course.finalExam) {
        items.push({
          title: `${course.code} - ${course.name} (Final Exam)`,
          start: `${course.finalExam.date}T${course.finalExam.start}`,
          end: `${course.finalExam.date}T${course.finalExam.end}`,
          allDay: false,
          classNames: ['bg-red-600'],
          extendedProps: { instructor: course.instructor, icon: '📝' }
        });
      }
    });

    // Add recurring study session events
    studySessions.forEach(session => {
      const course = courses.find(c => c.code === session.course);
      if (course) {
        items.push({
          title: `Study ${session.course}`,
          daysOfWeek: [weekdayIndex[session.day]],
          startTime: session.start,
          endTime: session.end,
          startRecur: course.startDate,
          endRecur: course.endDate,
          allDay: false,
          classNames: ['bg-yellow-500'],
          extendedProps: { icon: '📚' }
        });
      }
    });

    setEvents(items);
  };

  const colourOf = (title) =>
    title.startsWith('CIS 2750') ? 'bg-blue-500'
  : title.startsWith('CIS 3110') ? 'bg-teal-500'
  : title.startsWith('CIS 3490') ? 'bg-purple-500'
  : 'bg-gray-500';

  /* helper – build Date in local TZ */
  const buildLocalDateTime = (isoDate, clock) => {
    const [Y, M, D] = isoDate.split('-').map(Number);
    const [, hhmm, period] = clock.toUpperCase().match(/(\d{1,2}:\d{2})\s*(AM|PM)/);
    let [h, m] = hhmm.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h  = 0;
    return new Date(Y, M - 1, D, h, m, 0, 0);
  };

  /* ─────────────────────────── UI ─────────────────────────── */
  return (
    <section className="min-h-screen bg-[#292f36] text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-bold mb-6">Event Calendar</h1>

      <div className="flex gap-4 mb-8">
        <button
          className="px-5 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          onClick={() => ref.current?.getApi().changeView('timeGridWeek')}
        >
          Weekly
        </button>
        <button
          className="px-5 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          onClick={() => ref.current?.getApi().changeView('timeGridDay')}
        >
          Daily
        </button>
      </div>

      <div className="w-full max-w-6xl bg-white text-black rounded-2xl shadow-2xl overflow-hidden">
        <FullCalendar
          ref={ref}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left:'prev,next today', center:'title', right:'' }}
          slotMinTime="04:00:00"
          slotMaxTime="19:00:00"
          slotDuration="00:15:00"
          expandRows
          height="auto"
          aspectRatio={2}
          dayMaxEvents
          eventMinHeight={32}
          events={events}
          datesSet={hydrateEvents}

          eventContent={({ event }) => {
            const { instructor, icon } = event.extendedProps;
            return (
              <div className="flex items-center w-full px-2 py-1">
                <span className="mr-2">{icon}</span>
                <span className="flex-1 text-sm">{event.title}</span>
                {instructor && <span className="ml-1 text-xs opacity-80">({instructor})</span>}
              </div>
            );
          }}

          eventClassNames={({ event }) =>
            `${event.classNames[0]} text-white rounded px-2 py-1 shadow-md
             hover:shadow-xl hover:scale-[1.03] transition-transform`
          }

          eventTimeFormat={{ hour:'numeric', minute:'2-digit', meridiem:'short' }}

          views={{
            timeGridWeek:{ slotLabelFormat:{ hour:'numeric', minute:'2-digit', meridiem:'short' } },
            timeGridDay :{ slotLabelFormat:{ hour:'numeric', minute:'2-digit', meridiem:'short' } },
          }}
        />
      </div>
    </section>
  );
};

export default Calendar;