"""update attendance to status

Revision ID: update_attendance_status
Revises: 1b737d1f1953
Create Date: 2026-01-08 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'update_attendance_status'
down_revision = '1b737d1f1953'
branch_labels = None
depends_on = None


def upgrade():
    # Adicionar nova coluna status
    op.add_column('attendances', sa.Column('status', sa.String(20), nullable=True))
    
    # Migrar dados existentes: present=True -> status='present', present=False -> status='absent'
    op.execute("""
        UPDATE attendances 
        SET status = CASE 
            WHEN present = TRUE THEN 'present'
            ELSE 'absent'
        END
    """)
    
    # Tornar status NOT NULL após a migração
    op.alter_column('attendances', 'status', nullable=False, server_default='present')
    
    # Remover coluna present
    op.drop_column('attendances', 'present')


def downgrade():
    # Adicionar coluna present de volta
    op.add_column('attendances', sa.Column('present', sa.Boolean(), nullable=True))
    
    # Migrar dados de volta
    op.execute("""
        UPDATE attendances 
        SET present = CASE 
            WHEN status = 'present' OR status = 'late' THEN TRUE
            ELSE FALSE
        END
    """)
    
    # Remover coluna status
    op.drop_column('attendances', 'status')
