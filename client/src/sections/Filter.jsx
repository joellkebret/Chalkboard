import React from 'react';
import { FileUpload } from 'primereact/fileupload';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Filter = () => {
  const handleUpload = (e) => {
    const file = e.files[0];
    console.log('Uploaded file:', file);
    // ✅ Upload logic here (e.g., Supabase, Firebase, backend)
  };

  return (
    <div className="mt-32 p-10 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Upload Course Outline</h2>

      <FileUpload
        mode="advanced"
        name="course_outline"
        customUpload
        uploadHandler={handleUpload}
        accept=".pdf,.doc,.docx"
        maxFileSize={1000000}
        emptyTemplate={
          <div className="flex flex-col items-center gap-2 py-6 text-gray-500">
            <i className="pi pi-upload text-3xl" />
            <span>Choose a file</span>
          </div>
        }
        chooseLabel="Choose a file"
        className="w-full"
      />
    </div>
  );
};

export default Filter;
