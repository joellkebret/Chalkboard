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

  useEffect(() => {
    const checkUserAndData = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        navigate('/login');
        return;
      }

      // Check if user has completed onboarding
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_login_complete')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error checking user status:', userError);
        return;
      }

      if (!userData?.first_login_complete) {
        navigate('/onboarding');
        return;
      }

      setUser(user);

      try {
        // Fetch user's courses
        const { data: userCourses, error: courseError } = await supabase
          .from('user_courses')
          .select('*')
          .eq('user_id', user.id);

        if (courseError) throw courseError;

        // Fetch tasks
        const { data: tasks, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);

        if (taskError) throw taskError;

        // Convert tasks to calendar events
        const weekdayMap = {
          Sunday: 0, Monday: 1, Tuesday: 2,
          Wednesday: 3, Thursday: 4, Friday: 5,
          Saturday: 6,
        };

        const calendarEvents = tasks.map((task) => {
          const course = userCourses.find(c => c.course_id === task.course_id);
          const color = course?.color_override || task.color;
          
          const baseEvent = {
            title: `${task.course_name} - ${task.task_type}`,
            extendedProps: { 
              type: task.task_type,
              courseId: task.course_id,
              courseName: task.course_name
            },
            classNames: [`bg-${color}-600`],
          };

          if (task.task_type === 'Final Exam') {
            // One-time event
            return {
              ...baseEvent,
              start: `${task.created_at.split('T')[0]}T${task.start_time}`,
              end: `${task.created_at.split('T')[0]}T${task.end_time}`,
              allDay: false,
            };
          } else {
            // Weekly recurring event
            return {
              ...baseEvent,
              daysOfWeek: Object.entries(weekdayMap)
                .filter(([day]) =>
                  task.task_type === 'Lecture' && task.course_name.includes(day)
                )
                .map(([_, index]) => index),
              startTime: task.start_time,
              endTime: task.end_time,
              startRecur: '2024-01-01',
              endRecur: '2025-12-31',
              allDay: false,
            };
          }
        });

        setEvents(calendarEvents);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      }
    };

    checkUserAndData();
  }, [navigate]);

  return (
    <section className="min-h-screen bg-[#292f36] text-white flex flex-col py-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-6 font-chalkboard">Chalkboard</h1>

      <div className="flex gap-4 justify-center mb-8">
        <button
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg"
          onClick={() => ref.current?.getApi().changeView('timeGridWeek')}
        >
          Weekly
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg"
          onClick={() => ref.current?.getApi().changeView('timeGridDay')}
        >
          Daily
        </button>
      </div>

      <div
        className="bg-[#1f232a] text-white rounded-xl shadow-xl overflow-hidden ring-1 ring-slate-700 mx-auto"
        style={{ width: `${calendarSize * 100}%`, transition: 'width 0.3s ease' }}
      >
        <FullCalendar
          ref={ref}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:30:00"
          height="auto"
          expandRows
          stickyHeaderDates
          events={events}
          eventContent={({ event }) => {
            const { type } = event.extendedProps;
            const icon =
              type === 'Lecture' ? '📘' :
              type === 'Office Hour' ? '📅' :
              type === 'Final Exam' ? '📝' : '📌';

            return (
              <div className="flex items-center px-2 py-1 text-sm">
                <span className="mr-2">{icon}</span>
                <span>{event.title}</span>
              </div>
            );
          }}
          eventClassNames={({ event }) =>
            `${event.classNames[0]} text-white rounded px-2 py-1 shadow-md hover:scale-[1.02] transition-transform`
          }
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
          views={{
            timeGridWeek: {
              slotLabelFormat: {
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }
            },
            timeGridDay: {
              slotLabelFormat: {
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }
            }
          }}
        />
      </div>
    </section>
  );
};

export default Calendar;
