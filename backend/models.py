from sqlalchemy import Column, Integer, String, Date, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class Person(Base):
    __tablename__ = "people"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    birthday = Column(Date, nullable=False)
    relationship = Column(String(50), nullable=False)
    humor_level = Column(String(50), nullable=False, default="Normal")
    notes = Column(Text, nullable=True, default="")
    reminder_days = Column(String(100), nullable=True, default="on_day,1_day_before")
    reminder_time = Column(String(10), nullable=True, default="09:00")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
