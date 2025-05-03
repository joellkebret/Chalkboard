import React, { useState } from 'react';
import { FileUpload } from 'primereact/fileupload';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Filter = ({ onFinish }) => {
  const [manualMode, setManualMode] = useState(false);
  const [manualCourses, setManualCourses] = useState([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    lectureTime: '',
    officeHour: '',
    topic: ''
  });

  const handleUpload = (e) => {
    const file = e.files[0];
    console.log('Uploaded file:', file);
    if (onFinish) onFinish();
  };

  const handleManualCourseAdd = () => {
    if (!newCourse.name || !newCourse.lectureTime) return;
    setManualCourses(prev => [...prev, newCourse]);
    setNewCourse({ name: '', lectureTime: '', officeHour: '', topic: '' });
    setShowCourseForm(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow">
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
              <p><strong>{course.name}</strong></p>
              <p>Lecture: {course.lectureTime}</p>
              {course.officeHour && <p>Office Hour: {course.officeHour}</p>}
              {course.topic && <p>Topic: {course.topic}</p>}
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
                placeholder="Lecture time"
                className="w-full border px-3 py-2 rounded"
                value={newCourse.lectureTime}
                onChange={e => setNewCourse({ ...newCourse, lectureTime: e.target.value })}
              />
              <input
                type="text"
                placeholder="Office hour (optional)"
                className="w-full border px-3 py-2 rounded"
                value={newCourse.officeHour}
                onChange={e => setNewCourse({ ...newCourse, officeHour: e.target.value })}
              />
              <input
                type="text"
                placeholder="Topic (optional)"
                className="w-full border px-3 py-2 rounded"
                value={newCourse.topic}
                onChange={e => setNewCourse({ ...newCourse, topic: e.target.value })}
              />
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
