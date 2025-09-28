import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Upload, FileText, Download, Trash2, Settings } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

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

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "File removed",
      description: "File has been removed from the conversion list",
    });
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
    
    // Mock conversion process
    try {
      // Simulate conversion time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock download
      if (singlePDF) {
        // Single PDF download
        const link = document.createElement('a');
        link.href = 'data:application/pdf;base64,'; // Mock PDF data
        link.download = 'converted-documents.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Conversion completed!",
          description: `${files.length} files merged into a single PDF`,
        });
      } else {
        // ZIP download simulation
        const link = document.createElement('a');
        link.href = 'data:application/zip;base64,'; // Mock ZIP data
        link.download = 'converted-documents.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Conversion completed!",
          description: `${files.length} PDF files packaged in ZIP`,
        });
      }
      
      // Clear files after successful conversion
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "An error occurred during conversion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Word to PDF Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert your Word documents (.docx) to PDF format while preserving all formatting and images
          </p>
        </div>

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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-700">
                      Selected Files ({files.length})
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
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-100 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-700 truncate max-w-xs">
                            {file.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="single-pdf" className="text-sm font-medium">
                    {singlePDF ? 'Single PDF' : 'Multiple PDFs in ZIP'}
                  </Label>
                  <Switch
                    id="single-pdf"
                    checked={singlePDF}
                    onCheckedChange={setSinglePDF}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {singlePDF
                    ? 'Merge all documents into one PDF file'
                    : 'Convert each document separately and package in ZIP'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={handleConvert}
                  disabled={files.length === 0 || isConverting}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 shadow-lg transition-all duration-200"
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

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="font-semibold text-blue-800 mb-2">Features</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>✓ Preserves all formatting</li>
                    <li>✓ Maintains image quality</li>
                    <li>✓ Fast conversion</li>
                    <li>✓ Secure processing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordToPDF;