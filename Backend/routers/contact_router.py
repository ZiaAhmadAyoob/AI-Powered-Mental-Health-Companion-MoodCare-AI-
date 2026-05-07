"""Router for contact messages and feedback."""

from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from email_utils import send_feedback_email

router = APIRouter(prefix="/api/contact", tags=["contact"])

@router.post("", response_model=schemas.ContactMessageResponse)
def submit_contact_message(
    message_in: schemas.ContactMessageCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Submit a contact/feedback message and forward via email.
    """
    db_message = models.ContactMessage(
        name=message_in.name,
        email=message_in.email,
        subject=message_in.subject,
        message=message_in.message
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Schedule the email to be sent in the background
    background_tasks.add_task(
        send_feedback_email,
        user_email=message_in.email,
        feedback_message=f"Name: {message_in.name}\nSubject: {message_in.subject}\n\n{message_in.message}"
    )
    
    return db_message
