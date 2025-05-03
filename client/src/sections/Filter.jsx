import React, { useState } from 'react';
import { FileUpload } from 'primereact/fileupload';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { processOutlineData } from '../outlineToDB.js';

const Filter = () => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const files = e.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    // Append all files to FormData
    files.forEach((file, index) => {
      formData.append(`course_outline_${index}`, file);
    });

    try {
      const response = await fetch('http://localhost:5000/api/process-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process PDFs');
      }

      const data = await response.json();
      console.log('Processed data:', data);
      
      // Pass the data to outlineToDB for further processing
      processOutlineData(data);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-32 p-10 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Upload Course Outlines</h2>

      <FileUpload
        mode="advanced"
        name="course_outline"
        customUpload
        uploadHandler={handleUpload}
        accept=".pdf"
        maxFileSize={1000000}
        multiple
        emptyTemplate={
          <div className="flex flex-col items-center gap-2 py-6 text-gray-500">
            <i className="pi pi-upload text-3xl" />
            <span>Choose files</span>
          </div>
        }
        chooseLabel="Choose files"
        className="w-full"
        disabled={uploading}
      />
      {uploading && (
        <div className="mt-4 text-center text-blue-600">
          Processing PDFs...
        </div>
      )}
    </div>
  );
};

export default Filter;
