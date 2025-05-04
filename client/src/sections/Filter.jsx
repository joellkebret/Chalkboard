import React, { useState, useEffect } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { supabase } from '../supabase/supabaseClient';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const Filter = () => {
  const [manualMode, setManualMode] = useState(false);
  const [manualCourses, setManualCourses] = useState([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [user, setUser] = useState(null);

  const [newCourse, setNewCourse] = useState({
    name: '',
    topic: '',
    description: '',
    lectureDays: [],
    sameTime: true,
    lectureStart: '',
    lectureEnd: '',
    lectureTimes: [],
    officeHourDays: [],
    officeHour: '',
    startDate: '',
    endDate: '',
    finalExamDate: '',
    finalExamStart: '',
    finalExamEnd: '',
  });

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error(error);
      setUser(data?.user ?? null);
    };
    getUser();
  }, []);

  const toggleLectureDay = (day) => {
    setNewCourse((prev) => ({
      ...prev,
      lectureDays: prev.lectureDays.includes(day)
        ? prev.lectureDays.filter((d) => d !== day)
        : [...prev.lectureDays, day],
    }));
  };

  const toggleOfficeHourDay = (day) => {
    setNewCourse((prev) => ({
      ...prev,
      officeHourDays: prev.officeHourDays.includes(day)
        ? prev.officeHourDays.filter((d) => d !== day)
        : [...prev.officeHourDays, day],
    }));
  };

  const handleManualCourseAdd = async () => {
    if (!user || !newCourse.name) return;

    const courseId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const { error: courseError } = await supabase.from('courses').insert([{
      id: courseId,
      course_name: newCourse.name,
      title: newCourse.topic,
      topics: newCourse.topic,
      created_at: createdAt,
    }]);

    if (courseError) {
      console.error('Course insert failed:', courseError);
      return;
    }

    const taskEntries = [];
    const lectureTimes = newCourse.sameTime
      ? newCourse.lectureDays.map(() => ({
          start: newCourse.lectureStart,
          end: newCourse.lectureEnd
        }))
      : newCourse.lectureTimes;

    newCourse.lectureDays.forEach((day, i) => {
      const time = lectureTimes[i] || {};
      taskEntries.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        course_id: courseId,
        course_name: newCourse.name,
        task_type: 'Lecture',
        start_time: time.start,
        end_time: time.end,
        color: 'blue',
        created_at: createdAt,
      });
    });

    if (newCourse.officeHour && newCourse.officeHourDays.length > 0) {
      const [h, m] = newCourse.officeHour.split(':');
      const endHour = String(Number(h) + 1).padStart(2, '0');
      const endTime = `${endHour}:${m}`;

      newCourse.officeHourDays.forEach(day => {
        taskEntries.push({
          id: crypto.randomUUID(),
          user_id: user.id,
          course_id: courseId,
          course_name: newCourse.name,
          task_type: 'Office Hour',
          start_time: newCourse.officeHour,
          end_time: endTime,
          color: 'green',
          created_at: createdAt,
        });
      });
    }

    if (newCourse.finalExamDate && newCourse.finalExamStart && newCourse.finalExamEnd) {
      taskEntries.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        course_id: courseId,
        course_name: newCourse.name,
        task_type: 'Final Exam',
        start_time: newCourse.finalExamStart,
        end_time: newCourse.finalExamEnd,
        color: 'red',
        created_at: `${newCourse.finalExamDate}T00:00:00`,
      });
    }

    const { error: taskError } = await supabase.from('tasks').insert(taskEntries);
    if (taskError) {
      console.error('Task insert failed:', taskError);
      return;
    }

    setManualCourses(prev => [...prev, newCourse]);
    setUploaded(true);
    setShowCourseForm(false);
    setNewCourse({
      name: '',
      topic: '',
      description: '',
      lectureDays: [],
      sameTime: true,
      lectureStart: '',
      lectureEnd: '',
      lectureTimes: [],
      officeHourDays: [],
      officeHour: '',
      startDate: '',
      endDate: '',
      finalExamDate: '',
      finalExamStart: '',
      finalExamEnd: '',
    });
  };

  const handleUpload = (e) => {
    const file = e.files[0];
    console.log('Uploaded file:', file);
    setUploaded(true);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-[#292f36] text-center">Upload Course Outline</h2>

      {!manualMode && (
        <>
          <FileUpload
            mode="advanced"
            name="course_outline"
            customUpload
            uploadHandler={handleUpload}
            accept=".pdf,.doc,.docx"
            maxFileSize={1000000}
            chooseLabel="Choose a file"
            uploadLabel="Upload"
            cancelLabel="Cancel"
            className="w-full"
            emptyTemplate={
              <div className="flex items-center gap-2 justify-center text-gray-500 py-4">
                <i className="pi pi-upload text-xl" />
                <span>Choose a file</span>
              </div>
            }
          />
          <p
            onClick={() => setManualMode(true)}
            className="text-sm text-center text-blue-500 mt-4 cursor-pointer hover:underline"
          >
            or enter manually instead
          </p>
        </>
      )}

      {manualMode && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-[#292f36] mb-3">Manually Enter Courses</h3>

          {manualCourses.map((course, index) => (
            <div key={index} className="bg-gray-100 rounded p-3 text-left mb-3">
              <p><strong>{course.name}</strong> ({course.topic})</p>
              <p>
                Lecture: {course.sameTime
                  ? `${course.lectureStart} - ${course.lectureEnd}`
                  : 'Varied times'} on {course.lectureDays.join(', ')}
              </p>
              {course.officeHour && (
                <p>Office Hour: {course.officeHour} on {course.officeHourDays.join(', ')}</p>
              )}
              {course.finalExamDate && (
                <p>Final Exam: {course.finalExamDate} ({course.finalExamStart} - {course.finalExamEnd})</p>
              )}
              {course.description && <p className="italic">"{course.description}"</p>}
            </div>
          ))}

          <button
            onClick={() => setShowCourseForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold mb-4"
          >
            ➕ Add Course
          </button>

          {showCourseForm && (
            <div className="bg-white p-4 rounded shadow text-left space-y-3">
              <input
                type="text"
                placeholder="Course name"
                className="w-full border px-3 py-2 rounded"
                value={newCourse.name}
                onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Topic"
                className="w-full border px-3 py-2 rounded"
                value={newCourse.topic}
                onChange={e => setNewCourse({ ...newCourse, topic: e.target.value })}
              />
              <textarea
                placeholder="Course Description"
                className="w-full border px-3 py-2 rounded"
                value={newCourse.description}
                onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
              />

              <div>
                <label className="text-sm block mb-1">Lecture Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleLectureDay(day)}
                      className={`px-3 py-1 rounded-full border ${newCourse.lectureDays.includes(day)
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600'
                        }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block mt-2 text-sm font-medium">Do all lectures have the same time?</label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={newCourse.sameTime}
                    onChange={() => setNewCourse({ ...newCourse, sameTime: true })}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={!newCourse.sameTime}
                    onChange={() => setNewCourse({ ...newCourse, sameTime: false, lectureTimes: [] })}
                  />
                  No
                </label>
              </div>

              {newCourse.sameTime ? (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm block mb-1">Lecture Start</label>
                    <input
                      type="time"
                      className="w-full border px-3 py-2 rounded"
                      value={newCourse.lectureStart}
                      onChange={e => setNewCourse({ ...newCourse, lectureStart: e.target.value })}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm block mb-1">Lecture End</label>
                    <input
                      type="time"
                      className="w-full border px-3 py-2 rounded"
                      value={newCourse.lectureEnd}
                      onChange={e => setNewCourse({ ...newCourse, lectureEnd: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                newCourse.lectureDays.map((day, i) => (
                  <div key={day} className="flex gap-2 items-center">
                    <span className="w-24">{day}</span>
                    <input
                      type="time"
                      value={newCourse.lectureTimes[i]?.start || ''}
                      onChange={(e) => {
                        const times = [...newCourse.lectureTimes];
                        times[i] = { ...(times[i] || {}), start: e.target.value };
                        setNewCourse({ ...newCourse, lectureTimes: times });
                      }}
                      className="border px-2 py-1 rounded"
                    />
                    <input
                      type="time"
                      value={newCourse.lectureTimes[i]?.end || ''}
                      onChange={(e) => {
                        const times = [...newCourse.lectureTimes];
                        times[i] = { ...(times[i] || {}), end: e.target.value };
                        setNewCourse({ ...newCourse, lectureTimes: times });
                      }}
                      className="border px-2 py-1 rounded"
                    />
                  </div>
                ))
              )}

              <div>
                <label className="text-sm block mb-1">Office Hour Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => toggleOfficeHourDay(day)}
                      className={`px-3 py-1 rounded-full border ${newCourse.officeHourDays.includes(day)
                        ? 'bg-green-500 text-white'
                        : 'text-gray-600'
                        }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm block mb-1">Office Hour Time</label>
                <input
                  type="time"
                  className="w-full border px-3 py-2 rounded"
                  value={newCourse.officeHour}
                  onChange={e => setNewCourse({ ...newCourse, officeHour: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm block mb-1">Final Exam Date</label>
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded"
                  value={newCourse.finalExamDate}
                  onChange={e => setNewCourse({ ...newCourse, finalExamDate: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm block mb-1">Start</label>
                  <input
                    type="time"
                    className="w-full border px-3 py-2 rounded"
                    value={newCourse.finalExamStart}
                    onChange={e => setNewCourse({ ...newCourse, finalExamStart: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm block mb-1">End</label>
                  <input
                    type="time"
                    className="w-full border px-3 py-2 rounded"
                    value={newCourse.finalExamEnd}
                    onChange={e => setNewCourse({ ...newCourse, finalExamEnd: e.target.value })}
                  />
                </div>
              </div>

              <button
                onClick={handleManualCourseAdd}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Save Course
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Filter;

