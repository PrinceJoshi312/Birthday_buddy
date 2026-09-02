from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database file path
SQLALCHEMY_DATABASE_URL = "sqlite:///./birthday_buddy.db"

# Create SQLAlchemy engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()

def ensure_schema_migrated():
    """Safely adds missing columns to existing SQLite database without data loss."""
    try:
        with engine.connect() as conn:
            result = conn.exec_driver_sql("PRAGMA table_info(people)").fetchall()
            columns = [row[1] for row in result]
            if columns:
                if "reminder_days" not in columns:
                    conn.exec_driver_sql("ALTER TABLE people ADD COLUMN reminder_days VARCHAR(100) DEFAULT 'on_day,1_day_before'")
                if "reminder_time" not in columns:
                    conn.exec_driver_sql("ALTER TABLE people ADD COLUMN reminder_time VARCHAR(10) DEFAULT '09:00'")
                conn.commit()
    except Exception:
        pass

# Dependency to provide a database session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
