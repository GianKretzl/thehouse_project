from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime


# Event Schemas
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    location: Optional[str] = None
    class_id: Optional[int] = None
    event_type: Optional[str] = "general"  # general, lesson, exam, meeting, holiday


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    location: Optional[str] = None
    class_id: Optional[int] = None
    event_type: Optional[str] = None
    is_active: Optional[bool] = None


class EventResponse(EventBase):
    id: int
    created_by: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    creator_name: Optional[str] = None
    class_name: Optional[str] = None

    class Config:
        from_attributes = True


# Material Reservation Schemas
class MaterialReservationBase(BaseModel):
    material_name: str
    description: Optional[str] = None
    reservation_date: date
    start_time: time
    end_time: time
    quantity: int = 1
    location: Optional[str] = None
    class_id: Optional[int] = None
    notes: Optional[str] = None


class MaterialReservationCreate(MaterialReservationBase):
    pass


class MaterialReservationUpdate(BaseModel):
    material_name: Optional[str] = None
    description: Optional[str] = None
    reservation_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    quantity: Optional[int] = None
    location: Optional[str] = None
    class_id: Optional[int] = None
    status: Optional[str] = None  # pending, confirmed, cancelled
    notes: Optional[str] = None


class MaterialReservationResponse(MaterialReservationBase):
    id: int
    reserved_by: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    reserver_name: Optional[str] = None
    class_name: Optional[str] = None

    class Config:
        from_attributes = True
