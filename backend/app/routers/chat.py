import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..assistant import generate_reply
from ..database import get_db
from ..models import SupportMessage
from ..schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    session_id = payload.session_id or uuid.uuid4().hex

    history_rows = (
        db.query(SupportMessage)
        .filter(SupportMessage.session_id == session_id)
        .order_by(SupportMessage.created_at.asc())
        .all()
    )
    history = [{"role": r.role, "content": r.content} for r in history_rows]

    db.add(SupportMessage(session_id=session_id, role="user", content=payload.message))

    reply = generate_reply(payload.message, db, history)

    db.add(SupportMessage(session_id=session_id, role="assistant", content=reply))
    db.commit()

    return ChatResponse(reply=reply, session_id=session_id)
