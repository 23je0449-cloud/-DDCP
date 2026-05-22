import { BACKEND_URL, CLOUDFRONT_URL } from '../utilis';
import axios from 'axios';
import { useState } from 'react';

export function UploadImage({ onImageAdded, image }) {
  const [uploading, setUploading] = useState(false);

  async function onFileSelect(e) {
    setUploading(true);
    try {
      const file = e.target.files[0];
      const response = await axios.get(`${BACKEND_URL}/v1/user/presignedUrl`, {
        headers: { Authorization: localStorage.getItem('token') }
      });

      const formData = new FormData();
      Object.entries(response.data.fields).forEach(([key, value]) => {
        formData.set(key, value);
      });
      formData.append('file', file);
      await axios.post(response.data.preSignedUrl, formData);

      onImageAdded(`${CLOUDFRONT_URL}/${response.data.fields['key']}`);
    } catch (e) {
      console.error(e);
    }
    setUploading(false);
  }

  if (image) {
    return null; // Handled in parent component now
  }

  return (
    <div className="relative group">
      <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
        {uploading ? (
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-6 w-6 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm text-gray-500">Uploading...</span>
          </div>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="mt-2 text-sm text-gray-500 group-hover:text-blue-500">Click to upload</span>
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={onFileSelect}
              accept="image/*"
            />
          </>
        )}
      </div>
    </div>
  );
}