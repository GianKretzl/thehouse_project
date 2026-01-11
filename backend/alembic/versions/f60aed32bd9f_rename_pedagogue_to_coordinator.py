"""rename_pedagogue_to_coordinator

Revision ID: f60aed32bd9f
Revises: b091aaae360b
Create Date: 2026-01-11 17:04:32.268973

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f60aed32bd9f'
down_revision: Union[str, None] = 'b091aaae360b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Adicionar o novo valor COORDINATOR ao enum usando conexão com autocommit
    # para que o valor seja commitado antes de ser usado
    connection = op.get_bind()
    connection.execute(sa.text("COMMIT"))
    connection.execute(sa.text("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'COORDINATOR'"))
    connection.execute(sa.text("COMMIT"))
    
    # Agora renomear o valor do enum PEDAGOGUE para COORDINATOR em todos os registros
    op.execute("UPDATE users SET role = 'COORDINATOR' WHERE role = 'PEDAGOGUE'")
    
    # Nota: Não é possível remover um valor de enum no PostgreSQL facilmente
    # O valor PEDAGOGUE continuará existindo no tipo, mas não será mais usado


def downgrade() -> None:
    # Reverter: renomear COORDINATOR de volta para PEDAGOGUE
    op.execute("UPDATE users SET role = 'PEDAGOGUE' WHERE role = 'COORDINATOR'")
