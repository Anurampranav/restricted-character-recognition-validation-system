from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
import logging
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import get_db
from models import Upload
from services.ocr_service import detect_character
from services.validation_service import validate_character

router = APIRouter()
logger = logging.getLogger(__name__)

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"}


def _safe_filename(filename: str) -> str:
    suffix = Path(filename).suffix.lower()
    return f"{uuid4().hex}{suffix}"


@router.post("/upload")
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    logger.info("File received: filename=%s content_type=%s", file.filename, file.content_type)
    if not file.filename:
        raise HTTPException(status_code=400, detail="Please upload a valid image file.")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only image files are supported.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    saved_name = _safe_filename(file.filename)
    saved_path = UPLOAD_DIR / saved_name
    try:
        saved_path.write_bytes(contents)
        logger.info("File saved: %s bytes=%s", saved_path, len(contents))
    except OSError as exc:
        logger.exception("File save failed: %s", exc)
        raise HTTPException(status_code=500, detail="File save failed") from exc

    try:
        ocr_result = detect_character(str(saved_path))
        detected_character = ocr_result["character"]
        confidence = ocr_result["confidence"]
        if ocr_result.get("status") == "ERROR":
            validation = {
                "status": "ERROR",
                "message": ocr_result.get("message") or "OCR processing failed",
            }
        else:
            validation = validate_character(detected_character)
        logger.info("OCR result: %s", ocr_result)
        logger.info("Validation result: %s", validation)

        upload = Upload(
            filename=file.filename,
            detected_character=detected_character,
            confidence=confidence,
            status=validation["status"],
            message=validation["message"],
        )
        db.add(upload)
        db.commit()
        db.refresh(upload)
        logger.info("Database save result: upload_id=%s", upload.id)

        return {
            "id": upload.id,
            "filename": upload.filename,
            "detected_character": upload.detected_character,
            "confidence": upload.confidence,
            "status": upload.status,
            "message": upload.message,
            "upload_time": upload.upload_time.isoformat(),
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Database error: %s", exc)
        raise HTTPException(status_code=500, detail="Database error") from exc
    except Exception as exc:
        logger.exception("Unhandled image analysis error: %s", exc)
        raise HTTPException(status_code=500, detail="OCR processing failed") from exc
