import faiss
import os
import pickle
from sentence_transformers import SentenceTransformer
from datetime import datetime
from database import get_db_session
from models import Mood

# ── Load embedding model once ─────────────────────────────────────────
_embedder = SentenceTransformer("all-MiniLM-L6-v2")

# ── Directory to store per-user FAISS indexes ─────────────────────────
MEMORY_DIR = "memory_store"
os.makedirs(MEMORY_DIR, exist_ok=True)


# ── Internal: get paths for a user ────────────────────────────────────
def _index_path(user_id: int) -> str:
    return os.path.join(MEMORY_DIR, f"user_{user_id}.index")

def _meta_path(user_id: int) -> str:
    return os.path.join(MEMORY_DIR, f"user_{user_id}.meta")


# ── Internal: load or create FAISS index for user ─────────────────────
def _load_index(user_id: int):
    path = _index_path(user_id)
    if os.path.exists(path):
        return faiss.read_index(path)
    # 384 = dimension of all-MiniLM-L6-v2 embeddings
    return faiss.IndexFlatL2(384)


# ── Internal: load or create metadata list ────────────────────────────
def _load_meta(user_id: int) -> list:
    path = _meta_path(user_id)
    if os.path.exists(path):
        with open(path, "rb") as f:
            return pickle.load(f)
    return []


# ── Internal: save index and metadata ─────────────────────────────────
def _save(user_id: int, index, meta: list):
    faiss.write_index(index, _index_path(user_id))
    with open(_meta_path(user_id), "wb") as f:
        pickle.dump(meta, f)


# ── PUBLIC: Store a new memory ─────────────────────────────────────────
def store_memory(user_id: int, text: str, memory_type: str, emotion: str = None):
    """
    memory_type: "chat" | "mood" | "journal"
    Embeds the text and adds it to the user's FAISS index.
    """
    if not text or len(text.strip()) < 5:
        return

    index = _load_index(user_id)
    meta  = _load_meta(user_id)

    embedding = _embedder.encode([text], convert_to_numpy=True)
    embedding = embedding.astype("float32")

    index.add(embedding)

    meta.append({
        "text":      text,
        "type":      memory_type,
        "emotion":   emotion,
        "timestamp": datetime.utcnow().isoformat(),
    })

    _save(user_id, index, meta)


# ── PUBLIC: Retrieve most relevant memories ───────────────────────────
def retrieve_memories(user_id: int, query: str, top_k: int = 5) -> list:
    """
    Returns top_k most semantically similar past memories to the query.
    """
    index = _load_index(user_id)
    meta  = _load_meta(user_id)

    if index.ntotal == 0:
        return []

    query_embedding = _embedder.encode([query], convert_to_numpy=True)
    query_embedding = query_embedding.astype("float32")

    k = min(top_k, index.ntotal)
    distances, indices = index.search(query_embedding, k)

    results = []
    for i, idx in enumerate(indices[0]):
        if idx == -1:
            continue
        entry = meta[idx].copy()
        entry["relevance_score"] = round(float(1 / (1 + distances[0][i])), 4)
        results.append(entry)

    return results


# ── PUBLIC: Build context string for Gemini prompt ────────────────────
def get_user_context(user_id: int, current_message: str = "") -> str:
    """
    Called by Orchestrator. Returns a formatted string
    of relevant past memories to inject into the AI prompt.
    """
    # recent DB entries (always include last 3 moods)
    recent_moods   = _get_recent_moods(user_id)

    # semantic memory (most relevant to current message)
    if current_message:
        memories = retrieve_memories(user_id, current_message, top_k=5)
    else:
        memories = retrieve_memories(user_id, "how are you feeling", top_k=5)

    if not memories and not recent_moods:
        return "No past context available. This may be the user's first session."

    lines = []

    if recent_moods:
        lines.append("Recent mood history:")
        for m in recent_moods:
            lines.append(f"  - {m['date']}: {m['mood']} — {m['note']}")

    if memories:
        lines.append("\nRelevant past memories:")
        for m in memories:
            ts = m["timestamp"][:10]
            lines.append(f"  - [{m['type']} on {ts}] {m['text'][:120]}")
            if m.get("emotion"):
                lines[-1] += f" (emotion: {m['emotion']})"

    return "\n".join(lines)


# ── PUBLIC: Build full user emotional profile ─────────────────────────
def get_user_profile(user_id: int) -> dict:
    """
    Returns aggregated stats about the user.
    Used by prediction and insight agents.
    """
    meta = _load_meta(user_id)

    emotion_counts = {}
    for m in meta:
        e = m.get("emotion")
        if e:
            emotion_counts[e] = emotion_counts.get(e, 0) + 1

    dominant_emotion = max(emotion_counts, key=emotion_counts.get) \
                       if emotion_counts else "neutral"

    total_memories = len(meta)

    return {
        "dominant_emotion": dominant_emotion,
        "emotion_counts":   emotion_counts,
        "total_memories":   total_memories,
    }


# ── Internal: fetch recent moods from MySQL ───────────────────────────
def _get_recent_moods(user_id: int, limit: int = 5) -> list:
    try:
        db = get_db_session()
        rows = (
            db.query(Mood)
            .filter(Mood.user_id == user_id)
            .order_by(Mood.created_at.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "date":  r.created_at.strftime("%Y-%m-%d"),
                "mood":  r.mood_state,
                "note":  r.note or "",
            }
            for r in rows
        ]
    except Exception:
        return []