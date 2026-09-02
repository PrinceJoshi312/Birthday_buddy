from datetime import date, timedelta
from fastapi.testclient import TestClient
from main import app
from database import get_db, SessionLocal
from models import Person

client = TestClient(app)

def test_get_upcoming_birthdays_endpoint():
    db = SessionLocal()
    # Clean table
    db.query(Person).delete()
    db.commit()

    today = date.today()

    # Person 1: Birthday is today
    p_today = Person(
        name="Birthday Today Person",
        birthday=today.replace(year=1995),
        relationship="Bestie",
        humor_level="Playful",
        notes="Celebrates today!"
    )
    # Person 2: Birthday is tomorrow
    b_tomorrow = today + timedelta(days=1)
    p_tomorrow = Person(
        name="Birthday Tomorrow Person",
        birthday=b_tomorrow.replace(year=1998),
        relationship="Friend",
        humor_level="Witty",
        notes="Coming up tomorrow"
    )
    # Person 3: Birthday was yesterday (already passed this year)
    b_yesterday = today - timedelta(days=1)
    p_yesterday = Person(
        name="Birthday Yesterday Person",
        birthday=b_yesterday.replace(year=1992),
        relationship="Colleague",
        humor_level="Roast",
        notes="Just passed"
    )
    # Person 4: Birthday in 15 days
    b_15days = today + timedelta(days=15)
    p_15days = Person(
        name="Birthday In 15 Days",
        birthday=b_15days.replace(year=2000),
        relationship="Family",
        humor_level="Heartfelt",
        notes="In 15 days"
    )

    db.add_all([p_today, p_tomorrow, p_yesterday, p_15days])
    db.commit()
    db.close()

    # Call GET /birthdays/upcoming
    response = client.get("/birthdays/upcoming")
    assert response.status_code == 200
    data = response.json()

    assert len(data) == 4

    # Verify sorting by days_remaining ascending:
    # 1. Today (days_remaining = 0)
    assert data[0]["name"] == "Birthday Today Person"
    assert data[0]["days_remaining"] == 0
    assert data[0]["next_birthday"] == today.isoformat()

    # 2. Tomorrow (days_remaining = 1)
    assert data[1]["name"] == "Birthday Tomorrow Person"
    assert data[1]["days_remaining"] == 1

    # 3. In 15 days (days_remaining = 15)
    assert data[2]["name"] == "Birthday In 15 Days"
    assert data[2]["days_remaining"] == 15

    # 4. Yesterday (days_remaining approx 364/365)
    assert data[3]["name"] == "Birthday Yesterday Person"
    assert data[3]["days_remaining"] >= 364
