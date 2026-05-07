"""MoodCare AI — FastAPI Application Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth_router, user_router, mood_router, journal_router, chat_router, insights_router
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
# add this import
from routers import face_router

# add this line with other routers

load_dotenv()

# set HuggingFace token
os.environ["HUGGINGFACE_HUB_TOKEN"] = os.getenv("HF_TOKEN", "")
# Create all database tables on startup
Base.metadata.create_all(bind=engine)

# ── Auto-migrate: add new columns to existing tables ──
from sqlalchemy import text
with engine.connect() as conn:
    migrations = [
        "ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0",
        "ALTER TABLE users ADD COLUMN locked_until DATETIME NULL",
        "ALTER TABLE password_resets ADD COLUMN verify_attempts INT DEFAULT 0",
    ]
    for sql in migrations:
        try:
            conn.execute(text(sql))
            conn.commit()
        except Exception:
            conn.rollback()  # Column already exists, skip

app = FastAPI(
    title="MoodCare AI API",
    description="Backend API for MoodCare AI — a mental health companion",
    version="1.0.0",
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers (each router defines its own prefix internally)
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(chat_router.router)
app.include_router(mood_router.router)
app.include_router(journal_router.router)
app.include_router(insights_router.router)
app.include_router(face_router.router)
from routers import contact_router
app.include_router(contact_router.router)


@app.get("/")
def root():
    return {"message": "MoodCare AI API is running 🚀"}


