from transformers import pipeline
from functools import lru_cache
import re

# ── Load model once at startup (not on every request) ─────────────────
@lru_cache(maxsize=1)
def _load_model():
    return pipeline(
        "text-classification",
        model="j-hartmann/emotion-english-distilroberta-base",
        top_k=None,         # returns ALL emotion scores, not just top 1
        device=-1           # CPU; change to 0 if you have GPU
    )


# ── Main function called by Orchestrator ──────────────────────────────
def detect_emotion(text: str) -> dict:
    """
    Returns:
    {
        "primary":    "sadness",
        "score":      0.87,
        "all_scores": {"joy": 0.02, "sadness": 0.87, ...},
        "intensity":  "high"
    }
    """
    if not text or len(text.strip()) < 3:
        return _neutral_result()

    text = _clean_text(text)
    model = _load_model()

    results = model(text[:512])[0]   # cap at 512 tokens

    # build score dict
    scores = {r["label"].lower(): round(r["score"], 4) for r in results}

    # find primary emotion
    primary = max(scores, key=scores.get)
    primary_score = scores[primary]

    return {
        "primary":    primary,
        "score":      primary_score,
        "all_scores": scores,
        "intensity":  _get_intensity(primary_score),
    }


# ── Detect emotion from journal (longer text — chunk + aggregate) ─────
def detect_journal_emotion(text: str) -> dict:
    """
    For journal entries, split into sentences and aggregate scores.
    Gives a more accurate read on longer text.
    """
    sentences = _split_sentences(text)
    if not sentences:
        return _neutral_result()

    model = _load_model()
    aggregated = {}

    for sentence in sentences[:10]:   # max 10 sentences
        if len(sentence.strip()) < 5:
            continue
        results = model(sentence[:512])[0]
        for r in results:
            label = r["label"].lower()
            aggregated[label] = aggregated.get(label, 0) + r["score"]

    # normalize
    total = sum(aggregated.values())
    normalized = {k: round(v / total, 4) for k, v in aggregated.items()}

    primary = max(normalized, key=normalized.get)

    return {
        "primary":    primary,
        "score":      normalized[primary],
        "all_scores": normalized,
        "intensity":  _get_intensity(normalized[primary]),
    }


# ── Stress score derived from emotions (0–100) ────────────────────────
def calculate_stress_score(emotion_result: dict) -> int:
    scores = emotion_result.get("all_scores", {})
    stress = (
        scores.get("fear",    0) * 0.35 +
        scores.get("anger",   0) * 0.30 +
        scores.get("sadness", 0) * 0.25 +
        scores.get("disgust", 0) * 0.10
    )
    return min(int(stress * 100), 100)


# ── Helpers ───────────────────────────────────────────────────────────
def _get_intensity(score: float) -> str:
    if score >= 0.75:
        return "high"
    elif score >= 0.45:
        return "medium"
    else:
        return "low"


def _clean_text(text: str) -> str:
    text = re.sub(r"http\S+", "", text)       # remove URLs
    text = re.sub(r"[^\w\s.,!?']", " ", text) # remove special chars
    return text.strip()


def _split_sentences(text: str) -> list:
    return re.split(r"(?<=[.!?])\s+", text)


def _neutral_result() -> dict:
    return {
        "primary":    "neutral",
        "score":      1.0,
        "all_scores": {"neutral": 1.0},
        "intensity":  "low",
    }