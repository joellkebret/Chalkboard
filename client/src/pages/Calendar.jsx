import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import { supabase } from '../supabase/supabaseClient';
import '../index.css';

const Calendar = () => {
  const ref = useRef(null);
  const [events, setEvents] = useState([]);
  const [userId, setUserId] = useState(null);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Failed to fetch user:', userError);
        return;
      }

      const user = userData.user;
      setUserId(user.id);

      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (taskError) {
        console.error('Error fetching tasks:', taskError);
        return;
      }

      const calendarEvents = tasks.map(task => {
        const today = new Date();
        const dayIndex = today.getDay(); // fallback day
        const startDateTime = `${today.toISOString().split('T')[0]}T${task.start_time}`;
        const endDateTime = `${today.toISOString().split('T')[0]}T${task.end_time}`;

        return {
          id: task.id,
          title: `${task.course_name} - ${task.task_type}`,
          start: startDateTime,
          end: endDateTime,
          extendedProps: {
            type: task.task_type,
            color: task.color,
          },
          classNames: [`bg-${task.color}-600`], // tailwind color utility
        };
      });

      setEvents(calendarEvents);
    };

    fetchUserAndTasks();
  }, []);

  return (
    <section className="min-h-screen bg-[#292f36] text-white flex flex-col py-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Calendar</h1>

      <div className="flex justify-center gap-4 mb-6">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => ref.current?.getApi().changeView('timeGridWeek')}
        >
          Weekly
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => ref.current?.getApi().changeView('timeGridDay')}
        >
          Daily
        </button>
      </div>

      <div className="bg-white text-black rounded-xl shadow-xl max-w-6xl mx-auto w-full overflow-hidden">
        <FullCalendar
          ref={ref}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          height="auto"
          events={events}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
          eventContent={({ event }) => {
            const { type } = event.extendedProps;
            const icon =
              type === 'Lecture' ? '📘' :
              type === 'Office Hour' ? '📅' :
              type === 'Final Exam' ? '📝' :
              '📌';

            return (
              <div className="flex items-center px-2 py-1">
                <span className="mr-2">{icon}</span>
                <span className="text-sm truncate">{event.title}</span>
              </div>
            );
          }}
          eventClick={(info) => setModalData(info.event)}
          eventClassNames={({ event }) =>
            `${event.classNames[0]} text-white rounded px-2 py-1 shadow-md hover:shadow-lg`
          }
        />
      </div>

      {modalData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={() => setModalData(null)}
        >
          <div className="bg-white text-black p-6 rounded-xl shadow-xl w-96" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2">{modalData.title}</h3>
            <p className="text-sm">
              Type: {modalData.extendedProps.type}
            </p>
            <button
              onClick={() => setModalData(null)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Calendar;
