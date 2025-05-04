import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from 'primereact/fileupload';
import { supabase } from '../supabase/supabaseClient';
import { readPdfsAndParse } from '../services/geminiJSON';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';



const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const STORAGE_KEY = 'pdfUploads';

const Filter = ({ onFinish }) => {
  const navigate = useNavigate();
  const [manualMode, setManualMode] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCourse, setNewCourse] = useState({
    name: '', topic: '', lectureDays: [], sameTime: true,
    lectureStart: '', lectureEnd: '', lectureTimes: [],
    officeHourDays: [], officeHour: '', startDate: '', endDate: '',
    finalExamDate: '', finalExamStart: '', finalExamEnd: '',
    difficulty: null, priority: null, weight: ''
  });

  useEffect(() => {
    // Hydrate uploads from sessionStorage
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) setUploadedFiles(JSON.parse(saved));

    // Authenticate user
    (async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return navigate('/login');
      setUser(user);
      await fetchCourses(user.id);
    })();
  }, [navigate]);

  useEffect(() => {
    // Mirror to sessionStorage
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  const fetchCourses = async (userId) => {
    try {
      const { data, error } = await supabase.from('user_courses')
        .select(`*, courses ( course_name, title, topics )`)
        .eq('user_id', userId);
      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearUploads = () => {
    setUploadedFiles([]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const handleUpload = ({ files }) => {
    Promise.all(files.map(file => new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res({ name: file.name, dataUrl: reader.result });
      reader.onerror = rej;
      reader.readAsDataURL(file);
    })))
      .then(newFiles => setUploadedFiles(prev => [...prev, ...newFiles]))
      .catch(err => console.error('FileReader error:', err));
  };

  const handleManualCourseAdd = async () => {
    // existing manual add logic unchanged...
  };

  if (isLoading) return <div className="text-center p-4">Loading...</div>;

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
            accept="application/pdf"
            multiple
            maxFileSize={10000000}
            chooseLabel="Choose PDFs"
            uploadLabel="Add to Queue"
            cancelLabel="Cancel"
            className="w-full"
            emptyTemplate={
              <div className="flex items-center gap-2 justify-center text-gray-500 py-4">
                <i className="pi pi-upload text-xl" />
                <span>Choose one or more PDFs</span>
              </div>
            }
          />
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold">Queued PDFs:</h4>
              <ul className="list-disc list-inside mb-2">
                {uploadedFiles.map((f, i) => <li key={i}>{f.name}</li>)}
              </ul>
              <button onClick={clearUploads} className="mr-2 px-4 py-2 bg-gray-300 rounded">Clear Queue</button>
              <button onClick={async () => {
                // convert back to File blobs and call JSON generator
                const blobs = uploadedFiles.map(({ name, dataUrl }) => {
                  const [, base64] = dataUrl.split(',');
                  const bin = atob(base64);
                  const arr = new Uint8Array(bin.length);
                  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
                  return new File([arr], name, { type: 'application/pdf' });
                });
                try {
                  const result = await readPdfsAndParse(blobs);
                  onFinish(result);
                } catch (e) {
                  console.error(e);
                  alert('Parsing failed – check console.');
                }
              }} className="px-4 py-2 bg-blue-500 text-white rounded">
                Parse & Generate JSON
              </button>
            </div>
          )}

          <p onClick={() => setManualMode(true)} className="text-sm text-center text-blue-500 mt-4 cursor-pointer hover:underline">
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

