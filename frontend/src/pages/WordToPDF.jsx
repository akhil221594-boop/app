import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Upload, FileText, Download, Trash2, Settings, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WordToPDF = () => {
  const [files, setFiles] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [singlePDF, setSinglePDF] = useState(true);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const wordFiles = selectedFiles.filter(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.toLowerCase().endsWith('.docx')
    );
    
    if (wordFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Please select only .docx files",
        variant: "destructive",
      });
    }
    
    if (wordFiles.length > 0) {
      setFiles(prev => [...prev, ...wordFiles]);
      toast({
        title: "Files added successfully",
        description: `${wordFiles.length} file(s) added for conversion`,
      });
    }
  };

  const clearAllFiles = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "All files cleared",
      description: "Conversion list has been cleared",
    });
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

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select Word files to convert",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('single_pdf', singlePDF.toString());

      const response = await axios.post(`${API}/convert/word-to-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = 'converted-documents';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      downloadFile(response.data, filename);
      
      toast({
        title: "Conversion completed!",
        description: singlePDF 
          ? `${files.length} files merged into a single PDF`
          : `${files.length} PDF files packaged in ZIP`,
      });
      
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Conversion error:', error);
      const errorMessage = error.response?.data?.detail || 'An error occurred during conversion';
      toast({
        title: "Conversion failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Gradient */}
      <section className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Word to PDF Converter
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Convert your Word documents (.docx) to PDF format while preserving all formatting and images
          </p>
        </div>
      </section>

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Upload Section */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Word Files
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-600 mb-2">
                    Click to select Word files
                  </p>
                  <p className="text-sm text-gray-500">
                    Support for .docx files with text and images
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {files.length > 0 && (
                  <div className="flex items-center justify-between mt-4 p-3 bg-gray-100 rounded-md">
                    <h3 className="font-medium text-gray-700">
                      Files Selected: {files.length}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFiles}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings & Convert Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Conversion Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {singlePDF && <CheckCircle className="h-4 w-4 text-green-600" />}
                        <Label htmlFor="single-pdf" className="text-sm font-medium cursor-pointer">
                          Single PDF
                        </Label>
                      </div>
                      <Switch
                        id="single-pdf"
                        checked={singlePDF}
                        onCheckedChange={setSinglePDF}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {!singlePDF && <CheckCircle className="h-4 w-4 text-green-600" />}
                        <Label htmlFor="zip-pdf" className="text-sm font-medium cursor-pointer">
                          Multiple PDFs in ZIP
                        </Label>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {singlePDF
                      ? 'Merge all documents into one PDF file'
                      : 'Convert each document separately and package in ZIP'
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Convert Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={handleConvert}
                    disabled={files.length === 0 || isConverting}
                    className="w-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:opacity-90 text-white font-semibold py-3 shadow-lg transition-all duration-200"
                  >
                    {isConverting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Converting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Convert to PDF
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Features Section with Gradient Background */}
              <Card className="border-none bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                <CardContent className="pt-6 text-center text-white">
                  <h3 className="font-semibold mb-2">Features</h3>
                  <ul className="text-sm space-y-1">
                    <li>✓ Preserves all formatting</li>
                    <li>✓ Maintains image quality</li>
                    <li>✓ Fast conversion</li>
                    <li>✓ Secure processing</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordToPDF;
