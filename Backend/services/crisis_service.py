import re
from datetime import datetime, timedelta
from database import get_db_session
from models import ChatMessage, CrisisLog

# ── Crisis keyword patterns (3 severity tiers) ────────────────────────
CRITICAL_PATTERNS = [
    r"\bsuicid\w*\b",
    r"\bkill\s+myself\b",
    r"\bend\s+(my\s+)?life\b",
    r"\bwant\s+to\s+die\b",
    r"\bself[\s\-]?harm\b",
    r"\bcut\s+myself\b",
    r"\bno\s+reason\s+to\s+live\b",
    r"\bcan'?t\s+go\s+on\b",
    r"\better\s+off\s+without\s+me\b",
]

HIGH_PATTERNS = [
    r"\bhopeless\b",
    r"\bgive\s+up\b",
    r"\bcan'?t\s+take\s+(it\s+)?anymore\b",
    r"\bnothing\s+matters\b",
    r"\bnobody\s+cares\b",
    r"\bworthless\b",
    r"\bpointless\b",
    r"\btrapped\b",
    r"\bno\s+way\s+out\b",
    r"\bexhausted\s+of\s+(life|everything)\b",
]

MEDIUM_PATTERNS = [
    r"\bvery\s+sad\b",
    r"\bso\s+depressed\b",
    r"\bbreaking\s+down\b",
    r"\bcan'?t\s+cope\b",
    r"\boverwhelmed\b",
    r"\balone\b",
    r"\bempty\b",
    r"\bnumb\b",
    r"\bstuck\b",
]


# ── Main function called by Orchestrator ──────────────────────────────
def check_crisis(text: str, emotion: str, context: str, user_id: int = None) -> dict:
    """
    Returns:
    {
        "level":   "none" | "medium" | "high" | "critical",
        "score":   0–100,
        "message": str (supportive message to show user),
        "actions": list of actions frontend should take
    }
    """
    text_lower = text.lower()

    # Signal 1: keyword match score
    keyword_score = _keyword_score(text_lower)

    # Signal 2: emotion intensity score
    emotion_score = _emotion_score(emotion)

    # Signal 3: historical pattern score
    history_score = _history_score(user_id) if user_id else 0

    # Weighted combination
    total_score = (
        keyword_score * 0.50 +
        emotion_score * 0.30 +
        history_score * 0.20
    )
    total_score = min(int(total_score), 100)

    # Determine level
    level = _get_level(total_score, text_lower)

    # Log if concerning
    if level != "none" and user_id:
        _log_crisis(user_id, text, level, total_score)

    return {
        "level":   level,
        "score":   total_score,
        "message": _get_support_message(level),
        "actions": _get_actions(level),
    }


# ── Signal 1: keyword pattern matching ───────────────────────────────
def _keyword_score(text: str) -> int:
    # critical keywords → instant high score
    for pattern in CRITICAL_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return 95

    score = 0
    for pattern in HIGH_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            score += 50

    for pattern in MEDIUM_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            score += 30

    return min(score, 100)


# ── Signal 2: emotion intensity ───────────────────────────────────────
def _emotion_score(emotion: str) -> int:
    mapping = {
        "sadness": 60,
        "fear":    55,
        "anger":   40,
        "disgust": 30,
        "neutral": 10,
        "surprise": 5,
        "joy":     0,
    }
    return mapping.get(emotion.lower(), 10)


# ── Signal 3: historical pattern (repeated negative mood) ────────────
def _history_score(user_id: int) -> int:
    try:
        db   = get_db_session()
        week_ago = datetime.utcnow() - timedelta(days=7)

        recent_chats = (
            db.query(ChatMessage)
            .filter(
                ChatMessage.user_id  == user_id,
                ChatMessage.created_at >= week_ago,
                ChatMessage.emotion.in_(["sadness", "fear", "anger"])
            )
            .count()
        )

        # more than 5 negative messages this week = escalating pattern
        if recent_chats >= 10:
            return 70
        elif recent_chats >= 5:
            return 40
        elif recent_chats >= 2:
            return 20
        return 0

    except Exception:
        return 0


# ── Determine final level ─────────────────────────────────────────────
def _get_level(score: int, text: str) -> str:
    # override: critical keywords always = critical level
    for pattern in CRITICAL_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return "critical"

    if score >= 70:
        return "high"
    elif score >= 40:
        return "medium"
    return "none"


# ── Support messages per level ────────────────────────────────────────
def _get_support_message(level: str) -> str:
    messages = {
        "none": None,
        "medium": (
            "I can hear that you're going through something difficult. "
            "I'm here with you. Would you like to talk more about it?"
        ),
        "high": (
            "I'm really glad you're sharing this with me. "
            "What you're feeling matters. "
            "Please know you don't have to go through this alone — "
            "talking to someone you trust or a professional can really help."
        ),
        "critical": (
            "I'm very concerned about you right now and I care about your safety. "
            "Please reach out to a crisis helpline immediately — "
            "they are available 24/7 and want to help. "
            "You matter, and this moment can pass."
        ),
    }
    return messages.get(level)


# ── Frontend actions per level ────────────────────────────────────────
def _get_actions(level: str) -> list:
    actions = {
        "none":     [],
        "medium":   ["show_empathy_banner"],
        "high":     ["show_empathy_banner", "suggest_breathing", "show_helpline"],
        "critical": ["show_crisis_modal", "show_helpline", "disable_normal_chat"],
    }
    return actions.get(level, [])


# ── Log crisis event to DB ────────────────────────────────────────────
def _log_crisis(user_id: int, text: str, level: str, score: int):
    try:
        db = get_db_session()
        db.add(CrisisLog(
            user_id   = user_id,
            text      = text[:500],
            level     = level,
            score     = score,
            timestamp = datetime.utcnow(),
        ))
        db.commit()
    except Exception:
        pass