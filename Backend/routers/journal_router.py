"""Journal endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import schemas
from typing import List

router = APIRouter(prefix="/api/journals", tags=["Journals"])


@router.post("", response_model=schemas.JournalResponse)
def create_journal(
    req: schemas.JournalCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Generate a simple AI suggestion based on content keywords
    suggestion = _generate_suggestion(req.content)

    journal = models.Journal(
        user_id=current_user.id,
        content=req.content,
        ai_suggestion=suggestion,
    )
    db.add(journal)
    db.commit()
    db.refresh(journal)
    return journal


@router.get("", response_model=List[schemas.JournalResponse])
def get_journals(
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    journals = (
        db.query(models.Journal)
        .filter(models.Journal.user_id == current_user.id)
        .order_by(models.Journal.created_at.desc())
        .limit(limit)
        .all()
    )
    return journals


@router.get("/{journal_id}", response_model=schemas.JournalResponse)
def get_journal(
    journal_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    journal = (
        db.query(models.Journal)
        .filter(models.Journal.id == journal_id, models.Journal.user_id == current_user.id)
        .first()
    )
    if not journal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found")
    return journal


def _generate_suggestion(content: str) -> str:
    """Generate a simple keyword-based AI suggestion for a journal entry."""
    lower = content.lower()
    if any(w in lower for w in ["stress", "overwhelm", "pressure", "tense"]):
        return "It sounds like you're under pressure. Try a 5-minute breathing exercise or a short walk to reset your mind. 🌿"
    if any(w in lower for w in ["sad", "lonely", "cry", "hurt", "depress"]):
        return "I hear you. Remember that reaching out to someone you trust can lighten the load. You're not alone. 💙"
    if any(w in lower for w in ["happy", "joy", "grateful", "amazing", "wonderful"]):
        return "What a beautiful reflection! Consider noting what made today special so you can revisit this feeling. ✨"
    if any(w in lower for w in ["anxious", "worry", "nervous", "fear", "panic"]):
        return "Anxiety often shrinks when we name it. Try listing your worries and rating each (1-10) — it helps put things in perspective. 🧘"
    if any(w in lower for w in ["work", "job", "career", "boss", "deadline"]):
        return "Work-life balance matters. Make sure to schedule breaks and protect your personal time. You deserve rest! 🌅"
    return "Thank you for sharing your thoughts. Regular journaling builds self-awareness and emotional resilience. Keep it up! 📝"
