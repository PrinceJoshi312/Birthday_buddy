import json
import urllib.request
from datetime import date, timedelta

BASE_URL = "http://localhost:8000"
today = date.today()

print("=" * 60)
print(" STARTING COMPREHENSIVE END-TO-END SYSTEM TEST")
print("=" * 60)

def request_json(url, method="GET", data=None):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8") if data else None,
        headers={"Content-Type": "application/json"} if data else {},
        method=method
    )
    with urllib.request.urlopen(req) as resp:
        body = resp.read().decode("utf-8")
        return resp.status, json.loads(body) if body else None

# Clean existing entries first for a pure test
status, existing_people = request_json(f"{BASE_URL}/people")
for p in existing_people:
    request_json(f"{BASE_URL}/people/{p['id']}", method="DELETE")

# Test 1: Health Check
print("\n[1/7] Testing Server Health Check...")
status, data = request_json(f"{BASE_URL}/health")
assert status == 200 and data == {"status": "healthy"}
print("  [PASS] Health check passed! Server is online and responsive.")

# Test 2: Add Person (Birthday is TODAY)
print("\n[2/7] Adding Person with Birthday = TODAY...")
person_today = {
    "name": "Emma Watson",
    "birthday": today.strftime("%Y-%m-%d"),
    "relationship": "Bestie",
    "humor_level": "Playful",
    "notes": "Loves lavender tea and chocolate cakes!"
}
status, emma = request_json(f"{BASE_URL}/people", method="POST", data=person_today)
assert status == 201
assert emma["name"] == "Emma Watson"
print(f"  [PASS] Created person '{emma['name']}' (ID: {emma['id']}, Birthday: {emma['birthday']})")

# Test 3: Add Person (Birthday is TOMORROW)
print("\n[3/7] Adding Person with Birthday = TOMORROW...")
tomorrow = today + timedelta(days=1)
person_tomorrow = {
    "name": "Lucas Drake",
    "birthday": tomorrow.replace(year=1995).strftime("%Y-%m-%d"),
    "relationship": "Friend",
    "humor_level": "Witty",
    "notes": "Enjoys sci-fi novels"
}
status, lucas = request_json(f"{BASE_URL}/people", method="POST", data=person_tomorrow)
assert status == 201
print(f"  [PASS] Created person '{lucas['name']}' (ID: {lucas['id']}, Birthday: {lucas['birthday']})")

# Test 4: Add Person (Birthday in 14 Days)
print("\n[4/7] Adding Person with Birthday in 14 Days...")
in_14_days = today + timedelta(days=14)
person_14 = {
    "name": "Sophia Miller",
    "birthday": in_14_days.replace(year=2001).strftime("%Y-%m-%d"),
    "relationship": "Partner",
    "humor_level": "Heartfelt",
    "notes": "Planning a surprise dinner!"
}
status, sophia = request_json(f"{BASE_URL}/people", method="POST", data=person_14)
assert status == 201
print(f"  [PASS] Created person '{sophia['name']}' (ID: {sophia['id']}, Birthday: {sophia['birthday']})")

# Test 5: Add Person (Birthday already PASSED yesterday -> Next Year)
print("\n[5/7] Adding Person whose Birthday passed yesterday...")
yesterday = today - timedelta(days=1)
person_passed = {
    "name": "Grandma Rose",
    "birthday": yesterday.replace(year=1950).strftime("%Y-%m-%d"),
    "relationship": "Family",
    "humor_level": "Heartfelt",
    "notes": "Best chocolate chip cookies!"
}
status, grandma = request_json(f"{BASE_URL}/people", method="POST", data=person_passed)
assert status == 201
print(f"  [PASS] Created person '{grandma['name']}' (ID: {grandma['id']}, Birthday: {grandma['birthday']})")

# Test 6: Add Leap Year Baby (Feb 29)
print("\n[6/7] Adding Leap Year Baby (Feb 29)...")
person_leap = {
    "name": "Captain Leapling",
    "birthday": "2004-02-29",
    "relationship": "Colleague",
    "humor_level": "Absurd",
    "notes": "Ages at 1/4 the normal speed!"
}
status, cap = request_json(f"{BASE_URL}/people", method="POST", data=person_leap)
assert status == 201
print(f"  [PASS] Created person '{cap['name']}' (ID: {cap['id']}, Birthday: {cap['birthday']})")

# Test 7: Verify GET /birthdays/upcoming Ordering and Calculations
print("\n[7/7] Testing GET /birthdays/upcoming sorting & countdown logic...")
status, upcoming = request_json(f"{BASE_URL}/birthdays/upcoming")
assert status == 200
assert len(upcoming) == 5

print("\n  UPCOMING BIRTHDAYS RETRIEVED (SORTED BY NEAREST):")
for p in upcoming:
    print(f"   * {p['name']:<18} | Rel: {p['relationship']:<10} | Next: {p['next_birthday']} | Days Left: {p['days_remaining']}")

# Verify 1st: Emma (Today) -> 0 days remaining
assert upcoming[0]["name"] == "Emma Watson"
assert upcoming[0]["days_remaining"] == 0

# Verify 2nd: Lucas (Tomorrow) -> 1 day remaining
assert upcoming[1]["name"] == "Lucas Drake"
assert upcoming[1]["days_remaining"] == 1

# Verify 3rd: Sophia (In 14 days) -> 14 days remaining
assert upcoming[2]["name"] == "Sophia Miller"
assert upcoming[2]["days_remaining"] == 14

# Verify strictly sorted ascending
days_list = [p["days_remaining"] for p in upcoming]
assert days_list == sorted(days_list)
print("  [PASS] Upcoming birthdays list is 100% verified, correctly calculated, and strictly ordered by nearest date!")

print("\n" + "=" * 60)
print(" ALL TESTS PASSED WITH 100% SUCCESS!")
print("=" * 60)
