# PDF Tools Backend Integration Contracts

## API Endpoints to Implement

### 1. Word to PDF Conversion
- **POST** `/api/convert/word-to-pdf`
- **Request**: Multipart form data with multiple .docx files
- **Body**: 
  - `files[]`: Array of .docx files
  - `single_pdf`: boolean (true = merge into single PDF, false = individual PDFs in ZIP)
- **Response**: PDF file or ZIP file for download

### 2. PDF Compression
- **POST** `/api/compress/pdf`
- **Request**: Multipart form data with single PDF file
- **Body**:
  - `file`: PDF file to compress
  - `compression_level`: number (default 90% reduction)
- **Response**: Compressed PDF file for download

## Frontend Mock Data to Replace

### WordToPDF.jsx
- Remove mock conversion simulation
- Replace with actual API call to `/api/convert/word-to-pdf`
- Handle real file upload and download response
- Fix toggle functionality for single PDF vs ZIP

### ReducePDFSize.jsx
- Remove mock compression simulation  
- Replace with actual API call to `/api/compress/pdf`
- Handle real PDF file processing and download

## Backend Implementation Requirements

### Dependencies Needed
- `python-multipart` - For file uploads
- `python-docx` or `pandoc` - For Word to PDF conversion
- `PyPDF2` or `pypdf` - For PDF manipulation and compression
- `reportlab` - For PDF generation if needed
- `zipfile` - For creating ZIP archives

### File Processing
1. **Word to PDF**: Convert .docx files preserving text and images
2. **PDF Compression**: Reduce file size by ~90% while maintaining quality
3. **File Handling**: Proper cleanup of temporary files
4. **Error Handling**: Validate file types and handle conversion errors

### Response Handling
- Return actual file downloads with proper headers
- Set correct MIME types for PDF and ZIP files
- Handle both single file and ZIP archive responses

## Design Updates Needed

### Apply Gradient Background
- Add `bg-gradient-to-r from-purple-400 via-pink-500 to-red-500` to:
  - Image to PDF page
  - PDF Merger page  
  - EMI Calculator page
  - Reduce PDF Size page (hero section)

### Toggle Enhancement
- Ensure toggle state is properly managed
- Clear visual indication of current selection
- Update helper text based on selection

## Integration Steps
1. Install required Python packages
2. Create backend endpoints
3. Update frontend to call real APIs
4. Apply consistent gradient backgrounds
5. Test file upload/download functionality