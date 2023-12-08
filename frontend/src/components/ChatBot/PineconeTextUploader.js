import React, { useState } from 'react';
import axios from 'axios';

function PineconeTextUploader() {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsUploading(true);
            // Read the text file here and process it as needed
            const text = await file.text();
            // Here you would interact with the Pinecone API
            // Replace this URL with your Pinecone API endpoint
            const response = await axios.post('https://api.pinecone.io/your-endpoint', { data: text });
            console.log(response.data);
            setIsUploading(false);
        } catch (error) {
            console.error('Error uploading file:', error);
            setIsUploading(false);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleFileUpload} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
}

export default PineconeTextUploader;
