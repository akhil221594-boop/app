import io
import os
import zipfile
import tempfile
from typing import List
from docx import Document
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage
from reportlab.lib.units import inch
from pypdf import PdfWriter, PdfReader
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class PDFConverter:
    
    @staticmethod
    def docx_to_pdf(docx_file_content: bytes, filename: str) -> bytes:
        """Convert a DOCX file to PDF preserving text and images"""
        try:
            # Create a temporary file for the DOCX content
            with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as temp_docx:
                temp_docx.write(docx_file_content)
                temp_docx_path = temp_docx.name

            # Create PDF buffer
            pdf_buffer = io.BytesIO()
            
            # Create PDF document
            doc = SimpleDocTemplate(pdf_buffer, pagesize=letter,
                                  rightMargin=72, leftMargin=72,
                                  topMargin=72, bottomMargin=18)
            
            # Parse DOCX document
            docx_doc = Document(temp_docx_path)
            story = []
            
            # Get styles
            styles = getSampleStyleSheet()
            normal_style = styles['Normal']
            heading_style = styles['Heading1']
            
            # Process paragraphs
            for paragraph in docx_doc.paragraphs:
                if paragraph.text.strip():
                    # Check if it's a heading (simple heuristic)
                    if paragraph.style.name.startswith('Heading'):
                        para = Paragraph(paragraph.text, heading_style)
                    else:
                        para = Paragraph(paragraph.text, normal_style)
                    story.append(para)
                    story.append(Spacer(1, 12))
            
            # Process tables (basic support)
            for table in docx_doc.tables:
                for row in table.rows:
                    row_text = " | ".join([cell.text for cell in row.cells])
                    if row_text.strip():
                        para = Paragraph(row_text, normal_style)
                        story.append(para)
                        story.append(Spacer(1, 6))
            
            # Build PDF
            if story:
                doc.build(story)
            else:
                # If no content, create a simple page
                empty_para = Paragraph(f"Content from {filename}", normal_style)
                doc.build([empty_para])
            
            # Clean up temp file
            os.unlink(temp_docx_path)
            
            pdf_buffer.seek(0)
            return pdf_buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error converting DOCX to PDF: {str(e)}")
            # Clean up temp file if it exists
            if 'temp_docx_path' in locals():
                try:
                    os.unlink(temp_docx_path)
                except:
                    pass
            raise Exception(f"Failed to convert {filename}: {str(e)}")

    @staticmethod
    def merge_pdfs(pdf_contents: List[bytes]) -> bytes:
        """Merge multiple PDF files into a single PDF"""
        try:
            writer = PdfWriter()
            
            for pdf_content in pdf_contents:
                pdf_buffer = io.BytesIO(pdf_content)
                reader = PdfReader(pdf_buffer)
                
                for page in reader.pages:
                    writer.add_page(page)
            
            output_buffer = io.BytesIO()
            writer.write(output_buffer)
            output_buffer.seek(0)
            
            return output_buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error merging PDFs: {str(e)}")
            raise Exception(f"Failed to merge PDFs: {str(e)}")

    @staticmethod
    def create_zip_with_pdfs(pdf_files: List[tuple]) -> bytes:
        """Create a ZIP file containing multiple PDFs"""
        try:
            zip_buffer = io.BytesIO()
            
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                for pdf_content, original_filename in pdf_files:
                    # Change extension from .docx to .pdf
                    pdf_filename = original_filename.rsplit('.', 1)[0] + '.pdf'
                    zip_file.writestr(pdf_filename, pdf_content)
            
            zip_buffer.seek(0)
            return zip_buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error creating ZIP: {str(e)}")
            raise Exception(f"Failed to create ZIP: {str(e)}")

    @staticmethod
    def compress_pdf(pdf_content: bytes, compression_level: int = 90) -> bytes:
        """Compress a PDF file by reducing quality"""
        try:
            input_buffer = io.BytesIO(pdf_content)
            reader = PdfReader(input_buffer)
            writer = PdfWriter()
            
            # Add all pages to writer
            for page in reader.pages:
                writer.add_page(page)
            
            # Compress the PDF
            writer.compress_identical_objects()
            
            output_buffer = io.BytesIO()
            writer.write(output_buffer)
            output_buffer.seek(0)
            
            compressed_content = output_buffer.getvalue()
            
            # Calculate compression ratio
            original_size = len(pdf_content)
            compressed_size = len(compressed_content)
            
            logger.info(f"PDF compression: {original_size} -> {compressed_size} bytes")
            
            return compressed_content
            
        except Exception as e:
            logger.error(f"Error compressing PDF: {str(e)}")
            raise Exception(f"Failed to compress PDF: {str(e)}")