# 📚 Documentação - Implementação de Professor-Evaluation Service

## ✅ O que foi implementado

Implementação completa do módulo de **Gestão de Professores e Períodos de Avaliação** no jomorais-backend, espelhando a arquitetura e padrões do junqueira-backend.

### 📁 Arquivos Criados

1. **Service** - `src/services/professor-evaluation.services.js` (870+ linhas)
2. **Controller** - `src/controller/professor-evaluation.controller.js` (350+ linhas)
3. **Routes** - `src/routes/professor-evaluation.routes.js` (600+ linhas com Swagger)
4. **Server Integration** - Atualizado `src/server.js` com rotas

---

## 🎯 Funcionalidades Implementadas

### 1️⃣ Gestão de Professores (CRUD Completo)

#### Métodos Service
- **`createProfessor(data)`** - Criar novo professor
  - Validações: email único, campos obrigatórios
  - Relacionamentos: validar utilizador se fornecido
  
- **`updateProfessor(id, data)`** - Atualizar professor
  - Validações: existência, duplicata de email
  - Suporta atualização parcial
  
- **`getProfessores(page, limit, search)`** - Listar com paginação
  - Busca em: nome, email, telefone, especialidade
  - Retorno: lista com contagens de relacionamentos
  
- **`getProfessorById(id)`** - Obter professor individual
  - Inclui relacionamentos: disciplinas e turmas (últimos 10)
  
- **`deleteProfessor(id)`** - Soft delete (arquivamento)
  - Validação: não permite deletar se tem atribuições ativas
  - Alterna status para "Inactivo"
  
- **`getProfessoresAtivos()`** - Listar apenas ativos
  - Retorno rápido: nome, email, especialidade

#### Endpoints API
```
POST   /api/professor-evaluation/professores
GET    /api/professor-evaluation/professores
GET    /api/professor-evaluation/professores/ativos
GET    /api/professor-evaluation/professores/:id
PUT    /api/professor-evaluation/professores/:id
DELETE /api/professor-evaluation/professores/:id
```

---

### 2️⃣ Atribuição Professor ↔ Disciplina

#### Métodos Service
- **`assignDisciplinaToProfessor(data)`** - Atribuir disciplina
  - Valida: professor, disciplina, curso existem
  - Verifica: restrição única (professor-disciplina-curso-ano)
  
- **`getProfessorDisciplinas(page, limit, professorId)`** - Listar atribuições
  - Paginado com includes completos (professor, disciplina, curso)
  
- **`updateProfessorDisciplina(id, data)`** - Atualizar status
  
- **`deleteProfessorDisciplina(id)`** - Remover atribuição

#### Endpoints API
```
POST   /api/professor-evaluation/professor-disciplina
GET    /api/professor-evaluation/professor-disciplina
PUT    /api/professor-evaluation/professor-disciplina/:id
DELETE /api/professor-evaluation/professor-disciplina/:id
```

---

### 3️⃣ Atribuição Professor ↔ Turma

#### Métodos Service
- **`assignTurmaToProfessor(data)`** - Atribuir turma
  - Valida: professor, turma, disciplina existem
  - Verifica: restrição única (professor-turma-disciplina-ano)
  
- **`getProfessorTurmas(page, limit, professorId)`** - Listar atribuições
  
- **`updateProfessorTurma(id, data)`** - Atualizar
  
- **`deleteProfessorTurma(id)`** - Remover

#### Endpoints API
```
POST   /api/professor-evaluation/professor-turma
GET    /api/professor-evaluation/professor-turma
PUT    /api/professor-evaluation/professor-turma/:id
DELETE /api/professor-evaluation/professor-turma/:id
```

---

### 4️⃣ Períodos de Avaliação (CRUD)

#### Métodos Service
- **`createPeriodoAvaliacao(data)`** - Criar período
  - Valida: datas (início < fim)
  - Verifica: designação única por ano letivo
  - Campos: designacao, tipoAvaliacao, trimestre, dataInicio, dataFim, anoLectivo
  
- **`getPeriodosAvaliacao(page, limit, anoLectivo)`** - Listar paginado
  - Filtrável por ano letivo
  
- **`getPeriodoAvaliacaoById(id)`** - Obter período
  
- **`updatePeriodoAvaliacao(id, data)`** - Atualizar
  - Re-valida datas se alteradas
  
- **`deletePeriodoAvaliacao(id)`** - Deletar
  - Validação: não pode ter histórico de notas
  
- **`getPeriodosAtivos()`** - Listar apenas ativos

#### Endpoints API
```
POST   /api/professor-evaluation/periodos-avaliacao
GET    /api/professor-evaluation/periodos-avaliacao
GET    /api/professor-evaluation/periodos-avaliacao/ativos
GET    /api/professor-evaluation/periodos-avaliacao/:id
PUT    /api/professor-evaluation/periodos-avaliacao/:id
DELETE /api/professor-evaluation/periodos-avaliacao/:id
```

---

### 5️⃣ Relatórios e Estatísticas

#### Métodos Service
- **`getRelatorioProfessores()`** - Resumo geral
  - Total de professores (ativos/inativos)
  - Total de disciplinas atribuídas
  - Total de turmas atribuídas
  - Períodos de avaliação (ativos/inativos)
  
- **`getEstatisticasProfessores()`** - Estatísticas detalhadas
  - Professores ativos com contagem de atribuições
  - Distribuição por especialidade

#### Endpoints API
```
GET /api/professor-evaluation/relatorios/professores
GET /api/professor-evaluation/estatisticas/professores
```

---

## 🏗️ Arquitetura e Padrões

### Padrão de Serviço (Static Methods)
```javascript
export class ProfessorEvaluationService {
  static async createProfessor(data) {
    // lógica
  }
  
  static async getProfessores(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;
    const where = search ? { OR: [...] } : {};
    
    const [data, total] = await Promise.all([
      prisma.tb_professores.findMany({ where, skip, take: limit, ... }),
      prisma.tb_professores.count({ where })
    ]);
    
    return { data, pagination: {...} };
  }
}
```

### Padrão de Resposta
```javascript
{
  success: true,
  message: "Descrição da ação",
  data: {...},
  pagination: {
    currentPage: 1,
    totalPages: 5,
    totalItems: 42,
    itemsPerPage: 10,
    hasNextPage: true,
    hasPreviousPage: false
  }
}
```

### Padrão de Erro
```javascript
throw new AppError(
  'Mensagem descritiva',
  400,  // status code
  'CODIGO_ERRO' // código interno
);
```

### Paginação
Todas as operações de listagem implementam:
- Query params: `page`, `limit`, `search`
- Padrão skip/take do Prisma
- Cálculo automático: totalPages, hasNextPage, hasPreviousPage

---

## 🔍 Exemplos de Uso

### Criar Professor
```bash
POST /api/professor-evaluation/professores
Content-Type: application/json

{
  "nome": "João da Silva",
  "email": "joao.silva@escola.ao",
  "telefone": "923456789",
  "formacao": "Licenciatura em Física",
  "nivelAcademico": "Licenciado",
  "especialidade": "Física",
  "numeroFuncionario": "FC001",
  "dataAdmissao": "2024-01-15",
  "status": "Activo"
}
```

### Atribuir Disciplina
```bash
POST /api/professor-evaluation/professor-disciplina
Content-Type: application/json

{
  "codigoProfessor": 1,
  "codigoDisciplina": 5,
  "codigoCurso": 3,
  "anoLectivo": "2024/2025"
}
```

### Criar Período de Avaliação
```bash
POST /api/professor-evaluation/periodos-avaliacao
Content-Type: application/json

{
  "designacao": "Avaliação 1º Trimestre",
  "tipoAvaliacao": "Somativa",
  "trimestre": 1,
  "dataInicio": "2024-02-01",
  "dataFim": "2024-04-30",
  "anoLectivo": "2024/2025",
  "status": "Activo",
  "observacoes": "Período de avaliação do primeiro trimestre"
}
```

### Listar Professores com Busca
```bash
GET /api/professor-evaluation/professores?page=1&limit=10&search=Física
```

---

## 🔗 Integração com Banco de Dados

### Modelos Prisma Utilizados
- `tb_professores` - Tabela principal de professores
- `tb_professor_disciplina` - Junção professor-disciplina
- `tb_professor_turma` - Junção professor-turma
- `tb_periodos_avaliacao` - Períodos de avaliação
- `tb_disciplinas` - Referência de disciplinas
- `tb_turmas` - Referência de turmas
- `tb_cursos` - Referência de cursos
- `tb_utilizadores` - Referência de utilizadores
- `tb_historico_notas` - Auditoria (para deletar período)

### Relacionamentos
```
tb_professores
├── tb_professor_disciplina[] (1:N)
├── tb_professor_turma[] (1:N)
└── tb_utilizadores? (N:1)

tb_professor_disciplina
├── tb_professores (N:1)
├── tb_disciplinas (N:1)
└── tb_cursos (N:1)

tb_professor_turma
├── tb_professores (N:1)
├── tb_turmas (N:1)
└── tb_disciplinas (N:1)

tb_periodos_avaliacao
└── tb_historico_notas[] (1:N)
```

---

## 📋 Validações Implementadas

### Professor
- ✅ Nome, email, formação, nível acadêmico: obrigatórios
- ✅ Email: único e validado (toLowerCase + trim)
- ✅ Utilizador: validado se fornecido (existe na BD)
- ✅ Soft delete: apenas se não tem atribuições ativas

### Atribuições (Disciplina/Turma)
- ✅ Professor: deve existir
- ✅ Disciplina: deve existir
- ✅ Turma: deve existir
- ✅ Curso: deve existir (para disciplina)
- ✅ Restrição única: não permite duplicatas
- ✅ Relacionamentos: validados antes de criar

### Período Avaliação
- ✅ Campos obrigatórios: designacao, tipoAvaliacao, trimestre, datas, anoLectivo
- ✅ Datas: início deve ser antes do fim
- ✅ Unicidade: designacao + anoLectivo
- ✅ Delete: não permite se tem histórico

---

## 🚀 Como Usar

### 1. Certificar que tabelas existem no banco
```bash
# Executar SQL migration (ver passo 5 da sessão anterior)
# Ou via DBeaver/CLI
```

### 2. Gerar Prisma Client
```bash
cd c:\Users\User\Videos\project\backend\systemSchool\jomorais-backend
npx prisma generate
```

### 3. Iniciar o servidor
```bash
npm run dev
```

### 4. Testar rotas
```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/professor-evaluation/relatorios/professores
```

### 5. Documentação Swagger
Acesse: `http://localhost:8000/api/docs`

---

## 📊 Comparação com Junqueira

### Implementado identicamente em jomorais
| Feature | Padrão | Status |
|---------|--------|--------|
| Service static methods | `AcademicEvaluationService` | ✅ |
| Paginação | skip/take + count em Promise.all | ✅ |
| Busca | OR com contains (case-insensitive) | ✅ |
| Erro handling | AppError class com status codes | ✅ |
| Soft delete | Status=Inactivo | ✅ |
| Validações | Existência, unicidade, integridade | ✅ |
| Relacionamentos | includes com select | ✅ |
| Swagger docs | @swagger JSDoc | ✅ |

### Adaptações para jomorais
| Item | Junqueira | Jomorais | Motivo |
|------|-----------|---------|--------|
| Nome tabela | `tb_docente` | `tb_professores` | Schema existente |
| Campos | nome, status, email | nome, email, formacao, nivelAcademico | Requirements novos |
| Estrutura | 1 service (docente) | Múltiplos serviços | Modularização |

---

## ⚠️ Próximos Passos

1. **Executar SQL migration** para criar tabelas físicas
2. **Executar `npx prisma generate`** para atualizar client
3. **Testar endpoints** via Postman/Insomnia ou curl
4. **Implementar autenticação** (descomente middleware se necessário)
5. **Criar validações Zod** (schemas de entrada)
6. **Implementar auditoria** com tb_historico_notas

---

## 📝 Notas Técnicas

- **Framework**: Express.js + Prisma ORM
- **Port**: 8000 (padrão)
- **Database**: MySQL (gestao_escolar)
- **Node**: ES6 modules
- **Padrão**: MVC (Service/Controller/Routes)
- **Async/Await**: Totalmente assíncrono
- **Promise.all**: Otimização para queries paralelas

---

## 🔧 Troubleshooting

### Erro: "Relation field ... is missing opposite relation"
→ Verificar schema Prisma e confirmar bidirectional relations

### Erro: "Table doesn't exist"
→ Executar SQL migration e confirmar com `SHOW TABLES` no MySQL

### Erro: "AppError is not defined"
→ Confirmar import: `import { AppError } from '../utils/validation.utils.js'`

### Erro: "Prisma Client not generated"
→ Executar: `npx prisma generate`

---

**Data de Implementação**: 2024/2025
**Versão**: 1.0.0
**Status**: ✅ Pronto para Testes
