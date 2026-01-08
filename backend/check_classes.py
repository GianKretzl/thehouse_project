from app.core.database import engine
from app.models import User, Teacher, Class
from sqlalchemy.orm import Session

session = Session(engine)

# Encontrar o professor Tiago
teacher = session.query(Teacher).join(User).filter(
    User.email == 'tiago.rodrigues@thehouse.com.br'
).first()

print(f"Teacher encontrado: {teacher is not None}")
if teacher:
    print(f"Teacher ID: {teacher.id}")
    print(f"Teacher Name: {teacher.user.name}")
    
    # Buscar turmas do professor
    classes = session.query(Class).filter(Class.teacher_id == teacher.id).all()
    print(f"\nTurmas do professor: {len(classes)}")
    for c in classes:
        print(f"  - {c.name} (ID: {c.id}, teacher_id: {c.teacher_id}, ativa: {c.is_active})")
else:
    print("Professor não encontrado no banco de dados!")

# Todas as turmas
all_classes = session.query(Class).all()
print(f"\nTotal de turmas no banco: {len(all_classes)}")
for c in all_classes:
    print(f"  - {c.name} (teacher_id: {c.teacher_id})")

session.close()
