"""Mood tracking endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import schemas
from typing import List

router = APIRouter(prefix="/api/moods", tags=["Moods"])


@router.post("", response_model=schemas.MoodResponse)
def log_mood(
    req: schemas.MoodCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    mood = models.Mood(
        user_id=current_user.id,
        mood_state=req.mood_state,
        stress_level=req.stress_level,
        note=req.note,
    )
    db.add(mood)
    db.commit()
    db.refresh(mood)
    return mood


@router.get("", response_model=List[schemas.MoodResponse])
def get_moods(
    limit: int = Query(30, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    moods = (
        db.query(models.Mood)
        .filter(models.Mood.user_id == current_user.id)
        .order_by(models.Mood.created_at.desc())
        .limit(limit)
        .all()
    )
    return moods
