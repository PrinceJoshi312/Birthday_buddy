from datetime import date
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
from models import Person

client = TestClient(app)

def test_people_crud_and_edit():
    db = SessionLocal()
    db.query(Person).delete()
    db.commit()
    db.close()

    # 1. Create a person
    payload = {
        "name": "David Bowie",
        "birthday": "1947-01-08",
        "relationship": "Friend",
        "humor_level": "Normal",
        "notes": "Starman",
        "reminder_days": "on_day,1_day_before",
        "reminder_time": "09:00"
    }
    res = client.post("/people", json=payload)
    assert res.status_code == 201
    created = res.json()
    person_id = created["id"]
    assert created["name"] == "David Bowie"
    assert created["reminder_days"] == "on_day,1_day_before"
    assert created["reminder_time"] == "09:00"

    # 2. Get single person
    res = client.get(f"/people/{person_id}")
    assert res.status_code == 200
    assert res.json()["name"] == "David Bowie"

    # 3. Edit (PUT) person
    update_payload = {
        "name": "David Robert Jones",
        "relationship": "Best Friend",
        "notes": "Ziggy Stardust",
        "reminder_days": "on_day,1_day_before,3_days_before,7_days_before",
        "reminder_time": "10:30"
    }
    res = client.put(f"/people/{person_id}", json=update_payload)
    assert res.status_code == 200
    updated = res.json()
    assert updated["name"] == "David Robert Jones"
    assert updated["relationship"] == "Best Friend"
    assert updated["notes"] == "Ziggy Stardust"
    assert updated["reminder_days"] == "on_day,1_day_before,3_days_before,7_days_before"
    assert updated["reminder_time"] == "10:30"

    # 4. Verify in upcoming birthdays
    res = client.get("/birthdays/upcoming")
    assert res.status_code == 200
    birthdays = res.json()
    assert any(p["name"] == "David Robert Jones" for p in birthdays)

    # 5. Delete person
    res = client.delete(f"/people/{person_id}")
    assert res.status_code == 204

    # 6. Verify 404 after deletion
    res = client.get(f"/people/{person_id}")
    assert res.status_code == 404
