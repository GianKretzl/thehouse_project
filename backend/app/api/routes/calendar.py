from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.api.dependencies import get_db, get_current_user
from app.models import User, Event, MaterialReservation, Class
from app.schemas.calendar import (
    EventCreate,
    EventUpdate,
    EventResponse,
    MaterialReservationCreate,
    MaterialReservationUpdate,
    MaterialReservationResponse,
)

router = APIRouter()


# ==================== EVENTS ====================

@router.get("/events", response_model=List[EventResponse])
def list_events(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    event_type: Optional[str] = Query(None),
    class_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Listar eventos
    - Professores: eventos gerais + eventos da suas turmas
    - Secretários/Pedagogos/Diretores: todos os eventos
    """
    query = db.query(Event).filter(Event.is_active == True)

    # Filtros de data
    if start_date:
        query = query.filter(Event.event_date >= start_date)
    if end_date:
        query = query.filter(Event.event_date <= end_date)

    # Filtro de tipo
    if event_type:
        query = query.filter(Event.event_type == event_type)

    # Filtro de turma
    if class_id:
        query = query.filter(Event.class_id == class_id)

    # Filtro por papel do usuário
    if current_user.role == "TEACHER":
        # Professores veem eventos gerais + eventos das suas turmas
        teacher_classes = db.query(Class.id).filter(Class.teacher_id == current_user.teacher.id).all()
        class_ids = [c[0] for c in teacher_classes]
        query = query.filter(
            (Event.class_id == None) | (Event.class_id.in_(class_ids))
        )

    events = query.order_by(Event.event_date, Event.start_time).all()

    # Enriquecer com informações do criador e turma
    result = []
    for event in events:
        event_dict = {
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "event_date": event.event_date,
            "start_time": event.start_time,
            "end_time": event.end_time,
            "location": event.location,
            "class_id": event.class_id,
            "event_type": event.event_type,
            "created_by": event.created_by,
            "is_active": event.is_active,
            "created_at": event.created_at,
            "updated_at": event.updated_at,
            "creator_name": event.creator.name if event.creator else None,
            "class_name": event.class_.name if event.class_ else None,
        }
        result.append(event_dict)

    return result


@router.post("/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Criar evento
    - Professores, Secretários, Pedagogos e Diretores podem criar
    """
    event = Event(
        **event_in.model_dump(),
        created_by=current_user.id
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return {
        **event.__dict__,
        "creator_name": current_user.name,
        "class_name": event.class_.name if event.class_ else None,
    }


@router.get("/events/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obter detalhes de um evento"""
    event = db.query(Event).filter(Event.id == event_id, Event.is_active == True).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    # Verificar permissão para professores
    if current_user.role == "TEACHER":
        if event.class_id:
            teacher_class = db.query(Class).filter(
                Class.id == event.class_id,
                Class.teacher_id == current_user.teacher.id
            ).first()
            if not teacher_class:
                raise HTTPException(status_code=403, detail="Sem permissão para acessar este evento")

    return {
        **event.__dict__,
        "creator_name": event.creator.name if event.creator else None,
        "class_name": event.class_.name if event.class_ else None,
    }


@router.patch("/events/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_update: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Atualizar evento
    - Criador do evento pode editar
    - Secretários, Pedagogos e Diretores podem editar qualquer evento
    """
    event = db.query(Event).filter(Event.id == event_id, Event.is_active == True).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    # Verificar permissão
    if current_user.role == "TEACHER":
        if event.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Apenas o criador pode editar este evento")

    # Atualizar campos
    for field, value in event_update.model_dump(exclude_unset=True).items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)

    return {
        **event.__dict__,
        "creator_name": event.creator.name if event.creator else None,
        "class_name": event.class_.name if event.class_ else None,
    }


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Deletar evento (soft delete)
    - Criador do evento pode deletar
    - Secretários, Pedagogos e Diretores podem deletar qualquer evento
    """
    event = db.query(Event).filter(Event.id == event_id, Event.is_active == True).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    # Verificar permissão
    if current_user.role == "TEACHER":
        if event.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Apenas o criador pode deletar este evento")

    event.is_active = False
    db.commit()
    return


# ==================== MATERIAL RESERVATIONS ====================

@router.get("/material-reservations", response_model=List[MaterialReservationResponse])
def list_material_reservations(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Listar reservas de material
    - Todos os usuários podem ver todas as reservas
    """
    query = db.query(MaterialReservation)

    # Filtros de data
    if start_date:
        query = query.filter(MaterialReservation.reservation_date >= start_date)
    if end_date:
        query = query.filter(MaterialReservation.reservation_date <= end_date)

    # Filtro de status
    if status_filter:
        query = query.filter(MaterialReservation.status == status_filter)

    reservations = query.order_by(
        MaterialReservation.reservation_date,
        MaterialReservation.start_time
    ).all()

    # Enriquecer com informações
    result = []
    for reservation in reservations:
        reservation_dict = {
            "id": reservation.id,
            "material_name": reservation.material_name,
            "description": reservation.description,
            "reservation_date": reservation.reservation_date,
            "start_time": reservation.start_time,
            "end_time": reservation.end_time,
            "quantity": reservation.quantity,
            "location": reservation.location,
            "class_id": reservation.class_id,
            "notes": reservation.notes,
            "reserved_by": reservation.reserved_by,
            "status": reservation.status,
            "created_at": reservation.created_at,
            "updated_at": reservation.updated_at,
            "reserver_name": reservation.reserver.name if reservation.reserver else None,
            "class_name": reservation.class_.name if reservation.class_ else None,
        }
        result.append(reservation_dict)

    return result


@router.post(
    "/material-reservations",
    response_model=MaterialReservationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_material_reservation(
    reservation_in: MaterialReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Criar reserva de material - qualquer usuário pode criar"""
    reservation = MaterialReservation(
        **reservation_in.model_dump(),
        reserved_by=current_user.id,
        status="pending"
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)

    return {
        **reservation.__dict__,
        "reserver_name": current_user.name,
        "class_name": reservation.class_.name if reservation.class_ else None,
    }


@router.get("/material-reservations/{reservation_id}", response_model=MaterialReservationResponse)
def get_material_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obter detalhes de uma reserva"""
    reservation = db.query(MaterialReservation).filter(
        MaterialReservation.id == reservation_id
    ).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")

    return {
        **reservation.__dict__,
        "reserver_name": reservation.reserver.name if reservation.reserver else None,
        "class_name": reservation.class_.name if reservation.class_ else None,
    }


@router.patch("/material-reservations/{reservation_id}", response_model=MaterialReservationResponse)
def update_material_reservation(
    reservation_id: int,
    reservation_update: MaterialReservationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Atualizar reserva
    - Quem reservou pode editar
    - Secretários, Pedagogos e Diretores podem editar qualquer reserva
    """
    reservation = db.query(MaterialReservation).filter(
        MaterialReservation.id == reservation_id
    ).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")

    # Verificar permissão
    if current_user.role == "TEACHER":
        if reservation.reserved_by != current_user.id:
            raise HTTPException(status_code=403, detail="Apenas quem reservou pode editar")

    # Atualizar campos
    for field, value in reservation_update.model_dump(exclude_unset=True).items():
        setattr(reservation, field, value)

    db.commit()
    db.refresh(reservation)

    return {
        **reservation.__dict__,
        "reserver_name": reservation.reserver.name if reservation.reserver else None,
        "class_name": reservation.class_.name if reservation.class_ else None,
    }


@router.delete("/material-reservations/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Deletar reserva
    - Quem reservou pode deletar
    - Secretários, Pedagogos e Diretores podem deletar qualquer reserva
    """
    reservation = db.query(MaterialReservation).filter(
        MaterialReservation.id == reservation_id
    ).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")

    # Verificar permissão
    if current_user.role == "TEACHER":
        if reservation.reserved_by != current_user.id:
            raise HTTPException(status_code=403, detail="Apenas quem reservou pode deletar")

    db.delete(reservation)
    db.commit()
    return
