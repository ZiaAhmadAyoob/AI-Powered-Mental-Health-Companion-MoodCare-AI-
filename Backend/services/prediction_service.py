import torch
import torch.nn as nn
import os
from datetime import datetime, timedelta
from database import get_db_session
from models import Mood, ChatMessage
from google import genai
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# ── Mood encoding ─────────────────────────────────────────────────────
MOOD_MAP = {
    "joy":      0,
    "happy":    0,
    "neutral":  1,
    "surprise": 1,
    "sadness":  2,
    "sad":      2,
    "fear":     3,
    "anger":    4,
    "angry":    4,
    "disgust":  4,
}

MOOD_LABELS = {
    0: "positive",
    1: "neutral",
    2: "sad",
    3: "anxious",
    4: "stressed",
}

MODEL_DIR = "ml_models"
os.makedirs(MODEL_DIR, exist_ok=True)


# ── LSTM Model definition ─────────────────────────────────────────────
class MoodLSTM(nn.Module):
    def __init__(self, input_size=3, hidden_size=32, output_size=5):
        super(MoodLSTM, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.fc   = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])   # last timestep only


# ── Get model path per user ───────────────────────────────────────────
def _model_path(user_id: int) -> str:
    return os.path.join(MODEL_DIR, f"lstm_user_{user_id}.pt")


# ── Fetch and build feature matrix from DB ───────────────────────────
def _build_features(user_id: int, days: int = 14) -> list:
    """
    Returns list of daily feature vectors:
    [mood_encoded, stress_proxy, chat_count]
    """
    db       = get_db_session()
    since    = datetime.utcnow() - timedelta(days=days)

    mood_logs = (
        db.query(Mood)
        .filter(Mood.user_id == user_id, Mood.created_at >= since)
        .order_by(Mood.created_at.asc())
        .all()
    )

    chat_logs = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id, ChatMessage.created_at >= since)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    # group chats by day
    chat_by_day = {}
    for c in chat_logs:
        day = c.created_at.date()
        chat_by_day[day] = chat_by_day.get(day, 0) + 1

    # negative emotion proxy from chat
    neg_emotions = {"sadness", "fear", "anger", "disgust"}
    neg_by_day   = {}
    for c in chat_logs:
        day = c.created_at.date()
        if c.emotion and c.emotion.lower() in neg_emotions:
            neg_by_day[day] = neg_by_day.get(day, 0) + 1

    features = []
    for log in mood_logs:
        day          = log.created_at.date() if hasattr(log.created_at, "date") else log.created_at
        mood_encoded = MOOD_MAP.get(log.mood_state.lower(), 1) / 4.0   # normalize 0–1
        stress_proxy = min(neg_by_day.get(day, 0) / 5.0, 1.0)   # normalize
        chat_count   = min(chat_by_day.get(day, 0) / 10.0, 1.0) # normalize

        features.append([mood_encoded, stress_proxy, chat_count])

    return features


# ── Train LSTM for a specific user ────────────────────────────────────
def train_user_model(user_id: int) -> bool:
    """
    Trains a lightweight LSTM on the user's own mood history.
    Called after enough data is collected (min 7 entries).
    Returns True if training succeeded.
    """
    features = _build_features(user_id, days=30)

    if len(features) < 7:
        return False   # not enough data yet

    # build sequences: window of 5 days → predict next
    SEQ_LEN  = 5
    X, y     = [], []

    for i in range(len(features) - SEQ_LEN):
        X.append(features[i : i + SEQ_LEN])
        next_mood = features[i + SEQ_LEN][0]
        # convert back to class 0–4
        label = round(next_mood * 4)
        y.append(label)

    if len(X) < 3:
        return False

    X_tensor = torch.tensor(X, dtype=torch.float32)
    y_tensor = torch.tensor(y, dtype=torch.long)

    model     = MoodLSTM()
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

    model.train()
    for epoch in range(100):
        optimizer.zero_grad()
        outputs = model(X_tensor)
        loss    = criterion(outputs, y_tensor)
        loss.backward()
        optimizer.step()

    torch.save(model.state_dict(), _model_path(user_id))
    return True


# ── Predict tomorrow's mood ───────────────────────────────────────────
def get_mood_prediction(user_id: int) -> dict:
    """
    Returns prediction dict with mood, confidence, stress risk,
    and a Gemini-formatted insight string.
    """
    features = _build_features(user_id, days=14)

    if len(features) < 5:
        return _no_data_response()

    # auto-train if model doesn't exist yet
    model_file = _model_path(user_id)
    if not os.path.exists(model_file):
        trained = train_user_model(user_id)
        if not trained:
            return _no_data_response()

    # load model
    model = MoodLSTM()
    model.load_state_dict(torch.load(model_file, map_location="cpu"))
    model.eval()

    # use last 5 days as input sequence
    sequence  = features[-5:]
    x_tensor  = torch.tensor([sequence], dtype=torch.float32)

    with torch.no_grad():
        output      = model(x_tensor)
        probs       = torch.softmax(output, dim=1)[0]
        predicted   = torch.argmax(probs).item()
        confidence  = round(probs[predicted].item() * 100, 1)

    mood_label   = MOOD_LABELS[predicted]
    stress_risk  = _calculate_stress_risk(features[-5:])
    insight      = _generate_insight(mood_label, confidence, stress_risk, features)

    return {
        "predicted_mood": mood_label,
        "confidence":     confidence,
        "stress_risk":    stress_risk,
        "insight":        insight,
        "data_points":    len(features),
    }


# ── Stress risk from recent trend ─────────────────────────────────────
def _calculate_stress_risk(recent_features: list) -> str:
    avg_stress = sum(f[1] for f in recent_features) / len(recent_features)
    if avg_stress > 0.6:
        return "high"
    elif avg_stress > 0.3:
        return "moderate"
    return "low"


# ── Gemini formats the prediction into natural language ───────────────
def _generate_insight(mood: str, confidence: float, stress_risk: str, features: list) -> str:
    recent_moods = [MOOD_LABELS.get(round(f[0] * 4), "neutral") for f in features[-5:]]

    prompt = f"""
You are an AI mental health assistant giving a daily mood forecast.

Prediction data:
- Predicted mood for tomorrow: {mood}
- Confidence: {confidence}%
- Stress risk: {stress_risk}
- Recent mood pattern (last 5 days): {recent_moods}

Write a short, warm, 2-sentence insight for the user about their predicted tomorrow.
- Mention the predicted mood naturally
- If stress risk is high or moderate, suggest one small preventive action
- Sound like a caring friend, not a clinical report
- Do not mention percentages or confidence scores directly
"""
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt
    )
    return response.text.strip()


# ── Fallback when not enough data ────────────────────────────────────
def _no_data_response() -> dict:
    return {
        "predicted_mood": None,
        "confidence":     None,
        "stress_risk":    None,
        "insight":        (
            "Keep logging your mood daily — "
            "once I have enough data, I'll start predicting "
            "how you might feel tomorrow."
        ),
        "data_points": 0,
    }