from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class PersonBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Full name of the person")
    birthday: date = Field(..., description="Birthday in YYYY-MM-DD format")
    relationship: str = Field(..., min_length=1, max_length=50, description="Relationship (e.g., Friend, Family, Partner)")
    humor_level: str = Field(default="Normal", max_length=50, description="Humor style preference")
    notes: Optional[str] = Field(default="", description="Optional notes or inside jokes")
    reminder_days: Optional[str] = Field(default="on_day,1_day_before", description="Comma-separated reminder triggers (on_day, 1_day_before, 3_days_before, 7_days_before)")
    reminder_time: Optional[str] = Field(default="09:00", description="Time for reminder in HH:MM format")

class PersonCreate(PersonBase):
    pass

class PersonUpdate(BaseModel):
    name: Optional[str] = None
    birthday: Optional[date] = None
    relationship: Optional[str] = None
    humor_level: Optional[str] = None
    notes: Optional[str] = None
    reminder_days: Optional[str] = None
    reminder_time: Optional[str] = None

class PersonResponse(PersonBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class UpcomingBirthdayResponse(PersonResponse):
    next_birthday: date = Field(..., description="The next occurrence of this person's birthday")
    days_remaining: int = Field(..., ge=0, description="Number of days remaining until next birthday (0 if today)")
