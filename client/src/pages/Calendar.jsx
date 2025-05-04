import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin   from '@fullcalendar/daygrid';
import timeGridPlugin  from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar = () => {
  const ref = useRef(null);
  const [events, setEvents] = useState([]);
  const [expandedCourse, setExpandedCourse] = useState(null);

  /* ───────────── course data ───────────── */
  const courses = [
    {
      code:       "STAT*1200",
      name:       "Probability and Chance",
      instructor: "Gary Umphrey & Mihai Nica",
      colour:     "bg-orange-500",
      days:       ["Monday","Wednesday","Friday"],
      startTime:  "15:30",
      endTime:    "16:20",
      startDate:  "2023-09-05",
      endDate:    "2026-12-20",
      finalExam:  { date:"2025-12-11", start:"14:30", end:"16:30" }
    },
    {
      code:       "CIS*1300",
      name:       "Programming",
      instructor: "Ritu Chaturvedi & Wenjing Zhang",
      colour:     "bg-blue-500",
      days:       ["Monday","Wednesday","Friday"],
      startTime:  "14:30",
      endTime:    "15:20",
      startDate:  "2023-09-05",
      endDate:    "2026-12-20"
    },
    {
      code:       "STAT*2040",
      name:       "Statistics I",
      instructor: "Jeremy Balka",
      colour:     "bg-yellow-500",
      days:       ["Tuesday","Thursday"],
      startTime:  "17:30",
      endTime:    "18:50",
      startDate:  "2023-09-05",
      endDate:    "2026-12-20",
      finalExam:  { date:"2026-12-13", start:"08:30", end:"10:30" }
    }
  ];

  const studySessions = [
    // Monday
    { day: "Monday", start: "06:00", end: "07:00", course: "STAT*2040" },
    { day: "Monday", start: "07:10", end: "08:10", course: "CIS*1300" },
    // Tuesday
    { day: "Tuesday", start: "06:00", end: "07:00", course: "CIS*1300" },
    { day: "Tuesday", start: "07:10", end: "08:10", course: "STAT*1200" },
    // Wednesday
    { day: "Wednesday", start: "06:00", end: "07:00", course: "STAT*2040" },
    { day: "Wednesday", start: "07:10", end: "08:10", course: "CIS*1300" },
    // Thursday
    { day: "Thursday", start: "06:00", end: "07:00", course: "CIS*1300" },
    { day: "Thursday", start: "07:10", end: "08:10", course: "STAT*1200" },
    // Friday
    { day: "Friday", start: "06:00", end: "07:00", course: "STAT*2040" },
    { day: "Friday", start: "07:10", end: "08:10", course: "CIS*1300" },
  ];
  const weekdayIndex = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };

  const hydrateEvents = ({ start, end }) => {
    const items = [];
    // lectures + finals
    courses.forEach(course => {
      items.push({
        title:       `${course.code} – ${course.name}`,
        daysOfWeek:  course.days.map(d=>weekdayIndex[d]),
        startTime:   course.startTime,
        endTime:     course.endTime,
        startRecur:  course.startDate,
        endRecur:    course.endDate,
        allDay:      false,
        classNames:  [course.colour],
        extendedProps:{ instructor:course.instructor, icon:'🏫' }
      });
      if (course.finalExam) {
        const fe = course.finalExam;
        items.push({
          title:      `${course.code} – Final Exam`,
          start:      `${fe.date}T${fe.start}`,
          end:        `${fe.date}T${fe.end}`,
          allDay:     false,
          classNames: [course.colour],
          extendedProps:{ instructor:course.instructor, icon:'📝' }
        });
      }
    });
    // study sessions
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
    // Add CIS*1300 Lab Support (Thursday)
    const cis1300 = courses.find(c => c.code === "CIS*1300");
    if (cis1300) {
      items.push({
        title: "CIS*1300 Lab Support",
        daysOfWeek: [weekdayIndex["Thursday"]],
        startTime: "08:30",
        endTime: "09:30",
        startRecur: cis1300.startDate,
        endRecur: cis1300.endDate,
        allDay: false,
        classNames: ['bg-green-500'],
        extendedProps: { icon: '⌨️' }
      });
    }
    setEvents(items);
  };

  return (
    <section className="min-h-screen bg-[#292f36] text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Event Calendar</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Calendar */}
        <div className="flex-grow max-w-4xl mx-auto lg:mx-0">
          <div className="flex gap-4 mb-4">
            <button
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              onClick={()=>ref.current?.getApi().changeView('timeGridWeek')}
            >Weekly</button>
            <button
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              onClick={()=>ref.current?.getApi().changeView('timeGridDay')}
            >Daily</button>
          </div>
          <div className="bg-white text-black rounded shadow overflow-hidden" style={{ height: 500 }}>
            <FullCalendar
              ref={ref}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={false}
              height={500}
              aspectRatio={1.3}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              slotDuration="00:15:00"
              events={events}
              datesSet={hydrateEvents}
              eventClassNames={info=>info.event.classNames}
              eventContent={({event})=>{
                const { instructor, icon } = event.extendedProps;
                return (
                  <div className="flex items-center px-1 py-0.5 text-xs">
                    <span className="mr-1">{icon}</span>
                    <span className="truncate">{event.title}</span>
                    {instructor && (
                      <span className="ml-auto opacity-70">({instructor})</span>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-1/4 bg-[#1f232a] rounded shadow p-4 overflow-auto">
          <h2 className="text-2xl mb-3">Courses</h2>
          {courses.map(c=>(
            <div key={c.code} className="mb-4 border-b border-slate-700 pb-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{c.code} – {c.name}</span>
                <button
                  className="hover:text-gray-300"
                  onClick={()=>setExpandedCourse(expandedCourse===c.code?null:c.code)}
                >
                  {expandedCourse===c.code?'▲':'▼'}
                </button>
              </div>
              {expandedCourse===c.code && (
                <div className="mt-2 space-y-2 text-sm">
                  <button
                    className="w-full text-left text-red-400 hover:text-red-600"
                    onClick={()=>alert(`Remove ${c.code}`)}
                  >Remove Course</button>
                  <button
                    className="w-full text-left text-blue-400 hover:text-blue-600"
                    onClick={()=>alert(`Resources for ${c.code}`)}
                  >Recommended Resources</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Calendar;
