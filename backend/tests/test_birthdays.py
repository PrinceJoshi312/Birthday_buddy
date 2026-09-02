from datetime import date
from services.birthday_calculator import calculate_next_birthday

def test_birthday_is_today():
    """Edge case: Birthday is today -> days_remaining = 0"""
    today = date(2026, 8, 30)
    birth_date = date(1995, 8, 30)
    next_bday, days_remaining = calculate_next_birthday(birth_date, today=today)
    
    assert next_bday == date(2026, 8, 30)
    assert days_remaining == 0

def test_birthday_is_tomorrow():
    """Birthday is tomorrow -> days_remaining = 1"""
    today = date(2026, 8, 30)
    birth_date = date(2000, 8, 31)
    next_bday, days_remaining = calculate_next_birthday(birth_date, today=today)
    
    assert next_bday == date(2026, 8, 31)
    assert days_remaining == 1

def test_birthday_later_this_year():
    """Birthday is upcoming in 2 months"""
    today = date(2026, 8, 30)
    birth_date = date(1992, 10, 15)
    next_bday, days_remaining = calculate_next_birthday(birth_date, today=today)
    
    assert next_bday == date(2026, 10, 15)
    assert days_remaining == (date(2026, 10, 15) - today).days

def test_birthday_already_passed_this_year():
    """Edge case: Birthday was yesterday/earlier this year -> calculate next year"""
    today = date(2026, 8, 30)
    birth_date = date(1990, 8, 29) # yesterday
    next_bday, days_remaining = calculate_next_birthday(birth_date, today=today)
    
    assert next_bday == date(2027, 8, 29)
    assert days_remaining == (date(2027, 8, 29) - today).days

def test_birthday_passed_earlier_in_year():
    """Birthday in January when today is in August -> next year January"""
    today = date(2026, 8, 30)
    birth_date = date(1998, 1, 15)
    next_bday, days_remaining = calculate_next_birthday(birth_date, today=today)
    
    assert next_bday == date(2027, 1, 15)
    assert days_remaining == (date(2027, 1, 15) - today).days

def test_leap_year_baby_in_non_leap_year():
    """Edge case: Born on Feb 29, checked during a non-leap year (2026) -> fallback to Feb 28"""
    today = date(2026, 1, 1)
    birth_date = date(2004, 2, 29)
    next_bday, days_remaining = calculate_next_birthday(birth_date, today=today)
    
    assert next_bday == date(2026, 2, 28)
    assert days_remaining == (date(2026, 2, 28) - today).days

def test_leap_year_baby_in_leap_year():
    """Edge case: Born on Feb 29, checked during a leap year (2028) -> Feb 29"""
    today = date(2028, 1, 1)
    birth_date = date(2004, 2, 29)
    next_bday, days_remaining = calculate_next_birthday(birth_date, today=today)
    
    assert next_bday == date(2028, 2, 29)
    assert days_remaining == (date(2028, 2, 29) - today).days

def test_leap_year_passed_in_non_leap_year():
    """Born on Feb 29, today is March 1, 2027 (non-leap year, next year 2028 is leap year)"""
    today = date(2027, 3, 1)
    birth_date = date(2004, 2, 29)
    next_bday, days_remaining = calculate_next_birthday(birth_date, today=today)
    
    # Next year is 2028, which is a leap year -> next birthday is 2028-02-29
    assert next_bday == date(2028, 2, 29)
    assert days_remaining == (date(2028, 2, 29) - today).days
