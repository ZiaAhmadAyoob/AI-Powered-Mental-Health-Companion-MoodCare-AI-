from datetime import datetime, timedelta
from collections import defaultdict
from database import get_db_session
from models import Mood, ChatMessage, Journal
import os
from google import genai
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

from dotenv import load_dotenv

load_dotenv()

NEGATIVE_EMOTIONS = {"sadness", "fear", "anger", "disgust"}
POSITIVE_EMOTIONS = {"joy", "happy", "surprise"}

MOOD_SCORES = {
    "joy":      5,
    "happy":    5,
    "surprise": 4,
    "neutral":  3,
    "fear":     2,
    "sadness":  2,
    "anger":    1,
    "disgust":  1,
}

DAY_NAMES = ["Monday", "Tuesday", "Wednesday",
             "Thursday", "Friday", "Saturday", "Sunday"]


# ── Main function called by Orchestrator ──────────────────────────────
def get_insights(user_id: int) -> dict:
    """
    Returns:
    {
        "insights":        [list of insight strings],
        "weekly_summary":  str,
        "progress":        dict,
        "patterns":        dict (raw data for charts)
    }
    """
    raw = _collect_raw_data(user_id)

    if raw["total_moods"] < 3:
        return _no_data_response()

    # run all analyzers
    patterns = {
        "time":     _analyze_time_patterns(raw),
        "behavior": _analyze_behavior_links(raw),
        "triggers": _analyze_triggers(raw),
        "progress": _analyze_progress(raw),
    }

    # generate insight strings
    raw_insights = _build_raw_insights(patterns, raw)

    # let Gemini humanize them
    insight_strings = _humanize_insights(raw_insights, user_id)

    # weekly summary
    weekly_summary = _generate_weekly_summary(raw, patterns)

    return {
        "insights":       insight_strings,
        "weekly_summary": weekly_summary,
        "progress":       patterns["progress"],
        "patterns":       _build_chart_data(raw),
    }


# ── Collect all raw data ──────────────────────────────────────────────
def _collect_raw_data(user_id: int) -> dict:
    db      = get_db_session()
    month   = datetime.utcnow() - timedelta(days=30)
    week    = datetime.utcnow() - timedelta(days=7)
    prev    = datetime.utcnow() - timedelta(days=14)

    moods = (
        db.query(Mood)
        .filter(Mood.user_id == user_id, Mood.created_at >= month)
        .order_by(Mood.created_at.asc())
        .all()
    )

    chats = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id, ChatMessage.created_at >= month)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    journals = []
    try:
        journals = (
            db.query(Journal)
            .filter(Journal.user_id == user_id,
                    Journal.created_at >= month)
            .all()
        )
    except Exception:
        pass

    return {
        "moods":        moods,
        "chats":        chats,
        "journals":     journals,
        "total_moods":  len(moods),
        "total_chats":  len(chats),
        "total_journals": len(journals),
        "week_start":   week,
        "prev_start":   prev,
    }


# ── Analyzer 1: time patterns ─────────────────────────────────────────
def _analyze_time_patterns(raw: dict) -> dict:
    day_scores   = defaultdict(list)
    hour_scores  = defaultdict(list)

    for mood in raw["moods"]:
        day  = mood.created_at.weekday()   # 0=Monday
        score = MOOD_SCORES.get(mood.mood_state.lower(), 3)
        day_scores[day].append(score)

    for chat in raw["chats"]:
        hour  = chat.created_at.hour
        score = MOOD_SCORES.get((chat.emotion or "neutral").lower(), 3)
        hour_scores[hour].append(score)

    # average per day
    avg_by_day = {
        DAY_NAMES[d]: round(sum(v) / len(v), 2)
        for d, v in day_scores.items() if v
    }

    worst_day = min(avg_by_day, key=avg_by_day.get) if avg_by_day else None
    best_day  = max(avg_by_day, key=avg_by_day.get) if avg_by_day else None

    # morning vs evening
    morning_scores = [s for h, scores in hour_scores.items()
                      if 5 <= h < 12 for s in scores]
    evening_scores = [s for h, scores in hour_scores.items()
                      if 18 <= h < 24 for s in scores]

    morning_avg = round(sum(morning_scores) / len(morning_scores), 2) \
                  if morning_scores else None
    evening_avg = round(sum(evening_scores) / len(evening_scores), 2) \
                  if evening_scores else None

    return {
        "avg_by_day":   avg_by_day,
        "worst_day":    worst_day,
        "best_day":     best_day,
        "morning_avg":  morning_avg,
        "evening_avg":  evening_avg,
    }


# ── Analyzer 2: behavior links ────────────────────────────────────────
def _analyze_behavior_links(raw: dict) -> dict:
    journal_days = set()
    for j in raw["journals"]:
        d = j.created_at.date() if hasattr(j.created_at, "date") else j.created_at
        journal_days.add(d)

    journal_day_scores = []
    non_journal_scores = []

    for mood in raw["moods"]:
        day   = mood.created_at.date() if hasattr(mood.created_at, "date") else mood.created_at
        score = MOOD_SCORES.get(mood.mood_state.lower(), 3)
        if day in journal_days:
            journal_day_scores.append(score)
        else:
            non_journal_scores.append(score)

    journal_avg     = round(sum(journal_day_scores) / len(journal_day_scores), 2) \
                      if journal_day_scores else None
    non_journal_avg = round(sum(non_journal_scores) / len(non_journal_scores), 2) \
                      if non_journal_scores else None

    improvement = None
    if journal_avg and non_journal_avg:
        improvement = round(
            ((journal_avg - non_journal_avg) / non_journal_avg) * 100, 1
        )

    return {
        "journal_avg":     journal_avg,
        "non_journal_avg": non_journal_avg,
        "improvement_pct": improvement,
        "journal_days":    len(journal_days),
    }


# ── Analyzer 3: stress triggers ───────────────────────────────────────
def _analyze_triggers(raw: dict) -> dict:
    stress_days = []
    calm_days   = []

    for mood in raw["moods"]:
        score = MOOD_SCORES.get(mood.mood_state.lower(), 3)
        day   = mood.created_at.date() if hasattr(mood.created_at, "date") else mood.created_at
        if score <= 2:
            stress_days.append(day)
        elif score >= 4:
            calm_days.append(day)

    # check if stress days cluster around specific weekdays
    stress_weekdays = defaultdict(int)
    for d in stress_days:
        stress_weekdays[DAY_NAMES[d.weekday()]] += 1

    peak_stress_day = max(stress_weekdays, key=stress_weekdays.get) \
                      if stress_weekdays else None

    # late night usage pattern
    late_night_chats = [
        c for c in raw["chats"]
        if c.created_at.hour >= 22
        and (c.emotion or "").lower() in NEGATIVE_EMOTIONS
    ]

    return {
        "stress_days_count": len(stress_days),
        "calm_days_count":   len(calm_days),
        "peak_stress_day":   peak_stress_day,
        "late_night_stress": len(late_night_chats) > 2,
        "stress_weekdays":   dict(stress_weekdays),
    }


# ── Analyzer 4: week over week progress ──────────────────────────────
def _analyze_progress(raw: dict) -> dict:
    week_start = raw["week_start"]
    prev_start = raw["prev_start"]

    this_week_moods = [
        m for m in raw["moods"] if m.created_at >= week_start
    ]
    prev_week_moods = [
        m for m in raw["moods"]
        if prev_start <= m.created_at < week_start
    ]

    def avg_score(moods):
        if not moods:
            return None
        return round(
            sum(MOOD_SCORES.get(m.mood_state.lower(), 3) for m in moods) / len(moods), 2
        )

    this_avg = avg_score(this_week_moods)
    prev_avg = avg_score(prev_week_moods)

    change_pct = None
    direction  = "stable"
    if this_avg and prev_avg:
        change_pct = round(((this_avg - prev_avg) / prev_avg) * 100, 1)
        direction  = "improving" if change_pct > 5 \
                     else "declining" if change_pct < -5 \
                     else "stable"

    return {
        "this_week_avg": this_avg,
        "prev_week_avg": prev_avg,
        "change_pct":    change_pct,
        "direction":     direction,
        "this_week_logs": len(this_week_moods),
    }


# ── Build raw insight list ────────────────────────────────────────────
def _build_raw_insights(patterns: dict, raw: dict) -> list:
    insights = []
    time     = patterns["time"]
    behavior = patterns["behavior"]
    triggers = patterns["triggers"]
    progress = patterns["progress"]

    if time["worst_day"]:
        insights.append(
            f"Mood is usually lowest on {time['worst_day']}s"
        )
    if time["best_day"]:
        insights.append(
            f"Mood peaks on {time['best_day']}s"
        )
    if time["morning_avg"] and time["evening_avg"]:
        diff = time["morning_avg"] - time["evening_avg"]
        if diff > 0.5:
            insights.append("Mornings tend to feel better than evenings")
        elif diff < -0.5:
            insights.append("Evenings tend to feel better than mornings")

    if behavior["improvement_pct"] and behavior["improvement_pct"] > 10:
        insights.append(
            f"Mood is {behavior['improvement_pct']}% better on days with journaling"
        )

    if triggers["peak_stress_day"]:
        insights.append(
            f"Stress tends to peak on {triggers['peak_stress_day']}s"
        )
    if triggers["late_night_stress"]:
        insights.append(
            "Late-night sessions frequently show negative emotions"
        )

    if progress["direction"] == "improving":
        insights.append(
            f"Overall mood improved {progress['change_pct']}% this week"
        )
    elif progress["direction"] == "declining":
        insights.append(
            f"Mood has dipped {abs(progress['change_pct'])}% compared to last week"
        )

    return insights


# ── Gemini humanizes raw insights ────────────────────────────────────
def _humanize_insights(raw_insights: list, user_id: int) -> list:
    if not raw_insights:
        return ["Keep logging your mood — insights will appear soon."]

    prompt = f"""
You are a caring AI mental health assistant.

Here are raw data patterns discovered about a user:
{chr(10).join(f'- {i}' for i in raw_insights)}

Rewrite each pattern as a warm, personal 1-sentence insight.
- Sound like a supportive friend noticing something about them
- Be specific, not generic
- For negative patterns, add one small constructive suggestion
- Return ONLY a JSON array of strings, nothing else

Example format: ["insight 1", "insight 2"]
"""
    try:
        response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt
    )
        text     = response.text.strip()

        # safely parse JSON
        import json, re
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception:
        pass

    return raw_insights   # fallback to raw if Gemini fails


# ── Weekly summary ────────────────────────────────────────────────────
def _generate_weekly_summary(raw: dict, patterns: dict) -> str:
    progress = patterns["progress"]

    dominant_mood = "neutral"
    if raw["moods"]:
        from collections import Counter
        counts = Counter(m.mood_state.lower() for m in raw["moods"][-7:])
        dominant_mood = counts.most_common(1)[0][0]

    prompt = f"""
Write a 2-sentence weekly emotional summary for a mental health app user.

Data:
- Dominant mood this week: {dominant_mood}
- Week direction: {progress['direction']}
- Mood logs this week: {progress['this_week_logs']}
- Journal entries: {raw['total_journals']}

Be warm, honest, and encouraging. Max 2 sentences.
"""
    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt
        )
        return response.text.strip()
    except Exception:
        return "Keep tracking your mood — your weekly summary will appear here."


# ── Chart data for frontend ───────────────────────────────────────────
def _build_chart_data(raw: dict) -> dict:
    mood_by_day = defaultdict(list)
    for mood in raw["moods"]:
        day = mood.created_at.strftime("%Y-%m-%d") \
              if hasattr(mood.created_at, "strftime") else str(mood.created_at)
        mood_by_day[day].append(MOOD_SCORES.get(mood.mood_state.lower(), 3))

    chart_points = [
        {"date": d, "score": round(sum(v) / len(v), 2)}
        for d, v in sorted(mood_by_day.items())
    ]

    emotion_counts = defaultdict(int)
    for chat in raw["chats"]:
        if chat.emotion:
            emotion_counts[chat.emotion.lower()] += 1

    return {
        "mood_timeline":  chart_points,
        "emotion_counts": dict(emotion_counts),
    }


# ── No data fallback ──────────────────────────────────────────────────
def _no_data_response() -> dict:
    return {
        "insights": [
            "Log your mood daily and I'll start discovering patterns about you."
        ],
        "weekly_summary": "Not enough data yet — keep going!",
        "progress":       {},
        "patterns":       {},
    }