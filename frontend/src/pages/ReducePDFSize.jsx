import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Upload, FileDown, Download, CheckCircle, Loader2, Minimize2 } from "lucide-react";
import { toast } from "../hooks/use-toast";
import { Toaster } from "../components/ui/toaster";

const ReducePDFSize = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processComplete, setProcessComplete] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setOriginalSize(file.size);
      setProcessComplete(false);
      setProgress(0);
      toast({
        title: "PDF uploaded successfully",
        description: `File size: ${formatFileSize(file.size)}`,
      });
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
    }
  };

  const handleCompress = async () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF file first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessComplete(false);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', uploadedFile);

      // Make API call to backend
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/compress-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Compression failed');
      }

      // Update progress to 100%
      setProgress(100);
      setIsProcessing(false);
      setProcessComplete(true);

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = `compressed_${uploadedFile.name}`;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename=(.+)/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1].replace(/"/g, '');
        }
      }

      // Create blob and download
      const blob = await response.blob();
      
      // Calculate compressed size (actual size from response)
      setCompressedSize(blob.size);
      
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Compression completed",
        description: `${fileName} has been downloaded successfully`,
      });

    } catch (error) {
      setIsProcessing(false);
      setProcessComplete(false);
      setProgress(0);
      
      toast({
        title: "Compression failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setProcessComplete(false);
    setProgress(0);
    setOriginalSize(0);
    setCompressedSize(0);
  };

  const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Toaster />
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-white drop-shadow-lg">PDF Size Reducer</h1>
        <p className="text-xl text-white/90 max-w-2xl mx-auto">
          Compress your PDF files by up to 90% while maintaining quality
        </p>
      </div>

      {/* Upload Section */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Upload className="w-6 h-6 mr-3" />
            Upload PDF File
          </CardTitle>
          <CardDescription className="text-white/80">
            Select a PDF file to compress and reduce its size
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-white/40 rounded-lg p-8 text-center hover:border-white/60 transition-colors">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer">
              <FileDown className="w-12 h-12 mx-auto mb-4 text-white/70" />
              <p className="text-white mb-2">Click to upload PDF file</p>
              <p className="text-white/70 text-sm">Maximum file size: 100MB</p>
            </label>
          </div>

          {/* Uploaded File Display */}
          {uploadedFile && (
            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Uploaded File</span>
                <Button
                  onClick={clearFile}
                  size="sm"
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/20"
                >
                  Remove
                </Button>
              </div>
              <div className="flex items-center bg-white/10 rounded p-3">
                <FileDown className="w-6 h-6 mr-3 text-red-300" />
                <div className="flex-1">
                  <p className="text-white font-medium truncate">{uploadedFile.name}</p>
                  <p className="text-white/70 text-sm">Size: {formatFileSize(originalSize)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compression Info */}
      {uploadedFile && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Minimize2 className="w-6 h-6 mr-3" />
              Compression Details
            </CardTitle>
            <CardDescription className="text-white/80">
              Expected compression results for your PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/70 text-sm">Original Size</p>
                <p className="text-white text-xl font-bold">{formatFileSize(originalSize)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/70 text-sm">Estimated Compressed Size</p>
                <p className="text-green-300 text-xl font-bold">{formatFileSize(Math.floor(originalSize * 0.1))}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/70 text-sm">Size Reduction</p>
                <p className="text-yellow-300 text-xl font-bold">~90%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compress Button */}
      <div className="text-center">
        <Button
          onClick={handleCompress}
          disabled={!uploadedFile || isProcessing}
          size="lg"
          className="bg-white text-purple-600 hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg px-8 py-3"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Compressing...
            </>
          ) : processComplete ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Compression Complete
            </>
          ) : (
            <>
              <Minimize2 className="w-5 h-5 mr-2" />
              Compress PDF
            </>
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      {(isProcessing || processComplete) && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-white">
                <span>Compression Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-white/80 text-sm">
                {isProcessing 
                  ? "Compressing your PDF file..."
                  : `Compression completed! Reduced size by ${compressionRatio}%`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {processComplete && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-green-300" />
              Compression Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-white font-semibold">Before Compression</h4>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white">{uploadedFile.name}</p>
                  <p className="text-white/70 text-sm">{formatFileSize(originalSize)}</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-white font-semibold">After Compression</h4>
                <div className="bg-green-500/20 rounded-lg p-3">
                  <p className="text-white">compressed_{uploadedFile.name}</p>
                  <p className="text-green-300 text-sm">{formatFileSize(compressedSize)} ({compressionRatio}% reduction)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReducePDFSize;
