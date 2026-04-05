"""Chat endpoints — real AI responses via Gemini + Orchestrator."""

import re
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import schemas
from typing import List
import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter(prefix="/api/chat", tags=["Chat"])


# ── Emotion detection (server-side) ──────────────────────────────────────
def _detect_emotion(text: str) -> str:
    lower = text.lower()
    if re.search(r"stress|overwhelm|pressure|tense|burden|تناؤ|دباؤ|بوجھ", lower):
        return "stressed"
    if re.search(r"sad|depress|cry|lonely|down|hurt|اداس|تنہا|رونا", lower):
        return "sad"
    if re.search(r"anxi|worry|nervous|scared|fear|panic|فکر|خوف|گھبراہٹ", lower):
        return "anxious"
    if re.search(r"happy|great|amazing|wonderful|joy|excited|good|خوش|بہترین|خوشی", lower):
        return "happy"
    if re.search(r"آرام|سکون|relax", lower):
        return "calm"
    return "calm"


def _detect_crisis(text: str) -> bool:
    lower = text.lower()
    return bool(re.search(r"suicid|kill myself|end it all|don't want to live|self.?harm|خودکشی|مرنا", lower))


CRISIS_RESPONSE = (
    "I'm really concerned about what you've shared. Please know that you matter and help is available. "
    "🇵🇰 Pakistan Helpline: 0311-7786264 | 🌍 International: befrienders.org | "
    "Please reach out to a trusted person near you. You don't have to go through this alone. 💙"
)


def _build_conversation_context(db: Session, user_id: int, limit: int = 10) -> str:
    """Get recent chat history to give Gemini conversational context."""
    recent = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.user_id == user_id)
        .order_by(models.ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    if not recent:
        return "No previous conversation history."

    # Reverse so oldest is first
    recent = list(reversed(recent))
    lines = []
    for msg in recent:
        role = "User" if msg.sender == "user" else "Serenity"
        lines.append(f"{role}: {msg.message}")
    return "\n".join(lines)


def _get_user_mood_context(db: Session, user_id: int) -> str:
    """Get recent mood data for context."""
    recent_mood = (
        db.query(models.Mood)
        .filter(models.Mood.user_id == user_id)
        .order_by(models.Mood.created_at.desc())
        .first()
    )
    if recent_mood:
        return f"Latest mood: {recent_mood.mood_state}, stress: {recent_mood.stress_level}%"
    return "No mood data yet."


def _generate_ai_response(
    message: str,
    emotion: str,
    tone: str,
    conversation_history: str,
    mood_context: str,
    user_name: str,
) -> str:
    """Use Gemini to generate a real, contextual response."""

    tone_instructions = {
        "friendly": "Be warm, casual, and supportive — like a caring friend.",
        "professional": "Be clinical yet empathetic — use evidence-based language.",
        "motivational": "Be energetic, uplifting, and encouraging — like a life coach.",
    }
    tone_guide = tone_instructions.get(tone, tone_instructions["friendly"])

    prompt = f"""You are Serenity, an empathetic AI mental health companion inside the MoodCare app.

PERSONALITY:
- {tone_guide}
- You are NOT a real therapist. Never diagnose or prescribe.
- Use the user's name ({user_name}) naturally but not in every message.
- Keep responses concise: 2-4 sentences max.
- Use 1-2 relevant emojis naturally.

CONTEXT:
- User's detected emotion: {emotion}
- {mood_context}

RECENT CONVERSATION:
{conversation_history}

USER'S NEW MESSAGE:
"{message}"

RULES:
- Respond directly to what the user said
- Validate their feelings before offering any suggestions
- If they're stressed/anxious, you may suggest ONE calming technique
- If they seem happy, celebrate with them
- Never repeat the exact same response from the conversation history
- Do NOT use markdown formatting, bullet points, or headers — just natural conversational text
- Respond in the SAME LANGUAGE the user writes in (if Urdu, reply in Urdu)
"""

    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        # Fallback if Gemini fails
        print(f"Gemini error: {e}")
        fallbacks = {
            "stressed": "I can see you're under pressure. Take a slow breath with me — in for 4, hold for 4, out for 4. You've got this. 💪",
            "sad": "I'm sorry you're feeling this way. It takes courage to share that. I'm right here with you. 💙",
            "anxious": "Anxiety can feel overwhelming, but you're safe here. Let's ground ourselves — name 3 things you can see right now. 🌿",
            "happy": "That's wonderful to hear! 🌟 What's bringing you joy today?",
            "calm": "It's great that you're feeling at peace. Anything on your mind? 🧘",
        }
        return fallbacks.get(emotion, fallbacks["calm"])


@router.post("", response_model=schemas.ChatSendResponse)
def send_message(
    req: schemas.ChatSendRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    emotion = _detect_emotion(req.message)
    is_crisis = _detect_crisis(req.message)

    # Save user message
    user_msg = models.ChatMessage(
        user_id=current_user.id,
        sender="user",
        message=req.message,
        emotion=emotion,
    )
    db.add(user_msg)
    db.flush()

    # Generate AI response
    if is_crisis:
        ai_text = CRISIS_RESPONSE
    else:
        # Build context from recent conversation + mood data
        conversation_history = _build_conversation_context(db, current_user.id, limit=10)
        mood_context = _get_user_mood_context(db, current_user.id)
        tone = current_user.preferred_tone or "friendly"
        user_name = current_user.name.split(" ")[0] if current_user.name else "there"

        ai_text = _generate_ai_response(
            message=req.message,
            emotion=emotion,
            tone=tone,
            conversation_history=conversation_history,
            mood_context=mood_context,
            user_name=user_name,
        )

    ai_msg = models.ChatMessage(
        user_id=current_user.id,
        sender="ai",
        message=ai_text,
        emotion=emotion,
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(user_msg)
    db.refresh(ai_msg)

    return schemas.ChatSendResponse(
        user_message=schemas.ChatMessageResponse.model_validate(user_msg),
        ai_message=schemas.ChatMessageResponse.model_validate(ai_msg),
    )


@router.get("/history", response_model=List[schemas.ChatMessageResponse])
def get_chat_history(
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    messages = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.user_id == current_user.id)
        .order_by(models.ChatMessage.created_at.asc())
        .limit(limit)
        .all()
    )
    return messages
