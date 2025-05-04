import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from 'primereact/fileupload';
import { supabase } from '../supabase/supabaseClient';
import { readPdfsAndParse } from '../services/geminiJSON';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// For generating UUIDs
const crypto = window.crypto;

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
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
      setError('Failed to fetch courses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearUploads = () => {
    setUploadedFiles([]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const handleUpload = async ({ files }) => {
    try {
      setError(null);
      setIsProcessing(true);
      
      // Add files to state
      setUploadedFiles(prev => [...prev, ...files]);
      
      // Process files
      const { courses: parsedCourses } = await readPdfsAndParse(files);
      
      // Process each course and create in database
      for (const course of parsedCourses) {
        // Create course with UUID
        const courseId = crypto.randomUUID();
        const { error: courseError } = await supabase
          .from('courses')
          .insert({
            id: courseId,
            course_name: course.courseName,
            title: course.courseName,
            topics: course.topics.join(', '),
            priority: 3,
            difficulty: 3,
            weight: 100
          });

        if (courseError) throw courseError;

        // Link course to user with UUID
        const userCourseId = crypto.randomUUID();
        const { error: linkError } = await supabase
          .from('user_courses')
          .insert({
            id: userCourseId,
            user_id: user.id,
            course_id: courseId,
            course_name: course.courseName,
            priority: 3,
            difficulty: 3,
            topics: course.topics.join(', '),
            total_weight: 100,
            color_override: '#4a90e2'
          });

        if (linkError) throw linkError;

        // Create tasks for each topic as study sessions
        for (const topic of course.topics) {
          const taskId = crypto.randomUUID();
          const { error: taskError } = await supabase
            .from('tasks')
            .insert({
              id: taskId,
              user_id: user.id,
              course_id: courseId,
              course_name: course.courseName,
              task_type: 'study',
              color: '#4a90e2'
            });

          if (taskError) throw taskError;
        }

        // Create tasks for lecture times
        if (course.lectureTimes && course.lectureTimes.length > 0) {
          for (const lectureTime of course.lectureTimes) {
            const [day, time] = lectureTime.match(/([A-Z]+)(\d{4}-\d{4})/).slice(1);
            const [start, end] = time.split('-').map(t => 
              t.replace(/(\d{2})(\d{2})/, '$1:$2:00')
            );

            const taskId = crypto.randomUUID();
            const { error: lectureError } = await supabase
              .from('tasks')
              .insert({
                id: taskId,
                user_id: user.id,
                course_id: courseId,
                course_name: course.courseName,
                task_type: 'lecture',
                start_time: start,
                end_time: end,
                color: '#2ecc71'
              });

            if (lectureError) throw lectureError;
          }
        }

        // Create tasks for office hours
        if (course.officeHours && course.officeHours.length > 0) {
          for (const officeHour of course.officeHours) {
            const [day, time] = officeHour.match(/([A-Z]+)(\d{4}-\d{4})/).slice(1);
            const [start, end] = time.split('-').map(t => 
              t.replace(/(\d{2})(\d{2})/, '$1:$2:00')
            );

            const taskId = crypto.randomUUID();
            const { error: ohError } = await supabase
              .from('tasks')
              .insert({
                id: taskId,
                user_id: user.id,
                course_id: courseId,
                course_name: course.courseName,
                task_type: 'office_hours',
                start_time: start,
                end_time: end,
                color: '#e74c3c'
              });

            if (ohError) throw ohError;
          }
        }
      }

      // Refresh courses
      await fetchCourses(user.id);
      onFinish();
    } catch (error) {
      console.error('Error processing PDFs:', error);
      setError('Failed to process PDFs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualCourseAdd = async () => {
    // existing manual add logic unchanged...
  };

  if (isLoading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-[#292f36] text-center">Upload Course Outline</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {!manualMode && (
        <>
          <div className="mb-6">
            <FileUpload
              name="pdfs"
              accept=".pdf"
              maxFileSize={10000000}
              multiple
              customUpload
              uploadHandler={handleUpload}
              emptyTemplate={
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg">
                  <i className="pi pi-cloud-upload text-4xl text-blue-500 mb-2" />
                  <p className="text-gray-600">Drag and drop PDFs here or click to browse</p>
                </div>
              }
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Uploaded Files:</h3>
              <ul className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>{file.name}</span>
                    <button
                      onClick={() => {
                        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
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
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add New Course
          </button>
        </div>
      )}
    </div>
  );
};

export default Filter;

