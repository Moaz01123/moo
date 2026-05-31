from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Setting
from ..schemas import SettingsOut

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=SettingsOut)
def get_settings_public(db: Session = Depends(get_db)):
    rows = db.query(Setting).all()
    return SettingsOut(data={r.key: r.value for r in rows})
