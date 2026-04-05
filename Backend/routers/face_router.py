from fastapi import APIRouter, Depends
from pydantic import BaseModel
from services.face_emotion_service import analyze_face_emotion
from auth import get_current_user

router = APIRouter(prefix="/api/face", tags=["Face Emotion"])

class FaceRequest(BaseModel):
    image: str   # base64 string from frontend canvas

@router.post("/analyze-face")
async def analyze_face(
    request: FaceRequest,
    user = Depends(get_current_user)
):
    result = analyze_face_emotion(request.image)
    return result