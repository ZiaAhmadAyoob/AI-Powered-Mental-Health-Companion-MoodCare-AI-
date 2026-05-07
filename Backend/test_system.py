import asyncio
import sys
sys.path.append(".")

from services.orchestrator import OrchestratorAgent
from services.emotion_service import detect_emotion, calculate_stress_score
from services.memory_service import store_memory, get_user_context
from services.crisis_service import check_crisis
from services.prediction_service import get_mood_prediction, train_user_model
from services.insight_service import get_insights

TEST_USER_ID = 1   # make sure this user exists in your DB

async def run_tests():
    print("-" * 50)
    print("TESTING ALL AI AGENTS")
    print("-" * 50)

    # ── Test 1: Emotion Agent ─────────────────────────
    print("\n[1] Emotion Agent")
    result = detect_emotion("I feel so overwhelmed and anxious today")
    stress = calculate_stress_score(result)
    print(f"    Emotion:  {result['primary']} ({result['intensity']})")
    print(f"    Score:    {result['score']}")
    print(f"    Stress:   {stress}/100")
    assert result["primary"] in ["fear", "sadness", "anger", "neutral", "joy",
                                  "disgust", "surprise"], "Emotion not recognized"
    print("    PASSED OK")

    # ── Test 2: Memory Agent ──────────────────────────
    print("\n[2] Memory Agent")
    store_memory(TEST_USER_ID, "I feel anxious about my job", "chat", "fear")
    store_memory(TEST_USER_ID, "Had a great day today!", "mood", "joy")
    store_memory(TEST_USER_ID, "Work is really stressing me out", "journal", "sadness")

    context = get_user_context(TEST_USER_ID, "I am stressed about work")
    print(f"    Context preview: {context[:120]}...")
    assert len(context) > 10, "Context is empty"
    print("    PASSED OK")

    # ── Test 3: Crisis Agent ──────────────────────────
    print("\n[3] Crisis Agent")

    safe_result = check_crisis("I feel a bit tired today", "neutral", "", TEST_USER_ID)
    print(f"    Safe message -> level: {safe_result['level']}")
    assert safe_result["level"] == "none", "False positive on safe message"

    medium_result = check_crisis("I feel so hopeless and overwhelmed", "sadness", "", TEST_USER_ID)
    print(f"    Medium message -> level: {medium_result['level']}, score: {medium_result['score']}")
    assert medium_result["level"] in ["medium", "high"], "Should detect concern"

    critical_result = check_crisis("I want to end my life", "sadness", "", TEST_USER_ID)
    print(f"    Critical message -> level: {critical_result['level']}")
    assert critical_result["level"] == "critical", "Must detect critical signal"

    print("    PASSED OK")

    # ── Test 4: Prediction Agent ──────────────────────
    print("\n[4] Prediction Agent")
    prediction = get_mood_prediction(TEST_USER_ID)
    print(f"    Insight: {prediction['insight'][:100]}...")
    print(f"    Data points: {prediction['data_points']}")
    assert "insight" in prediction, "Prediction missing insight"
    print("    PASSED OK")

    # ── Test 5: Insight Agent ─────────────────────────
    print("\n[5] Insight Agent")
    insights = get_insights(TEST_USER_ID)
    print(f"    Summary: {insights['weekly_summary'][:100]}...")
    print(f"    Insights found: {len(insights['insights'])}")
    assert "insights" in insights, "Missing insights key"
    print("    PASSED OK")  

    # ── Test 6: Full Orchestrator (end-to-end) ────────
    print("\n[6] Full Orchestrator — chat flow")
    agent  = OrchestratorAgent(user_id=TEST_USER_ID)
    result = await agent.handle("chat", {
        "message": "I've been feeling really anxious about work lately"
    })
    print(f"    Response:     {result['response'][:100]}...")
    print(f"    Emotion:      {result['emotion']}")
    print(f"    Stress:       {result['stress']}")
    print(f"    Crisis level: {result['crisis_level']}")
    assert "response" in result, "No response from orchestrator"
    print("    PASSED OK")  

    print("\n[7] Full Orchestrator — mood log flow")
    result = await agent.handle("mood_log", {
        "mood": "sad",
        "note": "rough day at work"
    })
    print(f"    Suggestion: {result['suggestion'][:100]}...")
    assert result["mood_saved"], "Mood not saved"
    print("    PASSED OK")  

    print("\n[8] Full Orchestrator — journal flow")
    result = await agent.handle("journal", {
        "text": "Today was really hard. I keep doubting myself at work."
    })
    print(f"    Reflection:   {result['reflection'][:100]}...")
    print(f"    Emotion:      {result['emotion']}")
    print(f"    Crisis level: {result['crisis_level']}")
    assert "reflection" in result, "No reflection returned"
    print("    PASSED OK")      

    print("\n" + "-"*50)
    print("ALL TESTS PASSED")   
    print("-"*50 + "\n")


if __name__ == "__main__":
    asyncio.run(run_tests())