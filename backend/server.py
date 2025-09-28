from fastapi import FastAPI, APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import io
from pdf_services import PDFConverter


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# PDF Conversion Endpoints
@api_router.post("/convert/word-to-pdf")
async def convert_word_to_pdf(
    files: List[UploadFile] = File(...),
    single_pdf: bool = Form(True)
):
    """Convert Word documents to PDF format"""
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")
        
        # Validate file types
        for file in files:
            if not file.filename.lower().endswith('.docx'):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid file type: {file.filename}. Only .docx files are supported."
                )
        
        converted_pdfs = []
        
        # Convert each DOCX to PDF
        for file in files:
            content = await file.read()
            pdf_content = PDFConverter.docx_to_pdf(content, file.filename)
            converted_pdfs.append((pdf_content, file.filename))
        
        if single_pdf:
            # Merge all PDFs into one
            pdf_contents = [pdf_content for pdf_content, _ in converted_pdfs]
            merged_pdf = PDFConverter.merge_pdfs(pdf_contents)
            
            return StreamingResponse(
                io.BytesIO(merged_pdf),
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=converted-documents.pdf"}
            )
        else:
            # Create ZIP with individual PDFs
            zip_content = PDFConverter.create_zip_with_pdfs(converted_pdfs)
            
            return StreamingResponse(
                io.BytesIO(zip_content),
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=converted-documents.zip"}
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in word-to-pdf conversion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")


@api_router.post("/compress/pdf")
async def compress_pdf(
    file: UploadFile = File(...),
    compression_level: int = Form(90)
):
    """Compress a PDF file"""
    try:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Only PDF files are supported."
            )
        
        content = await file.read()
        compressed_pdf = PDFConverter.compress_pdf(content, compression_level)
        
        # Generate filename for compressed PDF
        original_name = file.filename.rsplit('.', 1)[0]
        compressed_filename = f"compressed_{original_name}.pdf"
        
        return StreamingResponse(
            io.BytesIO(compressed_pdf),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={compressed_filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in PDF compression: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Compression failed: {str(e)}")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()