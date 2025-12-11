"""ad
d_director_pedagogue_secretary_roles

Revision ID: 1b737d1f1953
Revises: 902ed7e6bca5
Create Date: 2025-12-11 08:33:27.227008

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1b737d1f1953'
down_revision: Union[str, None] = '902ed7e6bca5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Adicionar novos valores ao enum userrole
    # PostgreSQL requer comandos separados para cada valor
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'DIRECTOR'")
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'PEDAGOGUE'")
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'SECRETARY'")
    
    # Opcional: Atualizar usuários existentes com role ADMIN para DIRECTOR
    op.execute("UPDATE users SET role = 'DIRECTOR' WHERE role = 'ADMIN'")


def downgrade() -> None:
    # Nota: PostgreSQL não permite remover valores de enum facilmente
    # Por simplicidade, não fazemos nada no downgrade
    pass
