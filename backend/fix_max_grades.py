"""
Script para corrigir max_grades dos assessments existentes
"""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import Assessment

def fix_max_grades():
    db = SessionLocal()
    try:
        # Buscar todos os assessments sem max_grade ou com max_grade = 10.0 padrão
        assessments = db.query(Assessment).all()
        
        print(f"Total de avaliações encontradas: {len(assessments)}")
        
        # Agrupar por lesson_id e type para ver quais têm o mesmo max_grade
        groups = {}
        for assessment in assessments:
            key = f"{assessment.lesson_id}_{assessment.type}"
            if key not in groups:
                groups[key] = []
            groups[key].append(assessment)
        
        # Para cada grupo, mostrar informações
        for key, group in groups.items():
            print(f"\nGrupo: {key}")
            print(f"  Quantidade de alunos: {len(group)}")
            print(f"  Max grades atuais: {set([a.max_grade for a in group])}")
            
            # Se todos têm 10.0, perguntar qual deveria ser
            if all(a.max_grade == 10.0 for a in group):
                print(f"  ⚠️  Todos com max_grade padrão (10.0)")
                # Como não sabemos o valor correto, vamos deixar 10.0
                # Mas mostrar para o usuário
        
        print("\n" + "="*50)
        print("OBSERVAÇÃO:")
        print("As avaliações antigas foram criadas sem especificar max_grade.")
        print("O sistema aplicou o padrão de 10.0.")
        print("\nSe você criou avaliações com nota máxima diferente de 10.0,")
        print("será necessário editá-las manualmente no sistema para corrigir.")
        print("="*50)
        
    finally:
        db.close()

if __name__ == "__main__":
    fix_max_grades()
