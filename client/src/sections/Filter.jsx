import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from 'primereact/fileupload';
import { supabase } from '../supabase/supabaseClient';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const Filter = ({ onFinish }) => {
  const navigate = useNavigate();
  const [manualMode, setManualMode] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newCourse, setNewCourse] = useState({
    name: '',
    topic: '',
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
    difficulty: null,
    priority: null,
    weight: '',
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        navigate('/login');
        return;
      }
      setUser(user);
      await fetchCourses(user.id);
    };
    checkUser();
  }, [navigate]);

  const fetchCourses = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_courses')
        .select(`
          *,
          courses (
            course_name,
            title,
            topics
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualCourseAdd = async () => {
    if (!user || !newCourse.name) return;
    
    // Check if any required field is empty or invalid
    if (!newCourse.difficulty || !newCourse.priority || !newCourse.weight || newCourse.weight.trim() === '') {
      alert('Please fill in all required fields (credits, difficulty, and priority)');
      return;
    }

    // Convert weight to number and validate
    const weight = parseFloat(newCourse.weight);
    if (isNaN(weight) || weight <= 0) {
      alert('Please enter a valid number for credits');
      return;
    }

    const courseId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    try {
      // Insert into courses table
      const { error: courseError } = await supabase.from('courses').insert([{
        id: courseId,
        course_name: newCourse.name,
        title: newCourse.topic,
        priority: newCourse.priority,
        difficulty: newCourse.difficulty,
        weight: weight,
        topics: newCourse.topic,
        created_at: createdAt,
      }]);

      if (courseError) throw courseError;

      // Insert into user_courses table
      const { error: userCourseError } = await supabase.from('user_courses').insert([{
        id: crypto.randomUUID(),
        user_id: user.id,
        course_id: courseId,
        course_name: newCourse.name,
        priority: newCourse.priority,
        difficulty: newCourse.difficulty,
        topics: newCourse.topic,
        total_weight: weight,
        created_at: createdAt,
      }]);

      if (userCourseError) throw userCourseError;

      const taskEntries = [];
      const lectureTimes = newCourse.sameTime
        ? newCourse.lectureDays.map(() => ({
            start: newCourse.lectureStart,
            end: newCourse.lectureEnd
          }))
        : newCourse.lectureTimes;

      // Create lecture tasks
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

      // Create office hour tasks
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

      // Create final exam task
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

      // Insert all tasks
      const { error: taskError } = await supabase.from('tasks').insert(taskEntries);
      if (taskError) throw taskError;

      // Refresh courses from database
      await fetchCourses(user.id);

      // Reset form
      setShowCourseForm(false);
      setNewCourse({
        name: '',
        topic: '',
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
        difficulty: null,
        priority: null,
        weight: '',
      });

      // If onFinish prop is provided, call it
      if (onFinish) {
        onFinish();
      } else {
        // Default navigation
        navigate('/calendar');
      }

    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course. Please try again.');
    }
  };

  const handleUpload = (e) => {
    const file = e.files[0];
    console.log('Uploaded file:', file);
    setUploaded(true);
  };

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

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

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
          <h3 className="text-lg font-semibold text-[#292f36] mb-3">Your Courses</h3>

          {courses.map((course) => (
            <div key={course.id} className="bg-gray-100 rounded p-3 text-left mb-3">
              <p><strong>{course.course_name}</strong> ({course.topics})</p>
              <p>Priority: {course.priority}</p>
              <p>Difficulty: {course.difficulty}</p>
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

              <div className="space-y-4">
                <div>
                  <label className="text-sm block mb-1">Course Credits *</label>
                  <input
                    type="text"
                    placeholder="Enter credits (e.g., 0.5, 1.0, 1.5)"
                    className="w-full border px-3 py-2 rounded"
                    value={newCourse.weight}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers and one decimal point
                      if (/^\d*\.?\d*$/.test(value)) {
                        setNewCourse({ ...newCourse, weight: value });
                      }
                    }}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter a number (e.g., 0.5, 1.0, 1.5)</p>
                </div>

                <div>
                  <label className="text-sm block mb-1">Course Difficulty (1-5) *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={newCourse.difficulty || ''}
                      onChange={e => setNewCourse({ ...newCourse, difficulty: parseInt(e.target.value) })}
                      className="w-full"
                      required
                    />
                    <span className="text-sm font-medium">{newCourse.difficulty || '?'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Easy</span>
                    <span>Medium</span>
                    <span>Hard</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm block mb-1">Course Priority (1-5) *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={newCourse.priority || ''}
                      onChange={e => setNewCourse({ ...newCourse, priority: parseInt(e.target.value) })}
                      className="w-full"
                      required
                    />
                    <span className="text-sm font-medium">{newCourse.priority || '?'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              </div>

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

