"""
Script para adicionar horários às turmas Adults
"""
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import Class, Schedule

def add_adults_schedules():
    """Adicionar horários para as turmas Adults"""
    db: Session = SessionLocal()
    
    try:
        # Buscar turmas Adults (A1-A5)
        adults_classes = db.query(Class).filter(
            Class.name.in_(['A1', 'A2', 'A3', 'A4', 'A5'])
        ).all()
        
        if not adults_classes:
            print("❌ Nenhuma turma Adults encontrada!")
            return
        
        print(f"\n📚 Encontradas {len(adults_classes)} turmas Adults")
        
        # Configurar horários para cada turma
        # Segunda a Sexta: 0=Segunda, 1=Terça, 2=Quarta, 3=Quinta, 4=Sexta
        schedules_config = {
            'A1': [
                {'weekday': 0, 'start_time': '19:00', 'end_time': '20:30'},  # Segunda 19:00-20:30
                {'weekday': 3, 'start_time': '19:00', 'end_time': '20:30'},  # Quinta 19:00-20:30
            ],
            'A2': [
                {'weekday': 1, 'start_time': '19:00', 'end_time': '20:30'},  # Terça 19:00-20:30
                {'weekday': 4, 'start_time': '19:00', 'end_time': '20:30'},  # Sexta 19:00-20:30
            ],
            'A3': [
                {'weekday': 0, 'start_time': '20:30', 'end_time': '22:00'},  # Segunda 20:30-22:00
                {'weekday': 3, 'start_time': '20:30', 'end_time': '22:00'},  # Quinta 20:30-22:00
            ],
            'A4': [
                {'weekday': 1, 'start_time': '20:30', 'end_time': '22:00'},  # Terça 20:30-22:00
                {'weekday': 4, 'start_time': '20:30', 'end_time': '22:00'},  # Sexta 20:30-22:00
            ],
            'A5': [
                {'weekday': 2, 'start_time': '19:00', 'end_time': '20:30'},  # Quarta 19:00-20:30
                {'weekday': 2, 'start_time': '20:30', 'end_time': '22:00'},  # Quarta 20:30-22:00
            ],
        }
        
        weekday_names = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
        
        print("\n⏰ Adicionando horários...")
        
        for cls in adults_classes:
            # Remover horários existentes se houver
            db.query(Schedule).filter(Schedule.class_id == cls.id).delete()
            
            # Adicionar novos horários
            if cls.name in schedules_config:
                config = schedules_config[cls.name]
                print(f"\n📌 {cls.name} - {cls.level}:")
                
                for schedule_data in config:
                    schedule = Schedule(
                        class_id=cls.id,
                        weekday=schedule_data['weekday'],
                        start_time=schedule_data['start_time'],
                        end_time=schedule_data['end_time']
                    )
                    db.add(schedule)
                    
                    day_name = weekday_names[schedule_data['weekday']]
                    print(f"   ✓ {day_name}: {schedule_data['start_time']} - {schedule_data['end_time']}")
        
        db.commit()
        
        print("\n" + "="*60)
        print("✅ Horários adicionados com sucesso!")
        print("="*60)
        
        # Mostrar resumo
        print("\n📊 RESUMO DOS HORÁRIOS:")
        print("-" * 60)
        
        for cls in adults_classes:
            schedules = db.query(Schedule).filter(Schedule.class_id == cls.id).order_by(Schedule.weekday).all()
            print(f"\n🏫 {cls.name} - {cls.level}")
            for schedule in schedules:
                day_name = weekday_names[schedule.weekday]
                print(f"   • {day_name}: {schedule.start_time} - {schedule.end_time}")
        
        print("\n" + "="*60)
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("="*60)
    print("  CONFIGURAÇÃO DE HORÁRIOS - TURMAS ADULTS")
    print("="*60)
    add_adults_schedules()
