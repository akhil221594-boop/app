import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { PDFDocument } from 'pdf-lib';

const PDFMerger = () => {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedFile, setMergedFile] = useState(null);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files).filter(file => file.type === 'application/pdf');
    if (newFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      setMergedFile(null); // Reset merged file status
    } else {
      alert('Please upload valid PDF files.');
    }
  };

  const downloadFile = (file, fileName) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const mergePDFs = async (pdfFiles) => {
    const mergedPdf = await PDFDocument.create();

    for (const file of pdfFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfFile = await mergedPdf.save();
    return new Blob([mergedPdfFile], { type: 'application/pdf' });
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert('Please upload at least two PDF files to merge.');
      return;
    }
    setIsMerging(true);

    try {
      const mergedBlob = await mergePDFs(files);
      setMergedFile({ blob: mergedBlob, name: `merged_document_${Date.now()}.pdf` });
    } catch (err) {
      alert('Error during merging: ' + err.message);
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (mergedFile) {
      downloadFile(mergedFile.blob, mergedFile.name);
    }
  };

  return (
    <div className="merger-page py-16 px-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 min-h-screen">
      <section className="tool-section bg-white bg-opacity-20 p-8 md:p-12 rounded-lg shadow-lg max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Effortlessly Merge Multiple PDFs</h2>
        <div className="file-upload-area border-2 border-dashed border-white rounded-lg p-10 mb-6 hover:bg-white hover:bg-opacity-30 transition duration-300">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center text-white">
            <FaPlus className="text-white text-5xl mb-4" />
            <p className="text-white font-medium">
              Drag and drop your PDF files here, or{' '}
              <span className="text-yellow-400 font-semibold underline">click to browse</span>.
            </p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="file-list bg-white bg-opacity-40 p-4 rounded-md mb-6">
            <p className="text-black font-semibold">Files to Merge: {files.length}</p>
          </div>
        )}

        {!mergedFile ? (
          <button
            onClick={handleMerge}
            className={`w-full md:w-auto font-bold py-3 px-12 rounded-lg shadow-md transition duration-300 ${
              isMerging ? 'bg-gray-400 cursor-not-allowed text-gray-700' : 'bg-yellow-400 hover:bg-yellow-500 transform hover:scale-105 text-gray-900'
            }`}
            disabled={isMerging}
          >
            {isMerging ? 'Merging...' : 'Merge PDFs'}
          </button>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-green-400 font-semibold mb-2">Merging Complete! ✅</p>
            <button
              onClick={handleDownload}
              className="bg-green-400 text-gray-900 font-bold py-3 px-12 rounded-lg shadow-md hover:bg-green-500 transition duration-300 transform hover:scale-105"
            >
              Download Merged PDF
            </button>
          </div>
        )}
      </section>

      <section className="merger-benefits text-center py-12">
        <h3 className="text-3xl font-bold text-white mb-8">Key Benefits of Our Merger</h3>
        <ul className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-white text-lg">
          <li className="bg-white bg-opacity-20 p-6 rounded-lg shadow-md">Maintain original quality and formatting.</li>
          <li className="bg-white bg-opacity-20 p-6 rounded-lg shadow-md">Rearrange pages before merging.</li>
          <li className="bg-white bg-opacity-20 p-6 rounded-lg shadow-md">No file size limitations.</li>
        </ul>
      </section>
    </div>
  );
};

export default PDFMerger;
