import React, { useState, useEffect } from 'react';
import FileListCard from "./components/FileListCard.jsx";
import SpinnerButton from "./components/SpinnerButton.jsx";

const ImageResizer = () => {
    const sizes = [[48, 48], [72, 72], [96, 96], [144, 144], [192, 192]];

    // States
    const [files, setFiles] = useState([]);
    const [processedFiles, setProcessedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadBtn, setUploadBtn] = useState('Resize');
    const [status, setStatus] = useState('visually-hidden');

    // Effects
    useEffect(() => {
        setUploadBtn(files.length ? 'Resize' : 'Upload');
    }, [files]);

    // Handlers
    const handleFileSelect = (e) => {
        const selectedFiles = e.target.files;
        const newFiles = Array.from(selectedFiles).map(file => ({
            id: generateId(),
            file: file
        }));
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
    };

    const handleResize = async () => {
        // ... (keep the existing handleResize logic)
    };

    const resizeImage = async (image, width, height) => {
        // ... (keep the existing resizeImage logic)
    };

    const generateId = () => Math.random().toString(36).slice(2);

    const browseFiles = () => document.getElementById('upload').click();

    const deleteFile = (fileId) => {
        setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
        setProcessedFiles(prevProcessedFiles => prevProcessedFiles.filter(({ originalFile }) => originalFile.id !== fileId));
    };

    return (
        <div className="container-fluid min-vh-100">
            <h1 className="text-center mb-4 sticky-top">Image Resizer</h1>
            <div className="row ">
                <div className="card">
                    <div className="card-body text-center">
                        <div className="upload-box" onClick={browseFiles}>
                            <button type="button" className="btn btn-primary">+</button>
                        </div>
                        <input hidden id="upload" type="file" accept="image/*" onChange={handleFileSelect} multiple />
                        <SpinnerButton
                            hidden={!files.length}
                            disabled={loading}
                            onClick={handleResize}
                            status={status}
                            text={uploadBtn}
                        />
                        <div>
                            {files.map((file) => (
                                <FileListCard
                                    key={file.id}
                                    id={file.id}
                                    name={file.file.name}
                                    size={file.file.size}
                                    deleteFile={deleteFile}
                                    disabled={loading}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="card-footer text-center">
                        {processedFiles.map(({originalFile, resizedImages}) => (
                            <div key={originalFile.id}>
                                <p>{originalFile.file.name}</p>
                                {resizedImages.map((img, index) => (
                                    <img key={index} src={img} alt={`Resized ${index}`} style={{width: '50px', height: '50px', margin: '5px'}} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageResizer;
