import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Upload, FileText, Download, Minimize, Info } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReducePDFSize = () => {
  const [file, setFile] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      setCompressedSize(0);
      setCompressionProgress(0);
      
      toast({
        title: "PDF file selected",
        description: `File size: ${formatFileSize(selectedFile.size)}`,
      });
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file",
        variant: "destructive",
      });
    }
  };

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleCompress = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to compress",
        variant: "destructive",
      });
      return;
    }

    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      // Show progress animation
      const progressInterval = setInterval(() => {
        setCompressionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('compression_level', '90');

      const response = await axios.post(`${API}/compress/pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      });

      // Clear progress interval and set to 100%
      clearInterval(progressInterval);
      setCompressionProgress(100);

      // Calculate compressed size
      const compressed = response.data.size;
      setCompressedSize(compressed);

      // Get filename from response headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = `compressed_${file.name}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Download the compressed file
      downloadFile(response.data, filename);

      toast({
        title: "Compression completed!",
        description: `File size reduced by ${Math.round(((originalSize - compressed) / originalSize) * 100)}%`,
      });

    } catch (error) {
      console.error('Compression error:', error);
      const errorMessage = error.response?.data?.detail || 'An error occurred during compression';
      toast({
        title: "Compression failed",
        description: errorMessage,
        variant: "destructive",
      });
      setCompressionProgress(0);
    } finally {
      setIsCompressing(false);
    }
  };

  const resetFile = () => {
    setFile(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setCompressionProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Gradient */}
      <section className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Reduce PDF Size
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Compress your PDF files by up to 90% while maintaining quality
          </p>
        </div>
      </section>

      <div className="py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Select PDF File
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!file ? (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-600 mb-2">
                      Click to select a PDF file
                    </p>
                    <p className="text-sm text-gray-500">
                      Maximum file size: 100MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-red-600" />
                        <div>
                          <p className="font-medium text-gray-800">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            Original size: {formatFileSize(originalSize)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={resetFile}
                        disabled={isCompressing}
                      >
                        Change File
                      </Button>
                    </div>

                    {compressedSize > 0 && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Minimize className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800">Compression Complete</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Original size:</p>
                            <p className="font-medium">{formatFileSize(originalSize)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Compressed size:</p>
                            <p className="font-medium text-green-600">{formatFileSize(compressedSize)}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-green-600 font-medium">
                            Size reduced by {Math.round(((originalSize - compressedSize) / originalSize) * 100)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compression Progress */}
            {isCompressing && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Minimize className="h-5 w-5" />
                    Compressing PDF...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={compressionProgress} className="w-full" />
                    <p className="text-center text-sm text-gray-600">
                      {compressionProgress}% complete
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={handleCompress}
                  disabled={!file || isCompressing}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 shadow-lg transition-all duration-200"
                >
                  {isCompressing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Compressing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Compress & Download
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Info Section */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">How it works</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Advanced compression algorithms reduce file size</li>
                      <li>• Maintains document quality and readability</li>
                      <li>• Typically achieves 70-90% size reduction</li>
                      <li>• All processing done securely on our servers</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReducePDFSize;