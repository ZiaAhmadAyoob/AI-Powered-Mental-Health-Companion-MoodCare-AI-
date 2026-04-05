"""Insights endpoints — aggregated mood/stress data."""

from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from auth import get_current_user
import models
import schemas
from services.prediction_service import get_mood_prediction

router = APIRouter(prefix="/api/insights", tags=["Insights"])


@router.get("/summary", response_model=schemas.InsightsSummary)
def get_insights_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    user_id = current_user.id

    # Total moods logged
    total_moods = db.query(models.Mood).filter(models.Mood.user_id == user_id).count()

    # Mood distribution
    mood_counts = (
        db.query(models.Mood.mood_state, func.count(models.Mood.id))
        .filter(models.Mood.user_id == user_id)
        .group_by(models.Mood.mood_state)
        .all()
    )
    mood_distribution = {state: count for state, count in mood_counts}

    # Average stress level
    avg_stress_result = (
        db.query(func.avg(models.Mood.stress_level))
        .filter(models.Mood.user_id == user_id)
        .scalar()
    )
    average_stress = round(float(avg_stress_result), 1) if avg_stress_result else 0.0

    # Weekly moods (last 7 days)
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    weekly_moods = (
        db.query(models.Mood)
        .filter(models.Mood.user_id == user_id, models.Mood.created_at >= week_ago)
        .order_by(models.Mood.created_at.asc())
        .all()
    )

    # Total journals
    total_journals = db.query(models.Journal).filter(models.Journal.user_id == user_id).count()

    # Total chats
    total_chats = db.query(models.ChatMessage).filter(
        models.ChatMessage.user_id == user_id,
        models.ChatMessage.sender == "user",
    ).count()

    # Calculate streak (consecutive days with at least 1 mood entry)
    streak_days = _calculate_streak(db, user_id)

    return schemas.InsightsSummary(
        total_moods=total_moods,
        mood_distribution=mood_distribution,
        average_stress=average_stress,
        weekly_moods=[schemas.MoodResponse.model_validate(m) for m in weekly_moods],
        total_journals=total_journals,
        total_chats=total_chats,
        streak_days=streak_days,
    )


def _calculate_streak(db: Session, user_id: int) -> int:
    """Count consecutive days (including today) with at least one mood entry.
    Uses a single query instead of per-day lookups for performance."""
    today = datetime.now(timezone.utc).date()

    # Fetch all distinct mood-entry dates in one query
    rows = (
        db.query(func.date(models.Mood.created_at).label("day"))
        .filter(models.Mood.user_id == user_id)
        .group_by(func.date(models.Mood.created_at))
        .order_by(func.date(models.Mood.created_at).desc())
        .all()
    )
    mood_dates = {row.day for row in rows}

    streak = 0
    for i in range(365):
        day = today - timedelta(days=i)
        if day in mood_dates:
            streak += 1
        else:
            break
    return streak


@router.get("/predict")
def predict_mood(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return get_mood_prediction(current_user.id)


@router.get("/dashboard")
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Single endpoint that returns everything the dashboard needs.

    Aggregates: latest mood, stress, streak, AI insights, weekly summary,
    prediction / tip-of-the-day, journal count, and an AI-generated greeting.
    """
    from services.insight_service import get_insights

    user_id = current_user.id

    # ── Latest mood entry ────────────────────────────────────────────
    latest_mood_row = (
        db.query(models.Mood)
        .filter(models.Mood.user_id == user_id)
        .order_by(models.Mood.created_at.desc())
        .first()
    )
    current_mood = latest_mood_row.mood_state if latest_mood_row else "calm"
    stress_level = latest_mood_row.stress_level if latest_mood_row else 30

    # ── Streak ───────────────────────────────────────────────────────
    streak_days = _calculate_streak(db, user_id)

    # ── Journal count ────────────────────────────────────────────────
    journal_count = (
        db.query(models.Journal)
        .filter(models.Journal.user_id == user_id)
        .count()
    )

    # ── AI insights + weekly summary (from insight_service) ──────────
    ai_data = get_insights(user_id)
    ai_insights = ai_data.get("insights", [])
    weekly_summary = ai_data.get("weekly_summary", "")
    mood_logs_this_week = ai_data.get("progress", {}).get("this_week_logs", 0)

    # ── Prediction / tip of the day ──────────────────────────────────
    prediction = get_mood_prediction(user_id)
    tip_of_the_day = prediction.get("insight", "")

    # ── AI greeting (Gemini-generated, contextual) ───────────────────
    ai_greeting = _generate_ai_greeting(current_mood, current_user.name, streak_days)

    return {
        "current_mood": current_mood,
        "stress_level": stress_level,
        "streak_days": streak_days,
        "journal_count": journal_count,
        "ai_insights": ai_insights,
        "weekly_summary": weekly_summary,
        "ai_greeting": ai_greeting,
        "tip_of_the_day": tip_of_the_day,
        "predicted_mood": prediction.get("predicted_mood"),
        "mood_logs_this_week": mood_logs_this_week,
    }


def _generate_ai_greeting(mood: str, user_name: str, streak: int) -> str:
    """Use Gemini to create a warm, 1-sentence greeting for the dashboard."""
    import os
    from google import genai

    first_name = (user_name or "").split(" ")[0] or "there"

    prompt = f"""You are a caring AI mental health companion.
Write a single warm greeting sentence for a user named {first_name}.
Their current mood is "{mood}" and they have a {streak}-day streak.
Be personal, encouraging, and concise (max 1 sentence). No quotes around the sentence."""

    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
        )
        return response.text.strip()
    except Exception:
        # fallback if Gemini is unavailable
        return f"Welcome back, {first_name}! Keep up your {streak}-day streak 💪"
