"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2025-12-08

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Criar tabela users
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.Enum('ADMIN', 'PROFESSOR', name='userrole'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Criar tabela professores
    op.create_table('professores',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('cpf', sa.String(length=11), nullable=False),
        sa.Column('telefone', sa.String(length=20), nullable=True),
        sa.Column('especialidade', sa.String(length=255), nullable=True),
        sa.Column('data_admissao', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cpf'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_professores_id'), 'professores', ['id'], unique=False)

    # Criar tabela alunos
    op.create_table('alunos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nome', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('cpf', sa.String(length=11), nullable=False),
        sa.Column('data_nascimento', sa.Date(), nullable=True),
        sa.Column('telefone', sa.String(length=20), nullable=True),
        sa.Column('endereco', sa.Text(), nullable=True),
        sa.Column('responsavel_nome', sa.String(length=255), nullable=True),
        sa.Column('responsavel_telefone', sa.String(length=20), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cpf')
    )
    op.create_index(op.f('ix_alunos_id'), 'alunos', ['id'], unique=False)
    op.create_index(op.f('ix_alunos_email'), 'alunos', ['email'], unique=True)

    # Criar tabela turmas
    op.create_table('turmas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nome', sa.String(length=255), nullable=False),
        sa.Column('descricao', sa.Text(), nullable=True),
        sa.Column('nivel', sa.String(length=100), nullable=True),
        sa.Column('professor_id', sa.Integer(), nullable=True),
        sa.Column('capacidade_maxima', sa.Integer(), nullable=True),
        sa.Column('data_inicio', sa.Date(), nullable=True),
        sa.Column('data_fim', sa.Date(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['professor_id'], ['professores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_turmas_id'), 'turmas', ['id'], unique=False)

    # Criar tabela horarios
    op.create_table('horarios',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('turma_id', sa.Integer(), nullable=True),
        sa.Column('dia_semana', sa.Integer(), nullable=True),
        sa.Column('hora_inicio', sa.Time(), nullable=True),
        sa.Column('hora_fim', sa.Time(), nullable=True),
        sa.Column('sala', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['turma_id'], ['turmas.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_horarios_id'), 'horarios', ['id'], unique=False)

    # Criar tabela matriculas
    op.create_table('matriculas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('aluno_id', sa.Integer(), nullable=True),
        sa.Column('turma_id', sa.Integer(), nullable=True),
        sa.Column('data_matricula', sa.Date(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['aluno_id'], ['alunos.id'], ),
        sa.ForeignKeyConstraint(['turma_id'], ['turmas.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_matriculas_id'), 'matriculas', ['id'], unique=False)

    # Criar tabela aulas
    op.create_table('aulas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('turma_id', sa.Integer(), nullable=True),
        sa.Column('data', sa.Date(), nullable=False),
        sa.Column('conteudo', sa.Text(), nullable=True),
        sa.Column('observacoes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['turma_id'], ['turmas.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_aulas_id'), 'aulas', ['id'], unique=False)

    # Criar tabela chamadas
    op.create_table('chamadas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('aula_id', sa.Integer(), nullable=True),
        sa.Column('aluno_id', sa.Integer(), nullable=True),
        sa.Column('presente', sa.Boolean(), nullable=True),
        sa.Column('observacao', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['aula_id'], ['aulas.id'], ),
        sa.ForeignKeyConstraint(['aluno_id'], ['alunos.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chamadas_id'), 'chamadas', ['id'], unique=False)

    # Criar tabela avaliacoes
    op.create_table('avaliacoes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('aula_id', sa.Integer(), nullable=True),
        sa.Column('aluno_id', sa.Integer(), nullable=True),
        sa.Column('tipo', sa.String(length=100), nullable=True),
        sa.Column('nota', sa.Float(), nullable=True),
        sa.Column('peso', sa.Float(), nullable=True),
        sa.Column('observacao', sa.Text(), nullable=True),
        sa.Column('data_avaliacao', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['aula_id'], ['aulas.id'], ),
        sa.ForeignKeyConstraint(['aluno_id'], ['alunos.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_avaliacoes_id'), 'avaliacoes', ['id'], unique=False)


def downgrade():
    op.drop_table('avaliacoes')
    op.drop_table('chamadas')
    op.drop_table('aulas')
    op.drop_table('matriculas')
    op.drop_table('horarios')
    op.drop_table('turmas')
    op.drop_table('alunos')
    op.drop_table('professores')
    op.drop_table('users')
