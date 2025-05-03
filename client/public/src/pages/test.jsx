import React from 'react';
import Dropbox from '../components/dropbox';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const TestPage = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">File Upload Test Page</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
                <Dropbox />
            </div>
        </div>
    );
};

export default TestPage;
