import React, { useState } from 'react';
import './DocumentUpload.css';

const DocumentUpload = ({ caseId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    if (!title && e.target.files[0]) {
      setTitle(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a file to upload');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in to upload documents.');
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('document', file);
      formData.append('title', title);
      formData.append('description', description);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cases/${caseId}/documents`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Document uploaded successfully!');
        setFile(null);
        setTitle('');
        setDescription('');
        if (onUploadSuccess) onUploadSuccess(data.document);
      } else {
        setMessage(data.message || '❌ Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('⚠️ Error uploading document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="document-upload">
      <h3>Upload Document</h3>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="document">Select File:</label>
          <input
            type="file"
            id="document"
            onChange={handleFileChange}
            className="file-input"
          />
          {file && <div className="file-name">{file.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title"
            className="text-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Document description"
            className="text-area"
            rows="3"
          />
        </div>

        <button
          type="submit"
          disabled={uploading || !file}
          className="upload-button"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>

        {message && <div className="message">{message}</div>}
      </form>
    </div>
  );
};

export default DocumentUpload;
