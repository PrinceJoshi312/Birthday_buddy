from datetime import date
from typing import Optional, Tuple

def calculate_next_birthday(birth_date: date, today: Optional[date] = None) -> Tuple[date, int]:
    """
    Calculate a person's next upcoming birthday and remaining days from today.

    Algorithm:
    1. Determine the reference date (defaults to today's date).
    2. Try to construct this year's birthday anniversary (handling leap year Feb 29).
       - If born on Feb 29 and this year is not a leap year, fallback to Feb 28.
    3. Compare candidate birthday with today:
       - If candidate >= today:
         - Today is the birthday (days_remaining = 0) OR
         - Birthday is upcoming later this year (days_remaining = (candidate - today).days)
       - If candidate < today:
         - Birthday has already passed this year.
         - Target next year (today.year + 1).
         - Construct anniversary in next year (again handling Feb 29 leap years).
         - Calculate days_remaining = (next_birthday - today).days.

    Parameters:
        birth_date (date): The person's original date of birth.
        today (date, optional): Reference date (defaults to date.today()).

    Returns:
        Tuple[date, int]: (next_birthday_date, days_remaining)
    """
    if today is None:
        today = date.today()

    # 1. Attempt to create the birthday in the current year
    try:
        candidate_birthday = date(today.year, birth_date.month, birth_date.day)
    except ValueError:
        # Handles Feb 29 in non-leap years -> celebrate on Feb 28
        candidate_birthday = date(today.year, 2, 28)

    # 2. Check if birthday is today or still coming up this year
    if candidate_birthday >= today:
        next_birthday = candidate_birthday
    else:
        # 3. Birthday already passed this year -> advance to next year
        next_year = today.year + 1
        try:
            next_birthday = date(next_year, birth_date.month, birth_date.day)
        except ValueError:
            # Handles Feb 29 in non-leap next years -> celebrate on Feb 28
            next_birthday = date(next_year, 2, 28)

    # 4. Calculate remaining days
    days_remaining = (next_birthday - today).days

    return next_birthday, days_remaining
