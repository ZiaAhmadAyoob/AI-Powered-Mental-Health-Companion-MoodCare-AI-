from google import genai
from dotenv import load_dotenv
import os

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))  
model = client.models.get("gemini-3-flash-preview")     
    
# common cognitive distortion patterns
DISTORTIONS = {
    "all_or_nothing": [
        r"\balways\b", r"\bnever\b", r"\beverything\b", r"\bnothing\b"
    ],
    "catastrophizing": [
        r"\bterrible\b", r"\bawful\b", r"\bworst\b", r"\bruined\b"
    ],
    "mind_reading": [
        r"\bthey think\b", r"\beveryone thinks\b", r"\bthey hate\b"
    ],
    "self_blame": [
        r"\bmy fault\b", r"\bi ruined\b", r"\bi always fail\b", r"\bi'm worthless\b"
    ],
}


def analyze_cbt(text: str) -> dict:
    """
    Detects negative thought patterns and reframes them.
    Returns distortions found + reframed thought.
    """
    import re
    text_lower = text.lower()

    found_distortions = []
    for distortion, patterns in DISTORTIONS.items():
        for pattern in patterns:
            if re.search(pattern, text_lower):
                found_distortions.append(distortion)
                break

    reframe = _reframe_thought(text, found_distortions)

    return {
        "original":    text,
        "distortions": found_distortions,
        "reframe":     reframe,
        "has_distortion": len(found_distortions) > 0,
    }


def _reframe_thought(text: str, distortions: list) -> str:
    distortion_str = ", ".join(distortions) if distortions else "general negativity"

    prompt = f"""
You are a Cognitive Behavioral Therapy (CBT) assistant.

The user wrote: "{text}"
Detected thought patterns: {distortion_str}

Do the following in exactly 3 short paragraphs:
1. Validate their feeling with empathy (1 sentence)
2. Gently challenge the distorted thinking with a question (1 sentence)
3. Offer a balanced, realistic reframe of the thought (1-2 sentences)

Be warm, never clinical or robotic.
"""
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt,
    )
    return response.text.strip()