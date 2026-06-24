from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, String

from database import Base


class Upload(Base):
    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    detected_character = Column(String(10), nullable=True)
    confidence = Column(Float, nullable=True)
    status = Column(String(20), nullable=False)
    message = Column(String(255), nullable=False)
    upload_time = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
