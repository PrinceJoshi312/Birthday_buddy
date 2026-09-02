from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base, ensure_schema_migrated
from routers import people, birthdays

# Automatically create tables in SQLite database on startup
Base.metadata.create_all(bind=engine)
ensure_schema_migrated()

app = FastAPI(
    title="Birthday Buddy API",
    description="Simple, beginner-friendly FastAPI backend for Birthday Buddy with SQLite and SQLAlchemy.",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(people.router)
app.include_router(birthdays.router)

@app.get("/health", tags=["health"])
def health_check():
    """Simple health check endpoint."""
    return {"status": "healthy"}

@app.get("/", tags=["root"])
def root():
    """Root welcome endpoint."""
    return {
        "message": "Welcome to Birthday Buddy API! 🎂",
        "docs_url": "/docs",
        "health_check": "/health"
    }
