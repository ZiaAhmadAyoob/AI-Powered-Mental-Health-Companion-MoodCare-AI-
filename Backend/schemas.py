"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, EmailStr
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


class SocialLoginRequest(BaseModel):
    provider: str            # 'google' | 'facebook'
    email: Optional[str] = None
    name: Optional[str] = None
    access_token: Optional[str] = None  # provider OAuth token (used in production)


class SocialExchangeRequest(BaseModel):
    provider: str
    code: str
    redirect_uri: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class MessageResponse(BaseModel):
    message: str
    code: Optional[str] = None  # Only populated in dev mode (no email service)


# ── User ──────────────────────────────────────────────
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr 
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

# ── Contact Message ─────────────────────────────────────
class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr 
    subject: str
    message: str

class FeedbackRequest(BaseModel):
    email: EmailStr
    message: str

class ContactMessageResponse(BaseModel):
    id: int
    user_id: Optional[int]
    name: str
    email: EmailStr 
    subject: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
