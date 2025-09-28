import io
import os
import zipfile
import tempfile
from typing import List
from docx import Document
from docx.shared import Inches
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle
from reportlab.lib.units import inch
from pypdf import PdfWriter, PdfReader
from PIL import Image
import logging
import xml.etree.ElementTree as ET

logger = logging.getLogger(__name__)

class PDFConverter:
    
    @staticmethod
    def extract_images_from_docx(docx_path: str) -> List[tuple]:
        """Extract images from DOCX file"""
        images = []
        try:
            import zipfile as zf
            with zf.ZipFile(docx_path, 'r') as docx_zip:
                # Get all image files from the docx
                image_files = [f for f in docx_zip.namelist() if f.startswith('word/media/')]
                
                for img_file in image_files:
                    try:
                        img_data = docx_zip.read(img_file)
                        # Save to temp file
                        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_img:
                            temp_img.write(img_data)
                            images.append((temp_img.name, img_data))
                    except Exception as e:
                        logger.warning(f"Could not extract image {img_file}: {e}")
                        
        except Exception as e:
            logger.warning(f"Could not extract images: {e}")
            
        return images
    
    @staticmethod
    def docx_to_pdf(docx_file_content: bytes, filename: str) -> bytes:
        """Convert a DOCX file to PDF preserving text and images"""
        temp_docx_path = None
        temp_images = []
        
        try:
            # Create a temporary file for the DOCX content
            with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as temp_docx:
                temp_docx.write(docx_file_content)
                temp_docx_path = temp_docx.name

            # Create PDF buffer
            pdf_buffer = io.BytesIO()
            
            # Create PDF document with better margins
            doc = SimpleDocTemplate(pdf_buffer, pagesize=A4,
                                  rightMargin=50, leftMargin=50,
                                  topMargin=50, bottomMargin=50)
            
            # Parse DOCX document
            docx_doc = Document(temp_docx_path)
            story = []
            
            # Get styles
            styles = getSampleStyleSheet()
            normal_style = ParagraphStyle(
                'Normal',
                parent=styles['Normal'],
                fontSize=12,
                spaceAfter=12,
                spaceBefore=0,
            )
            
            heading_style = ParagraphStyle(
                'CustomHeading',
                parent=styles['Heading1'],
                fontSize=16,
                spaceAfter=16,
                spaceBefore=12,
                textColor=colors.black,
            )
            
            # Extract images first
            extracted_images = PDFConverter.extract_images_from_docx(temp_docx_path)
            temp_images = [img_path for img_path, _ in extracted_images]
            image_index = 0
            
            # Add title
            title = Paragraph(f"Document: {filename.replace('.docx', '')}", heading_style)
            story.append(title)
            story.append(Spacer(1, 20))
            
            # Process paragraphs with better text handling
            for paragraph in docx_doc.paragraphs:
                text = paragraph.text.strip()
                if text:
                    # Handle different paragraph styles
                    if paragraph.style.name.startswith('Heading') or text.isupper():
                        para = Paragraph(text, heading_style)
                    else:
                        # Clean text for PDF
                        clean_text = text.replace('\n', '<br/>')
                        # Handle bold and italic (basic)
                        for run in paragraph.runs:
                            if run.bold:
                                clean_text = clean_text.replace(run.text, f'<b>{run.text}</b>')
                            elif run.italic:
                                clean_text = clean_text.replace(run.text, f'<i>{run.text}</i>')
                        
                        para = Paragraph(clean_text, normal_style)
                    
                    story.append(para)
                    story.append(Spacer(1, 6))
                
                # Add images if available (simple approach)
                if image_index < len(extracted_images) and text:
                    try:
                        img_path, _ = extracted_images[image_index]
                        # Resize image to fit page
                        img = RLImage(img_path, width=4*inch, height=3*inch)
                        story.append(Spacer(1, 12))
                        story.append(img)
                        story.append(Spacer(1, 12))
                        image_index += 1
                    except Exception as e:
                        logger.warning(f"Could not add image to PDF: {e}")
            
            # Process tables with better formatting
            for table in docx_doc.tables:
                table_data = []
                for row in table.rows:
                    row_data = []
                    for cell in row.cells:
                        cell_text = cell.text.strip()
                        row_data.append(cell_text if cell_text else " ")
                    if any(row_data):  # Only add non-empty rows
                        table_data.append(row_data)
                
                if table_data:
                    # Create table with styling
                    pdf_table = Table(table_data)
                    pdf_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 10),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black),
                        ('FONTSIZE', (0, 1), (-1, -1), 9),
                    ]))
                    story.append(Spacer(1, 12))
                    story.append(pdf_table)
                    story.append(Spacer(1, 12))
            
            # Add remaining images at the end
            while image_index < len(extracted_images):
                try:
                    img_path, _ = extracted_images[image_index]
                    img = RLImage(img_path, width=4*inch, height=3*inch)
                    story.append(Spacer(1, 12))
                    story.append(img)
                    story.append(Spacer(1, 12))
                    image_index += 1
                except Exception as e:
                    logger.warning(f"Could not add remaining image to PDF: {e}")
                    image_index += 1
            
            # Build PDF
            if not story or len(story) <= 2:  # Only title and spacer
                # Create a more informative message if no content
                no_content_para = Paragraph(
                    f"The document '{filename}' appears to be empty or could not be processed properly. "
                    "Please ensure the document contains readable text and images.", 
                    normal_style
                )
                story = [title, Spacer(1, 20), no_content_para]
            
            doc.build(story)
            
            # Clean up temp files
            if temp_docx_path and os.path.exists(temp_docx_path):
                os.unlink(temp_docx_path)
            
            for img_path in temp_images:
                try:
                    if os.path.exists(img_path):
                        os.unlink(img_path)
                except:
                    pass
            
            pdf_buffer.seek(0)
            return pdf_buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error converting DOCX to PDF: {str(e)}")
            # Clean up temp files if they exist
            if temp_docx_path and os.path.exists(temp_docx_path):
                try:
                    os.unlink(temp_docx_path)
                except:
                    pass
                    
            for img_path in temp_images:
                try:
                    if os.path.exists(img_path):
                        os.unlink(img_path)
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