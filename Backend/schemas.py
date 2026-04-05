"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# ── User ──────────────────────────────────────────────
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    preferred_tone: str
    reminder_time: str
    anonymous_mode: bool
    avatar_url: str

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    preferred_tone: Optional[str] = None
    reminder_time: Optional[str] = None
    anonymous_mode: Optional[bool] = None
    avatar_url: Optional[str] = None


# ── Mood ──────────────────────────────────────────────
class MoodCreateRequest(BaseModel):
    mood_state: str
    stress_level: int = 50
    note: str = ""


class MoodResponse(BaseModel):
    id: int
    mood_state: str
    stress_level: int
    note: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Journal ───────────────────────────────────────────
class JournalCreateRequest(BaseModel):
    content: str


class JournalResponse(BaseModel):
    id: int
    content: str
    ai_suggestion: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Chat ──────────────────────────────────────────────
class ChatSendRequest(BaseModel):
    message: str


class ChatMessageResponse(BaseModel):
    id: int
    sender: str
    message: str
    emotion: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSendResponse(BaseModel):
    user_message: ChatMessageResponse
    ai_message: ChatMessageResponse


# ── Insights ──────────────────────────────────────────
class InsightsSummary(BaseModel):
    total_moods: int
    mood_distribution: dict  # { "happy": 5, "sad": 2, ... }
    average_stress: float
    weekly_moods: List[MoodResponse]
    total_journals: int
    total_chats: int
    streak_days: int
