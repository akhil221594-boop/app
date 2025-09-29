import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Upload, FileText, Download, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "../hooks/use-toast";
import { Toaster } from "../components/ui/toaster";

const WordToPDF = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [singlePDF, setSinglePDF] = useState(true);
  const [processComplete, setProcessComplete] = useState(false);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files).filter(file =>
      file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')
    );

    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      toast({
        title: "Files uploaded successfully",
        description: `Added ${files.length} Word document(s)`,
      });
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload Word documents (.docx, .doc)",
        variant: "destructive",
      });
    }
  };

  const handleConvert = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload Word documents first",
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

      // Add all files to FormData
      uploadedFiles.forEach((file) => {
        formData.append('files', file);
      });

      // Add output type
      formData.append('output_type', singlePDF ? 'single' : 'multiple');

      // Make API call to backend
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/convert-word-to-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Conversion failed');
      }

      // Update progress to 100%
      setProgress(100);
      setIsProcessing(false);
      setProcessComplete(true);

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = singlePDF ? "converted-documents.pdf" : "converted-documents.zip";

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename=(.+)/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1].replace(/"/g, '');
        }
      }

      // Create blob and download
      const blob = await response.blob();
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
        title: "Conversion completed",
        description: `${fileName} has been downloaded successfully`,
      });

    } catch (error) {
      setIsProcessing(false);
      setProcessComplete(false);
      setProgress(0);

      toast({
        title: "Conversion failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setUploadedFiles([]);
    setProcessComplete(false);
    setProgress(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-6 rounded-lg">
      <Toaster />

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-white drop-shadow-lg">Word to PDF Converter</h1>
        <p className="text-xl text-white/90 max-w-2xl mx-auto">
          Convert your Word documents to PDF while preserving layout, images, and formatting
        </p>
      </div>

      {/* Upload Section */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Upload className="w-6 h-6 mr-3" />
            Upload Word Documents
          </CardTitle>
          <CardDescription className="text-white/80">
            Select multiple Word files (.docx, .doc) to convert to PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-white/40 rounded-lg p-8 text-center hover:border-white/60 transition-colors">
            <input
              type="file"
              multiple
              accept=".docx,.doc"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-white/70" />
              <p className="text-white mb-2">Click to upload Word documents</p>
              <p className="text-white/70 text-sm">Supports .docx and .doc files</p>
            </label>
          </div>

          {/* Uploaded Files Display */}
          {uploadedFiles.length > 0 && (
            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">
                  {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
                </span>
                <Button
                  onClick={clearAll}
                  size="sm"
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/20"
                >
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {uploadedFiles.slice(0, 4).map((file, index) => (
                  <div key={index} className="flex items-center bg-white/10 rounded p-2">
                    <FileText className="w-4 h-4 mr-2 text-blue-300" />
                    <span className="text-white text-sm truncate flex-1">
                      {file.name}
                    </span>
                    <Button
                      onClick={() => removeFile(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-300 hover:text-red-200 p-1 h-auto"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                {uploadedFiles.length > 4 && (
                  <div className="text-white/70 text-sm p-2">
                    +{uploadedFiles.length - 4} more files
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Options */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Output Options</CardTitle>
          <CardDescription className="text-white/80">
            Choose how you want to receive your converted files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <Switch
              id="output-mode"
              checked={singlePDF}
              onCheckedChange={setSinglePDF}
            />
            <Label htmlFor="output-mode" className="text-white">
              {singlePDF ? "Single PDF (merge all files)" : "Multiple PDFs in ZIP"}
            </Label>
          </div>
          <p className="text-white/70 text-sm mt-2">
            {singlePDF
              ? "All Word documents will be merged into one PDF file"
              : "Each Word document will be converted to a separate PDF and packaged in a ZIP file"
            }
          </p>
        </CardContent>
      </Card>

      {/* Convert Button */}
      <div className="text-center">
        <Button
          onClick={handleConvert}
          disabled={uploadedFiles.length === 0 || isProcessing}
          size="lg"
          className="bg-white text-purple-600 hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg px-8 py-3"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Converting...
            </>
          ) : processComplete ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Conversion Complete
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Convert to PDF
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
                <span>Conversion Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-white/80 text-sm">
                {isProcessing
                  ? "Converting your documents to PDF..."
                  : "Conversion completed! Your file is being downloaded."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WordToPDF;
