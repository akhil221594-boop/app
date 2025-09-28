import React, { useState } from 'react';
import { FaUpload, FaFileImage } from 'react-icons/fa';
import JSZip from 'jszip';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

// Helper to convert image file to JPEG data URL
const fileToJPEGDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const jpegDataUrl = canvas.toDataURL('image/jpeg', 1.0);
        resolve({ dataUrl: jpegDataUrl, width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ImageToPDFPage = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isMultipleFiles, setIsMultipleFiles] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
    setConvertedFile(null);
  };

  // Updated conversion logic that guarantees no image part is cut
  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one image file first.');
      return;
    }
    setIsConverting(true);

    try {
      if (isMultipleFiles) {
        // Separate PDF for each image, packaged in a ZIP
        const zip = new JSZip();
        for (const file of selectedFiles) {
          const pdf = new jsPDF();
          const { dataUrl, width, height } = await fileToJPEGDataURL(file);

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          // Calculate scaling and centering
          const scale = Math.min(pdfWidth / width, pdfHeight / height);
          const imgWidth = width * scale;
          const imgHeight = height * scale;
          const x = (pdfWidth - imgWidth) / 2;
          const y = (pdfHeight - imgHeight) / 2;

          pdf.addImage(dataUrl, 'JPEG', x, y, imgWidth, imgHeight);
          const pdfBlob = pdf.output('blob');
          zip.file(file.name.replace(/\.[^/.]+$/, '') + '.pdf', pdfBlob);
        }
        const content = await zip.generateAsync({ type: 'blob' });
        setConvertedFile({ blob: content, name: 'converted_images.zip' });
      } else {
        // All images merged into one PDF
        const pdf = new jsPDF();
        for (let i = 0; i < selectedFiles.length; i++) {
          const { dataUrl, width, height } = await fileToJPEGDataURL(selectedFiles[i]);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          const scale = Math.min(pdfWidth / width, pdfHeight / height);
          const imgWidth = width * scale;
          const imgHeight = height * scale;
          const x = (pdfWidth - imgWidth) / 2;
          const y = (pdfHeight - imgHeight) / 2;

          if (i > 0) pdf.addPage();
          pdf.addImage(dataUrl, 'JPEG', x, y, imgWidth, imgHeight);
        }
        const pdfBlob = pdf.output('blob');
        setConvertedFile({ blob: pdfBlob, name: `images_${Date.now()}.pdf` });
      }
    } catch (e) {
      alert('Conversion failed: ' + e.message);
    }
    setIsConverting(false);
  };

  const handleDownload = () => {
    if (convertedFile) {
      saveAs(convertedFile.blob, convertedFile.name);
    }
  };

  return (
    <div className="converter-page py-16 px-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 min-h-screen">
      <section className="tool-section bg-white bg-opacity-20 p-8 md:p-12 rounded-lg shadow-lg max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Image to PDF Converter</h2>
        <div className="file-upload-area border-2 border-dashed border-white rounded-lg p-10 mb-6 hover:bg-white hover:bg-opacity-30 transition duration-300 cursor-pointer">
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept="image/*"
            multiple
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center text-white">
            <FaUpload className="text-white text-5xl mb-4" />
            <p className="font-medium">
              Drag and drop images here, or{' '}
              <span className="text-yellow-400 font-semibold underline">click to browse</span>.
            </p>
          </label>
        </div>
        {selectedFiles.length > 0 && (
          <div className="bg-white bg-opacity-40 p-4 rounded-md mb-6">
            <p className="text-white">
              Selected Images:{' '}
              <span className="font-semibold">{selectedFiles.length} files selected</span>
            </p>
          </div>
        )}
        <div className="flex items-center justify-center mb-6 text-white">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isMultipleFiles}
              onChange={(e) => setIsMultipleFiles(e.target.checked)}
              className="form-checkbox text-yellow-400 rounded-lg h-5 w-5"
            />
            <span className="ml-2 font-semibold">
              Download separate PDFs in a single ZIP file
            </span>
          </label>
        </div>
        {!convertedFile ? (
          <button
            onClick={handleConvert}
            disabled={isConverting || selectedFiles.length === 0}
            className={`w-full md:w-auto font-bold py-3 px-12 rounded-lg shadow-md transition duration-300 ${
              isConverting
                ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                : 'bg-yellow-400 hover:bg-yellow-500 transform hover:scale-105 text-gray-900'
            }`}
          >
            {isConverting ? 'Converting...' : 'Convert Images'}
          </button>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-green-400 font-semibold mb-2">Conversion Complete! ✅</p>
            <button
              onClick={handleDownload}
              className="bg-green-400 text-gray-900 font-bold py-3 px-12 rounded-lg shadow-md hover:bg-green-500 transition duration-300 transform hover:scale-105"
            >
              Download
            </button>
          </div>
        )}
      </section>
      <section className="supported-formats text-center py-12 text-white">
        <h3 className="text-3xl font-bold mb-8">Supported Formats</h3>
        <div className="flex justify-center space-x-8">
          <div className="flex flex-col items-center">
            <FaFileImage className="text-blue-500 text-6xl mb-2" />
            <span className="font-medium">Image</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ImageToPDFPage;
