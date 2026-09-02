from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Person
from schemas import UpcomingBirthdayResponse
from services.birthday_calculator import calculate_next_birthday

router = APIRouter(
    prefix="/birthdays",
    tags=["birthdays"]
)

@router.get("/upcoming", response_model=List[UpcomingBirthdayResponse])
def get_upcoming_birthdays(db: Session = Depends(get_db)):
    """
    Get all people with their next calculated birthday and remaining days,
    sorted by nearest upcoming birthday.
    """
    people = db.query(Person).all()
    
    upcoming_list = []
    for person in people:
        next_birthday, days_remaining = calculate_next_birthday(person.birthday)
        
        upcoming_list.append(
            UpcomingBirthdayResponse(
                id=person.id,
                name=person.name,
                birthday=person.birthday,
                relationship=person.relationship,
                humor_level=person.humor_level,
                notes=person.notes or "",
                created_at=person.created_at,
                next_birthday=next_birthday,
                days_remaining=days_remaining
            )
        )
        
    # Sort by nearest upcoming birthday (fewest days remaining first)
    upcoming_list.sort(key=lambda item: item.days_remaining)
    
    return upcoming_list
