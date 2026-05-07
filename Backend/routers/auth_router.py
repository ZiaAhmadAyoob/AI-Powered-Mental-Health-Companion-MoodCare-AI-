"""Authentication endpoints — register and login."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from auth import hash_password, verify_password, create_access_token
import models
import schemas
import aiosmtplib
from email.message import EmailMessage
from config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SENDER_EMAIL, FORGOT_PASSWORD_SECRET_KEY, FORGOT_PASSWORD_TOKEN_EXPIRE_MINUTES
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta, timezone
from email_utils import send_feedback_email, send_welcome_email, send_feedback_thankyou_email

LOGIN_MAX_ATTEMPTS = 5
LOGIN_LOCKOUT_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")    
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _check_and_handle_lockout(user, db: Session):
    """Shared lockout helper used by both /login and /token."""
    if user.locked_until and user.locked_until.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc):
        remaining = (user.locked_until.replace(tzinfo=timezone.utc) - datetime.now(timezone.utc)).seconds // 60 + 1
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is locked due to too many failed login attempts. Try again in {remaining} minutes.",
        )
    # If lockout has expired, reset counters
    if user.locked_until and user.locked_until.replace(tzinfo=timezone.utc) <= datetime.now(timezone.utc):
        user.failed_login_attempts = 0
        user.locked_until = None
        db.commit()


def _record_failed_login(user, db: Session):
    """Increment failed attempts and lock if threshold reached."""
    user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
    if user.failed_login_attempts >= LOGIN_MAX_ATTEMPTS:
        user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOGIN_LOCKOUT_MINUTES)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Too many failed login attempts. Account locked for {LOGIN_LOCKOUT_MINUTES} minutes.",
        )
    db.commit()


def _record_successful_login(user, db: Session):
    """Reset lockout counters on successful login."""
    if user.failed_login_attempts or user.locked_until:
        user.failed_login_attempts = 0
        user.locked_until = None
        db.commit()


@router.post("/register", response_model=schemas.TokenResponse)
async def register(req: schemas.RegisterRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(models.User).filter(models.User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = models.User(
        name=req.name,
        email=req.email,
        hashed_password=hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Send welcome email (non-blocking)
    try:
        await send_welcome_email(user.email, user.name)
    except Exception as e:
        print(f"⚠️ Welcome email failed: {e}")

    token = create_access_token(data={"sub": str(user.id)})
    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserResponse.model_validate(user),
    )


@router.post("/login", response_model=schemas.TokenResponse)
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Check lockout
    _check_and_handle_lockout(user, db)

    if not verify_password(req.password, user.hashed_password):
        _record_failed_login(user, db)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Success — reset lockout counters
    _record_successful_login(user, db)

    token = create_access_token(data={"sub": str(user.id)})
    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserResponse.model_validate(user),
    )


@router.post("/token", response_model=schemas.TokenResponse)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Check lockout
    _check_and_handle_lockout(user, db)

    if not verify_password(form_data.password, user.hashed_password):
        _record_failed_login(user, db)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Success — reset lockout counters
    _record_successful_login(user, db)

    token = create_access_token(data={"sub": str(user.id)})
    return schemas.TokenResponse(
        access_token=token,
        token_type="bearer",
        user=schemas.UserResponse.model_validate(user),
    )


@router.post("/social", response_model=schemas.TokenResponse)
def social_login(req: schemas.SocialLoginRequest, db: Session = Depends(get_db)):
    """Create-or-login a user via Google / Facebook OAuth."""
    import secrets
    import requests

    email = req.email
    name = req.name or "User"

    if req.access_token:
        try:
            if req.provider == "google":
                resp = requests.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {req.access_token}"}
                )
                if not resp.ok:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Google access token")
                data = resp.json()
                email = data.get("email")
                name = data.get("name")
            elif req.provider == "facebook":
                resp = requests.get(
                    f"https://graph.facebook.com/me?fields=name,email&access_token={req.access_token}"
                )
                if not resp.ok:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Facebook access token")
                data = resp.json()
                email = data.get("email")
                name = data.get("name")
            else:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported provider")
        except requests.exceptions.RequestException:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not verify token with provider")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required for social login",
        )

    # Find existing user or create a new one
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        # First-time social login → auto-register with a random password
        user = models.User(
            name=name,
            email=email,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserResponse.model_validate(user),
    )
@router.post("/social/exchange", response_model=schemas.TokenResponse)
def social_exchange(req: schemas.SocialExchangeRequest, db: Session = Depends(get_db)):
    """Exchange OAuth code for access token and login/register user."""
    import requests
    import secrets
    from config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET

    email = None
    name = "User"

    try:
        if req.provider == "google":
            if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
                raise HTTPException(status_code=500, detail="Google OAuth not configured on server")
            
            # Exchange code for access token
            token_url = "https://oauth2.googleapis.com/token"
            data = {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "code": req.code,
                "grant_type": "authorization_code",
                "redirect_uri": req.redirect_uri,
            }
            resp = requests.post(token_url, data=data)
            if not resp.ok:
                raise HTTPException(status_code=400, detail=f"Google token exchange failed: {resp.text}")
            
            access_token = resp.json().get("access_token")
            
            # Get user info
            userinfo_resp = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            if not userinfo_resp.ok:
                raise HTTPException(status_code=400, detail="Failed to fetch Google user info")
            
            user_data = userinfo_resp.json()
            email = user_data.get("email")
            name = user_data.get("name")
            
        elif req.provider == "facebook":
            if not FACEBOOK_CLIENT_ID or not FACEBOOK_CLIENT_SECRET:
                raise HTTPException(status_code=500, detail="Facebook OAuth not configured on server")
                
            # Exchange code for access token
            token_url = "https://graph.facebook.com/v19.0/oauth/access_token"
            params = {
                "client_id": FACEBOOK_CLIENT_ID,
                "client_secret": FACEBOOK_CLIENT_SECRET,
                "redirect_uri": req.redirect_uri,
                "code": req.code,
            }
            resp = requests.get(token_url, params=params)
            if not resp.ok:
                raise HTTPException(status_code=400, detail=f"Facebook token exchange failed: {resp.text}")
                
            access_token = resp.json().get("access_token")
            
            # Get user info
            userinfo_resp = requests.get(
                f"https://graph.facebook.com/me?fields=name,email&access_token={access_token}"
            )
            if not userinfo_resp.ok:
                raise HTTPException(status_code=400, detail="Failed to fetch Facebook user info")
                
            user_data = userinfo_resp.json()
            email = user_data.get("email")
            name = user_data.get("name")
        else:
            raise HTTPException(status_code=400, detail="Unsupported provider")
            
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=f"OAuth communication error: {str(e)}")

    if not email:
        raise HTTPException(status_code=400, detail="Email is required from OAuth provider")

    # Find existing user or create a new one
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        # First-time social login → auto-register with a random password
        user = models.User(
            name=name,
            email=email,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserResponse.model_validate(user),
    )

async def send_email(to_email: str, code: str):
    print("📨 Sending email to:", to_email)

    message = EmailMessage()
    message["From"] = f"MoodCare AI <{SENDER_EMAIL}>"
    message["To"] = to_email
    message["Subject"] = "Password Reset Code"
    message.set_content(f"""
Password Reset Request

Your OTP code is: {code}

This code will expire in 15 minutes.

If you did not request this, please ignore this email.
""")

    html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <div style="background: #4f46e5; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">MoodCare AI</h2>
            <p style="margin: 5px 0 0;">Password Reset</p>
          </div>

          <div style="padding: 20px; text-align: center;">
            <p>Your password reset code is:</p>
            
            <h1 style="letter-spacing: 5px; color: #4f46e5;">{code}</h1>

            <p style="color: #555;">This code expires in 15 minutes.</p>
          </div>

          <div style="padding: 15px; text-align: center; font-size: 12px; color: #888;">
            If you didn’t request this, you can safely ignore this email.
          </div>

        </div>

      </body>
    </html>
    """
    code_str = str(code).zfill(6)
    html_content = html_content.replace(" d1 ", code_str[0])
    html_content = html_content.replace(" d2 ", code_str[1])
    html_content = html_content.replace(" d3 ", code_str[2])
    html_content = html_content.replace(" d4 ", code_str[3])
    html_content = html_content.replace(" d5 ", code_str[4])
    html_content = html_content.replace(" d6 ", code_str[5])

    message.add_alternative(html_content, subtype="html")
    try:
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            use_tls=(SMTP_PORT == 465),
            start_tls=(SMTP_PORT == 587),
            username=SMTP_USER,
            password=SMTP_PASSWORD,
        )

    except Exception as e:
        print("SMTP ERROR:", e)
        raise e

@router.post("/forgot-password", response_model=schemas.MessageResponse)
async def forgot_password(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generate a 6-digit reset code. Limited to 2 requests per 20 minutes."""
    import secrets
    from datetime import datetime, timedelta, timezone
    from database import engine, Base

    OTP_MAX_ATTEMPTS = 2
    OTP_COOLDOWN_MINUTES = 20

    # Ensure the password_resets table exists
    models.PasswordReset.__table__.create(bind=engine, checkfirst=True)

    user = db.query(models.User).filter(models.User.email == req.email).first()

    # Always return success to avoid email enumeration
    if not user:
        return schemas.MessageResponse(message="If that email exists, a reset code has been sent.")

    # ── Rate limit: max 2 OTP requests per 20 minutes ──
    cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=OTP_COOLDOWN_MINUTES)
    recent_attempts = db.query(models.PasswordReset).filter(
        models.PasswordReset.user_id == user.id,
        models.PasswordReset.created_at >= cutoff_time,
    ).count()

    if recent_attempts >= OTP_MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many OTP requests. Please wait {OTP_COOLDOWN_MINUTES} minutes before trying again.",
        )

    # Invalidate any existing unused tokens for this user
    db.query(models.PasswordReset).filter(
        models.PasswordReset.user_id == user.id,
        models.PasswordReset.used == False,
    ).update({"used": True})

    # Generate a 6-digit numeric code
    code = f"{secrets.randbelow(1000000):06d}"

    reset = models.PasswordReset(
        user_id=user.id,
        token=code,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=FORGOT_PASSWORD_TOKEN_EXPIRE_MINUTES),
    )
    db.add(reset)
    db.commit()

    try:
        print(f"OTP for {req.email}: {code}")
        await send_email(req.email, code)
    except Exception as e:
        print("❌ Email error:", e)

    return schemas.MessageResponse(
        message="If that email exists, a reset code has been sent."
    )

OTP_VERIFY_MAX_ATTEMPTS = 5

@router.post("/reset-password", response_model=schemas.MessageResponse)
def reset_password(req: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    """Validate the reset code and set a new password. Max 5 verification attempts per day."""

    reset = db.query(models.PasswordReset).filter(
        models.PasswordReset.token == req.token,
        models.PasswordReset.used == False,
    ).first()

    if not reset:
        # Even if code not found, count daily attempts for the user via any recent reset record
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code.",
        )

    # ── Check daily verification attempts ──
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    daily_attempts = db.query(
        models.PasswordReset
    ).filter(
        models.PasswordReset.user_id == reset.user_id,
        models.PasswordReset.created_at >= today_start,
    ).all()
    total_verify_attempts = sum(r.verify_attempts or 0 for r in daily_attempts)

    if total_verify_attempts >= OTP_VERIFY_MAX_ATTEMPTS:
        # Lock all unused codes
        db.query(models.PasswordReset).filter(
            models.PasswordReset.user_id == reset.user_id,
            models.PasswordReset.used == False,
        ).update({"used": True})
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed OTP attempts today. Please request a new code tomorrow.",
        )

    # Check expiry
    if datetime.now(timezone.utc) > reset.expires_at.replace(tzinfo=timezone.utc):
        reset.used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset code has expired. Please request a new one.",
        )

    # Verify the code matches
    if reset.token != req.token:
        reset.verify_attempts = (reset.verify_attempts or 0) + 1
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code.",
        )

    # Update the password
    user = db.query(models.User).filter(models.User.id == reset.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    user.hashed_password = hash_password(req.new_password)
    reset.used = True
    db.commit()
    return schemas.MessageResponse(message="Password has been reset successfully.")

@router.post("/feedback")
async def submit_feedback(req: schemas.FeedbackRequest):
    # Forward feedback to admin
    await send_feedback_email(req.email, req.message)

    # Send thank-you email to the user
    try:
        await send_feedback_thankyou_email(req.email)
    except Exception as e:
        print(f"⚠️ Thank-you email failed: {e}")

    return {"message": "Feedback sent successfully"}