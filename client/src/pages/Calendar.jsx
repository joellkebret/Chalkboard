import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [calendarSize, setCalendarSize] = useState(1);
  const [modalData, setModalData] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [userCourses, setUserCourses] = useState([]);

  useEffect(() => {
    const checkUserAndData = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        navigate('/login');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_login_complete')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error checking user status:', userError);
        return;
      }

      setUser(user);

      try {
        const { data: userCoursesData, error: courseError } = await supabase
          .from('user_courses')
          .select(`*, courses (course_name, title, topics)`)
          .eq('user_id', user.id);

        if (courseError) throw courseError;

        const { data: tasks, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);

        if (taskError) throw taskError;

        const weekdayMap = {
          Sunday: 0, Monday: 1, Tuesday: 2,
          Wednesday: 3, Thursday: 4, Friday: 5,
          Saturday: 6,
        };

        const calendarEvents = tasks.map((task) => {
          const course = userCoursesData.find(c => c.course_id === task.course_id);
          const color = course?.color_override || task.color;

          const baseEvent = {
            title: `${task.course_name} - ${task.task_type}`,
            extendedProps: {
              type: task.task_type,
              courseId: task.course_id,
              courseName: task.course_name,
            },
            classNames: [`bg-${color}-600`],
          };

          if (task.task_type === 'Final Exam') {
            return {
              ...baseEvent,
              start: `${task.created_at.split('T')[0]}T${task.start_time}`,
              end: `${task.created_at.split('T')[0]}T${task.end_time}`,
              allDay: false,
            };
          }

          if (task.task_type === 'Lecture' && course?.days && course.start_date && course.end_date) {
            const daysOfWeek = course.days
              .map(day => weekdayMap[day])
              .filter(index => index !== undefined);

            return {
              ...baseEvent,
              daysOfWeek,
              startTime: task.start_time,
              endTime: task.end_time,
              startRecur: course.start_date,
              endRecur: course.end_date,
              allDay: false,
            };
          }

          return null;
        }).filter(Boolean);

        userCoursesData.forEach((course) => {
          if (course.officehours_days && course.start_date && course.end_date) {
            const daysOfWeek = course.officehours_days
              .map(day => weekdayMap[day])
              .filter(index => index !== undefined);
            if (daysOfWeek.length > 0) {
              const officeHourTask = tasks.find(
                t => t.course_id === course.course_id && t.task_type === 'Office Hour'
              );
              if (officeHourTask) {
                calendarEvents.push({
                  title: `${course.course_name} - Office Hour`,
                  daysOfWeek,
                  startTime: officeHourTask.start_time,
                  endTime: officeHourTask.end_time,
                  startRecur: course.start_date,
                  endRecur: course.end_date,
                  allDay: false,
                  classNames: ['bg-green-600'],
                  extendedProps: {
                    type: 'Office Hour',
                    courseId: course.course_id,
                    courseName: course.course_name,
                  },
                });
              }
            }
          }
        });

        setEvents(calendarEvents);
        setUserCourses(userCoursesData);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      }
    };

    checkUserAndData();
  }, [navigate]);

  const toggleOptions = (course) => {
    setShowOptions(!showOptions);
    setActiveCourse(course);
  };

  const handleSliderChange = (e) => {
    setCalendarSize(e.target.value);
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleRemoveCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to remove this course?')) return;
    try {
      await supabase.from('user_courses').delete().eq('course_id', courseId).eq('user_id', user.id);
      await supabase.from('tasks').delete().eq('course_id', courseId).eq('user_id', user.id);
      window.location.reload();
    } catch (err) {
      alert('Failed to remove course.');
    }
  };

  return (
    <section className="min-h-screen bg-[#292f36] text-white flex flex-col py-10 px-4">
      <style>
        {`
          .fc-col-header {
            background: transparent !important;
          }
          .fc-col-header-cell {
            background: transparent !important;
            color: black !important;
            z-index: 20 !important;
            position: sticky !important;
            top: 0 !important;
            padding: 8px !important;
            font-weight: bold !important;
            border-bottom: 1px solid #475569 !important;
          }
          .fc-col-header-cell-cushion {
            color: black !important;
            text-decoration: none !important;
            display: inline-block !important;
            padding: 2px 4px !important;
          }
        `}
      </style>

      <h1 className="text-6xl font-bold text-center mb-6 tracking-tight font-chalkboard">Chalkboard</h1>

      <div className="flex gap-4 justify-center mb-8 flex-wrap">
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

      <div className="flex w-full gap-4 flex-col lg:flex-row mx-auto justify-between">
        <div
          className="bg-[#1f232a] text-white rounded-xl shadow-xl overflow-hidden ring-1 ring-slate-700 flex-grow"
          style={{ width: `${calendarSize * 100}%`, transition: 'width 0.3s ease' }}
        >
          <FullCalendar
            ref={ref}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            slotDuration="00:30:00"
            height="600px"
            stickyHeaderDates={true}
            events={events}
            eventClick={(info) => setModalData(info.event)}
            eventContent={({ event }) => {
              const { type } = event.extendedProps;
              const icon =
                type === 'Lecture' ? '📘' :
                type === 'Office Hour' ? '📅' :
                type === 'Final Exam' ? '📝' : '📌';

              return (
                <div className="flex flex-col justify-between h-full px-2 py-1">
                  <div className="flex items-center text-sm font-semibold">
                    <span className="mr-2">{icon}</span>
                    <span className="truncate">{event.title}</span>
                  </div>
                </div>
              );
            }}
            eventClassNames={({ event }) =>
              `${event.classNames[0]} text-white rounded-lg px-2 py-1 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-transform bg-gradient-to-br from-blue-600 to-blue-400`
            }
            eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
            views={{
              timeGridWeek: { slotLabelFormat: { hour: 'numeric', minute: '2-digit', meridiem: 'short' } },
              timeGridDay: { slotLabelFormat: { hour: 'numeric', minute: '2-digit', meridiem: 'short' } },
            }}
            slotLaneClassNames="border-t border-slate-700"
            dayCellClassNames={(arg) => {
              return isToday(arg.date) ? 'border-r border-slate-800 today-highlight' : 'border-r border-slate-800';
            }}
            slotLabelClassNames="text-slate-400 text-sm pl-1"
            dayHeaderClassNames="fc-col-header-cell"
          />
        </div>

        <div className="flex flex-col items-center">
          <button
            className="bg-[#3c3f44] text-white rounded-full p-3 mt-6 hover:bg-[#52555b] transition"
            onClick={() => setCalendarSize(calendarSize === 1 ? 1.5 : 1)}
          >
            {calendarSize === 1 ? '➕' : '➖'}
          </button>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={calendarSize}
            onChange={handleSliderChange}
            className="mt-4 w-20"
          />
        </div>

        <div className="w-full lg:w-1/4 bg-[#1f232a] text-white rounded-xl shadow-xl p-6 overflow-y-auto mt-6 lg:mt-0">
          <h2 className="text-2xl font-bold mb-4">Courses</h2>
          {userCourses && userCourses.length > 0 ? (
            userCourses.map((course) => (
              <div key={course.course_id} className="mb-4 border-b border-slate-700 pb-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{course.course_name}</span>
                  <button
                    className="text-white hover:text-gray-300 text-lg px-2"
                    onClick={() => setExpandedCourseId(expandedCourseId === course.course_id ? null : course.course_id)}
                  >
                    {expandedCourseId === course.course_id ? '▲' : '▼'}
                  </button>
                </div>
                {expandedCourseId === course.course_id && (
                  <div className="mt-2 flex flex-col gap-2">
                    <button
                      className="text-red-400 hover:text-red-600 text-left"
                      onClick={() => handleRemoveCourse(course.course_id)}
                    >
                      Remove Course
                    </button>
                    <button
                      className="text-blue-400 hover:text-blue-600 text-left"
                      onClick={() => alert('Resources coming soon!')}
                    >
                      Resources
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-400">No courses found.</div>
          )}
        </div>
      </div>

      {modalData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={() => setModalData(null)}
        >
          <div
            className="relative w-96 h-64"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-full transition-transform duration-500 transform bg-white text-black rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-2">{modalData.title}</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {modalData.extendedProps.description || 'No description provided.'}
              </p>
              <button
                onClick={() => setModalData(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Calendar;
