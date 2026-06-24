from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import get_db
from models import Upload

router = APIRouter()


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    try:
        total_uploads = db.query(Upload).count()
        valid_count = db.query(Upload).filter(Upload.status == "VALID").count()
        invalid_count = db.query(Upload).filter(Upload.status == "INVALID").count()
        error_count = db.query(Upload).filter(Upload.status == "ERROR").count()
        return {
            "total_uploads": total_uploads,
            "valid_count": valid_count,
            "invalid_count": invalid_count,
            "error_count": error_count,
        }
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=500, detail="Could not load upload statistics.") from exc
