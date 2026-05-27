# ✅ Novas Tabelas de Gestão de Avaliação - Instruções de Setup

As tabelas foram adicionadas ao `schema.prisma` e estão prontas para serem criadas no database.

## 📋 Tabelas a Criar:
1. **tb_professores** - Registry de professores (nome, email, formação, etc)
2. **tb_professor_disciplina** - Atribuição de professor a disciplina por curso
3. **tb_professor_turma** - Atribuição de professor a turma
4. **tb_periodos_avaliacao** - Períodos de avaliação
5. **tb_historico_notas** - Histórico de alterações de notas

## 🔧 Como Criar as Tabelas:

### Opção 1: Usar DBeaver ou HeidiSQL (Recomendado)
1. Abra seu cliente MySQL favorito (DBeaver, HeidiSQL, MySQL Workbench)
2. Conecte ao database `gestao_escolar`
3. Abra o arquivo: `prisma/migrations/add_professor_and_evaluation_tables.sql`
4. Execute o SQL

### Opção 2: Usar CLI do MySQL
```bash
mysql -u root gestao_escolar < prisma/migrations/add_professor_and_evaluation_tables.sql
```

### Opção 3: Usar mysql via PowerShell (Windows)
```powershell
$sqlFile = "C:\Users\User\Videos\project\backend\systemSchool\jomorais-backend\prisma\migrations\add_professor_and_evaluation_tables.sql"
$sqlContent = Get-Content $sqlFile -Raw
$connection = [MySql.Data.MySqlClient.MySqlConnection]::new("Server=localhost;Database=gestao_escolar;Uid=root;Pwd=;")
$connection.Open()
$cmd = $connection.CreateCommand()
$cmd.CommandText = $sqlContent
$cmd.ExecuteNonQuery()
$connection.Close()
```

## ✨ Depois de Criar as Tabelas:

1. Valide o Prisma:
```bash
npx prisma generate
```

2. Você verá uma mensagem como:
```
✔ Generated Prisma Client (v6.16.2)
```

## 📊 Estrutura das Tabelas:

### tb_professores
- Codigo (PK, auto-increment)
- Nome (VARCHAR 200)
- Email (VARCHAR 100)
- Telefone (VARCHAR 45)
- Formacao (VARCHAR 200)
- NivelAcademico (VARCHAR 100)
- Especialidade (VARCHAR 100)
- NumeroFuncionario (VARCHAR 50)
- DataAdmissao (DATE)
- Status (VARCHAR 20, default: 'Activo')
- Codigo_Utilizador (INT, optional)
- DataCadastro (DATETIME)
- DataActualizacao (DATETIME)

### tb_professor_disciplina
- Codigo (PK, auto-increment)
- Codigo_Professor (FK -> tb_professores)
- Codigo_Disciplina (FK -> tb_disciplinas)
- Codigo_Curso (FK -> tb_cursos)
- AnoLectivo (VARCHAR 45)
- Status (VARCHAR 20, default: 'Activo')
- **UNIQUE constraint**: (Codigo_Professor, Codigo_Disciplina, Codigo_Curso, AnoLectivo)

### tb_professor_turma
- Codigo (PK, auto-increment)
- Codigo_Professor (FK -> tb_professores)
- Codigo_Turma (FK -> tb_turmas)
- Codigo_Disciplina (FK -> tb_disciplinas)
- AnoLectivo (VARCHAR 45)
- Status (VARCHAR 20, default: 'Activo')
- **UNIQUE constraint**: (Codigo_Professor, Codigo_Turma, Codigo_Disciplina, AnoLectivo)

### tb_periodos_avaliacao
- Codigo (PK, auto-increment)
- Designacao (VARCHAR 100)
- TipoAvaliacao (VARCHAR 10)
- Trimestre (INT UNSIGNED)
- DataInicio (DATE)
- DataFim (DATE)
- AnoLectivo (VARCHAR 45)
- Status (VARCHAR 20, default: 'Activo')
- Observacoes (LONGTEXT, optional)
- DataCadastro (DATETIME)

### tb_historico_notas
- Codigo (PK, auto-increment)
- Codigo_Nota (INT UNSIGNED)
- CampoAlterado (VARCHAR 50)
- ValorAnterior (DOUBLE, optional)
- ValorNovo (DOUBLE, optional)
- MotivoAlteracao (LONGTEXT, optional)
- AlteradoPor (INT UNSIGNED)
- DataAlteracao (DATETIME)

## 🚀 Próximos Passos:

Após criar as tabelas:

1. **Implementar Controllers**:
   - `src/controllers/professor.controller.js`
   - `src/controllers/avaliacao.controller.js`

2. **Implementar Services**:
   - `src/services/professor.service.js`
   - `src/services/avaliacao.service.js`

3. **Criar Rotas**:
   - POST /api/professores
   - PUT /api/professores/:id
   - GET /api/professores/:id
   - DELETE /api/professores/:id
   - etc...

4. **Frontend**:
   - Criar componentes de gestão de professores
   - Criar formulários de lançamento de notas
   - Criar views de períodos de avaliação

---

**Status**: ✅ Schema pronto | ⏳ Aguardando criação de tabelas | ⏳ Endpoints a implementar
