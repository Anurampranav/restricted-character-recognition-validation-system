from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import get_db
from models import Upload

router = APIRouter()


def serialize_upload(upload: Upload) -> dict:
    return {
        "id": upload.id,
        "filename": upload.filename,
        "detected_character": upload.detected_character,
        "confidence": upload.confidence,
        "status": upload.status,
        "message": upload.message,
        "upload_time": upload.upload_time.isoformat(),
    }


@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    try:
        uploads = db.query(Upload).order_by(desc(Upload.upload_time)).all()
        return {"items": [serialize_upload(upload) for upload in uploads]}
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=500, detail="Could not load upload history.") from exc
