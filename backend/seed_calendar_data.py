"""
Script para popular o calendário com eventos e reservas de exemplo
"""
import sys
import os
from datetime import date, time, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import User, Event, MaterialReservation, Class

def seed_calendar_data():
    """Adicionar eventos e reservas de exemplo"""
    db: Session = SessionLocal()
    
    try:
        # Buscar usuários
        director = db.query(User).filter(User.role == "DIRECTOR").first()
        secretary = db.query(User).filter(User.role == "SECRETARY").first()
        teacher = db.query(User).filter(User.role == "TEACHER").first()
        
        if not director or not secretary or not teacher:
            print("❌ Usuários necessários não encontrados!")
            return
        
        # Buscar turmas
        classes = db.query(Class).limit(3).all()
        
        today = date.today()
        
        print("\n📅 Criando eventos...")
        
        # Eventos gerais
        events_data = [
            {
                "title": "Reunião Pedagógica",
                "description": "Reunião mensal para discussão de estratégias pedagógicas",
                "event_date": today + timedelta(days=2),
                "start_time": time(14, 0),
                "end_time": time(16, 0),
                "location": "Sala de Reuniões",
                "event_type": "meeting",
                "created_by": director.id
            },
            {
                "title": "Dia de Formação Continuada",
                "description": "Workshop sobre metodologias ativas de ensino",
                "event_date": today + timedelta(days=7),
                "start_time": time(9, 0),
                "end_time": time(17, 0),
                "location": "Auditório",
                "event_type": "meeting",
                "created_by": director.id
            },
            {
                "title": "Feriado - Dia da Consciência Negra",
                "description": "Não haverá aula",
                "event_date": date(2026, 11, 20),
                "event_type": "holiday",
                "created_by": secretary.id
            },
            {
                "title": "Período de Avaliações",
                "description": "Semana de provas bimestrais",
                "event_date": today + timedelta(days=14),
                "event_type": "exam",
                "created_by": secretary.id
            },
        ]
        
        # Eventos específicos de turma
        if classes:
            events_data.extend([
                {
                    "title": f"Prova de Grammar - {classes[0].name}",
                    "description": "Avaliação de gramática avançada",
                    "event_date": today + timedelta(days=10),
                    "start_time": time(19, 0),
                    "end_time": time(20, 30),
                    "location": "Sala 101",
                    "class_id": classes[0].id,
                    "event_type": "exam",
                    "created_by": teacher.id
                },
                {
                    "title": f"Apresentação Oral - {classes[1].name}",
                    "description": "Apresentação individual sobre temas da atualidade",
                    "event_date": today + timedelta(days=12),
                    "start_time": time(19, 0),
                    "end_time": time(21, 0),
                    "location": "Sala 102",
                    "class_id": classes[1].id,
                    "event_type": "exam",
                    "created_by": teacher.id
                },
            ])
        
        for event_data in events_data:
            event = Event(**event_data)
            db.add(event)
            print(f"   ✓ {event_data['title']} - {event_data['event_date']}")
        
        print("\n📦 Criando reservas de material...")
        
        # Reservas de material
        reservations_data = [
            {
                "material_name": "Projetor Multimídia",
                "description": "Projetor para apresentação de slides",
                "reservation_date": today + timedelta(days=1),
                "start_time": time(19, 0),
                "end_time": time(20, 30),
                "quantity": 1,
                "location": "Sala 101",
                "class_id": classes[0].id if classes else None,
                "reserved_by": teacher.id,
                "status": "confirmed"
            },
            {
                "material_name": "Caixa de Som Portátil",
                "description": "Para atividade de listening",
                "reservation_date": today + timedelta(days=3),
                "start_time": time(19, 0),
                "end_time": time(20, 30),
                "quantity": 1,
                "location": "Sala 103",
                "class_id": classes[1].id if len(classes) > 1 else None,
                "reserved_by": teacher.id,
                "status": "pending"
            },
            {
                "material_name": "Kit de Flashcards",
                "description": "Conjunto de flashcards para vocabulário",
                "reservation_date": today + timedelta(days=5),
                "start_time": time(14, 0),
                "end_time": time(16, 0),
                "quantity": 2,
                "location": "Sala 102",
                "reserved_by": teacher.id,
                "status": "confirmed",
                "notes": "Trazer também os cartões temáticos de verbos irregulares"
            },
            {
                "material_name": "Lousa Digital",
                "description": "Para apresentação interativa",
                "reservation_date": today + timedelta(days=7),
                "start_time": time(9, 0),
                "end_time": time(12, 0),
                "quantity": 1,
                "location": "Auditório",
                "reserved_by": director.id,
                "status": "confirmed"
            },
        ]
        
        for res_data in reservations_data:
            reservation = MaterialReservation(**res_data)
            db.add(reservation)
            print(f"   ✓ {res_data['material_name']} - {res_data['reservation_date']}")
        
        db.commit()
        
        print("\n" + "="*60)
        print("✅ Calendário populado com sucesso!")
        print("="*60)
        
        # Mostrar resumo
        total_events = db.query(Event).filter(Event.is_active == True).count()
        total_reservations = db.query(MaterialReservation).count()
        
        print(f"\n📊 RESUMO:")
        print(f"   • {total_events} eventos cadastrados")
        print(f"   • {total_reservations} reservas de material")
        print("\n" + "="*60)
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("="*60)
    print("  POPULANDO CALENDÁRIO COM DADOS DE EXEMPLO")
    print("="*60)
    seed_calendar_data()
