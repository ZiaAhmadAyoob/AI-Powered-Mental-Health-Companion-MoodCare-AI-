import os
from google import genai
from dotenv import load_dotenv
from services.memory_service import (
    store_memory,
    get_user_context,
)
from services.crisis_service import check_crisis
from services.insight_service import get_insights
from services.prediction_service import get_mood_prediction, train_user_model
from database import get_db_session
from models import ChatMessage, Mood
from services.emotion_service import detect_emotion, calculate_stress_score, detect_journal_emotion

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class OrchestratorAgent:

    def __init__(self, user_id: int):
        self.user_id = user_id

    # ── main entry point ──────────────────────────────────────────────
    async def handle(self, input_type: str, payload: dict) -> dict:
        """
        input_type: "chat" | "mood_log" | "journal"
        payload:    varies by type (see below)
        """

        if input_type == "chat":
            return await self._handle_chat(payload)

        elif input_type == "mood_log":
            return await self._handle_mood_log(payload)

        elif input_type == "journal":
            return await self._handle_journal(payload)

        else:
            return {"error": "Unknown input type"}

    # ── CHAT handler ──────────────────────────────────────────────────
    async def _handle_chat(self, payload: dict) -> dict:
        message = payload["message"]

        emotion_result = detect_emotion(message)
        emotion        = emotion_result["primary"]
        stress         = calculate_stress_score(emotion_result)

        # pass current message so FAISS finds relevant memories
        context = get_user_context(self.user_id, current_message=message)

        # in _handle_chat
        crisis = check_crisis(message, emotion, context, user_id=self.user_id)

        response_text = self._generate_chat_response(
            message, emotion, stress, context, crisis
        )

        # store this message as a memory
        store_memory(
            user_id     = self.user_id,
            text        = message,
            memory_type = "chat",
            emotion     = emotion,
        )

        # save to MySQL as before
        self._save_chat(message, response_text, emotion)

        return {
            "response":       response_text,
            "emotion":        emotion,
            "stress":         stress,
            "crisis_level":   crisis["level"],
            "crisis_message": crisis.get("message"),
        }

    # ── MOOD LOG handler ──────────────────────────────────────────────
    # ── JOURNAL handler ───────────────────────────────────────────────

    async def _handle_journal(self, payload: dict) -> dict:
        text = payload["text"]

        emotion_result = detect_journal_emotion(text)
        emotion        = emotion_result["primary"]
        stress         = calculate_stress_score(emotion_result)

        context = get_user_context(self.user_id, current_message=text)
        crisis = check_crisis(text, emotion, context, user_id=self.user_id)

        reflection = self._generate_journal_reflection(text, emotion, stress)

        # store journal as memory
        store_memory(
            user_id     = self.user_id,
            text        = text,
            memory_type = "journal",
            emotion     = emotion,
        )

        return {
            "emotion":      emotion,
            "stress":       stress,
            "all_scores":   emotion_result["all_scores"],
            "reflection":   reflection,
            "crisis_level": crisis["level"],
        }
    
    async def _handle_mood_log(self, payload: dict) -> dict:
        mood = payload["mood"]
        note = payload.get("note", "")

        self._save_mood(mood, note)

        store_memory(
            user_id     = self.user_id,
            text        = f"User felt {mood}. {note}".strip(),
            memory_type = "mood",
            emotion     = mood,
        )

        # retrain model silently every 5th mood log
        db = get_db_session()
        try:
            log_count = db.query(Mood).filter(
                Mood.user_id == self.user_id
            ).count()

            if log_count % 5 == 0:
                train_user_model(self.user_id)
        finally:
            db.close()

        prediction = get_mood_prediction(self.user_id)
        insights   = get_insights(self.user_id)
        suggestion = self._generate_mood_suggestion(
            mood, prediction, insights
        )

        return {
            "mood_saved":  True,
            "prediction":  prediction,
            "insights":    insights,
            "suggestion":  suggestion,
        }

    # ── Gemini prompt builders ─────────────────────────────────────────
    def _generate_chat_response(self, message, emotion, stress, context, crisis) -> str:
        prompt = f"""
    You are an empathetic AI mental health companion named Serenity.

    User context: {context}
    Detected emotion: {emotion}
    Stress level: {stress}/100
    Crisis level: {crisis['level']}

    User says: "{message}"

    Respond warmly, personally, under 4 sentences.
    If stress > 70, suggest one calming technique.
    If crisis level is medium or high, gently mention professional support.
    """
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt
        )
        return response.text

    def _generate_mood_suggestion(self, mood, prediction, insights) -> str:
        prompt = f"""
You are an AI mental health assistant.

User just logged mood: {mood}
Predicted tomorrow mood: {prediction}
Insights about user: {insights}

Give one short, specific, actionable suggestion (max 2 sentences).
Make it feel personal, not generic.
"""
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt
        )
        return response.text

    def _generate_journal_reflection(self, text, emotion, stress=0) -> str:
        prompt = f"""
You are a compassionate AI journaling assistant.

User wrote: "{text}"
Detected emotion: {emotion}
Stress level: {stress}/100

Write a 2-3 sentence empathetic reflection that:
- Validates their feelings
- Points out one positive or growth angle
- Asks one thoughtful follow-up question
"""
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt
        )
        return response.text

    # ── DB helpers ────────────────────────────────────────────────────
    def _save_chat(self, message, response, emotion):
        db = get_db_session()
        try:
            # Save user message
            db.add(ChatMessage(
                user_id=self.user_id,
                sender="user",
                message=message,
                emotion=emotion,
            ))
            # Save AI response
            db.add(ChatMessage(
                user_id=self.user_id,
                sender="ai",
                message=response,
                emotion=emotion,
            ))
            db.commit()
        finally:
            db.close()

    def _save_mood(self, mood, note):
        db = get_db_session()
        try:
            db.add(Mood(
                user_id=self.user_id,
                mood_state=mood,
                note=note,
            ))
            db.commit()
        finally:
            db.close()