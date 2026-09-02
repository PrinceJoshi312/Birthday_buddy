from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Person
from schemas import PersonCreate, PersonUpdate, PersonResponse

router = APIRouter(
    prefix="/people",
    tags=["people"]
)

@router.post("", response_model=PersonResponse, status_code=status.HTTP_201_CREATED)
def create_person(person_in: PersonCreate, db: Session = Depends(get_db)):
    """Add a new person to track their birthday."""
    new_person = Person(
        name=person_in.name.strip(),
        birthday=person_in.birthday,
        relationship=person_in.relationship.strip(),
        humor_level=person_in.humor_level.strip() if person_in.humor_level else "Normal",
        notes=person_in.notes.strip() if person_in.notes else "",
        reminder_days=person_in.reminder_days or "on_day,1_day_before",
        reminder_time=person_in.reminder_time or "09:00"
    )
    db.add(new_person)
    db.commit()
    db.refresh(new_person)
    return new_person

@router.get("", response_model=List[PersonResponse])
def get_people(db: Session = Depends(get_db)):
    """Retrieve all tracked people."""
    people = db.query(Person).order_by(Person.id.desc()).all()
    return people

@router.get("/{person_id}", response_model=PersonResponse)
def get_person(person_id: int, db: Session = Depends(get_db)):
    """Get a single person by their ID."""
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Person with ID {person_id} not found"
        )
    return person

@router.put("/{person_id}", response_model=PersonResponse)
def update_person(person_id: int, person_update: PersonUpdate, db: Session = Depends(get_db)):
    """Update a person's birthday information and reminder settings."""
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Person with ID {person_id} not found"
        )
    
    if person_update.name is not None:
        person.name = person_update.name.strip()
    if person_update.birthday is not None:
        person.birthday = person_update.birthday
    if person_update.relationship is not None:
        person.relationship = person_update.relationship.strip()
    if person_update.humor_level is not None:
        person.humor_level = person_update.humor_level.strip()
    if person_update.notes is not None:
        person.notes = person_update.notes.strip()
    if person_update.reminder_days is not None:
        person.reminder_days = person_update.reminder_days
    if person_update.reminder_time is not None:
        person.reminder_time = person_update.reminder_time

    db.commit()
    db.refresh(person)
    return person

@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_person(person_id: int, db: Session = Depends(get_db)):
    """Delete a person by their ID."""
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Person with ID {person_id} not found"
        )
    db.delete(person)
    db.commit()
    return None
