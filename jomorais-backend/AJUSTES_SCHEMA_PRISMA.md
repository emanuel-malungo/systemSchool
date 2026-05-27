# Ajustes ao Schema Prisma - jomorais-backend

**Data:** 27 de Maio de 2026  
**Objetivo:** Completar o schema do Prisma com as tabelas de gestão de professores e períodos de avaliação que faltavam

---

## 📋 Resumo das Alterações

### ✅ Tabelas Adicionadas

#### 1. **tb_professores**
- Armazena informações dos professores
- Campos: Codigo, Nome, Email, Telefone, Formacao, NivelAcademico, Especialidade, NumeroFuncionario, DataAdmissao, Status, Codigo_Utilizador, DataCadastro, DataActualizacao
- Relacionamentos: tb_professor_disciplina[], tb_professor_turma[], tb_notas_alunos[]

#### 2. **tb_professor_disciplina**
- Relaciona professores com disciplinas por curso e ano letivo
- Campos: Codigo, Codigo_Professor, Codigo_Disciplina, Codigo_Curso, AnoLectivo, Status, DataCadastro
- Relacionamentos: tb_professores, tb_disciplinas, tb_cursos
- Constraint único: (Codigo_Professor, Codigo_Disciplina, Codigo_Curso, AnoLectivo)

#### 3. **tb_professor_turma**
- Relaciona professores com turmas e disciplinas por ano letivo
- Campos: Codigo, Codigo_Professor, Codigo_Turma, Codigo_Disciplina, AnoLectivo, Status, DataCadastro
- Relacionamentos: tb_professores, tb_turmas, tb_disciplinas
- Constraint único: (Codigo_Professor, Codigo_Turma, Codigo_Disciplina, AnoLectivo)

#### 4. **tb_periodos_avaliacao**
- Gerencia períodos de avaliação (períodos de notas)
- Campos: Codigo, Designacao, TipoAvaliacao, Trimestre, DataInicio, DataFim, AnoLectivo, Status, Observacoes, DataCadastro
- Relacionamentos: tb_notas_alunos[]
- Índices: Trimestre, AnoLectivo, TipoAvaliacao

#### 5. **tb_historico_notas**
- Auditoria completa de alterações em notas
- Campos: Codigo, Codigo_Nota, CampoAlterado, ValorAnterior, ValorNovo, MotivoAlteracao, AlteradoPor, DataAlteracao
- Índices: Codigo_Nota, AlteradoPor
- Propósito: Rastrear todas as alterações realizadas em notas (quem, quando, qual valor, por quê)

---

## 🔗 Relacionamentos Atualizados

### tb_notas_alunos (Expandido)
**Campos adicionados:**
- `CodigoProfessor` - Link ao professor que lançou a nota
- `CodigoTurma` - Link à turma do aluno
- `CodigoPeriodo` - Link ao período de avaliação
- `Trimestre` - Número do trimestre
- `NotaMAC` - Nota de Módulo/Avaliação Contínua
- `NotaPP` - Nota de Participação/Prática
- `NotaPT` - Nota de Prova/Teste
- `MediaTrimestre` - Média calculada
- `Classificacao` - Classificação (Aprovado/Reprovado)
- `Observacoes` - Observações sobre o aluno
- `DataLancamento` - Data de lançamento original
- `DataActualizacao` - Última atualização
- `LancadoPor` - Utilizador que realizou a última alteração
- `Status` - Status da nota (Activo/Inactivo)

**Relacionamentos adicionados:**
- `tb_professores` - Link ao professor responsável
- `tb_turmas` - Link à turma
- `tb_periodos_avaliacao` - Link ao período de avaliação

### tb_turmas (Relacionamentos adicionados)
- `tb_notas_alunos[]` - Notas dos alunos da turma
- `tb_professor_turma[]` - Professores da turma

### tb_disciplinas (Relacionamentos adicionados)
- `tb_professor_disciplina[]` - Professores da disciplina
- `tb_professor_turma[]` - Professores em turmas (por disciplina)

### tb_cursos (Relacionamentos adicionados)
- `tb_professor_disciplina[]` - Professores por curso

### tb_ano_lectivo (Relacionamentos adicionados)
- `tb_periodos_avaliacao[]` - Períodos de avaliação do ano

---

## 🎯 Impacto das Alterações

### Funcionalidades Habilitadas

1. **Gestão de Professores**
   - Registro completo de professores com formação e especialidade
   - Rastreamento de data de admissão e status
   - Link entre professor e utilização (login) do sistema

2. **Atribuição de Responsabilidades**
   - Professor pode ter múltiplas disciplinas por curso
   - Professor pode lecionar em múltiplas turmas
   - Constrains únicos garantem evitar duplicatas

3. **Lançamento de Notas**
   - Sistema sabe qual professor lançou as notas
   - Notas são rastreadas por período de avaliação
   - Estrutura completa: contínua (MAC), prática (PP), prova (PT)
   - Cálculo de média trimestre possível

4. **Auditoria Completa**
   - Histórico de todas as alterações em notas
   - Motivo da alteração registado
   - Rastreamento de quem alterou e quando

5. **Períodos de Avaliação**
   - Definição clara de quando as avaliações ocorrem
   - Classificação de tipo de avaliação
   - Observações sobre particularidades

---

## 📊 Comparação com Junqueira

| Funcionalidade | SystemSchool (Antes) | SystemSchool (Depois) | Junqueira |
|---|---|---|---|
| tb_professores | ❌ | ✅ | ✅ |
| tb_professor_disciplina | ❌ | ✅ | ✅ |
| tb_professor_turma | ❌ | ✅ | ✅ |
| tb_periodos_avaliacao | ❌ | ✅ | ✅ |
| tb_historico_notas | ❌ | ✅ | ✅ |
| tb_notas_alunos (completo) | ⚠️ Parcial | ✅ Completo | ✅ |
| Auditoria de notas | ❌ | ✅ | ✅ |

---

## 🚀 Próximos Passos

### 1. **Migração do Banco de Dados**
```bash
npx prisma migrate dev --name add_professor_and_evaluation_tables
```

### 2. **Geração do Cliente Prisma**
```bash
npx prisma generate
```

### 3. **Validação do Schema**
```bash
npx prisma validate
```

### 4. **Atualizar Controllers**
Adicionar endpoints para:
- CRUD de professores
- CRUD de tb_professor_disciplina
- CRUD de tb_professor_turma
- CRUD de tb_periodos_avaliacao
- Lançamento de notas (POST/PUT/DELETE em tb_notas_alunos)

### 5. **Frontend Components**
- Componente de seleção de professores
- Formulário de associação professor-disciplina
- Formulário de lançamento de notas
- Relatório de auditoria

---

## ⚠️ Observações Importantes

1. **Integridade Referencial**
   - Todos os relacionamentos têm `onDelete: NoAction` para evitar exclusão accidental de dados
   - Considere usar soft deletes (Status = "Inactivo") em vez de deletar

2. **Índices**
   - Foram criados índices para melhorar performance em queries frequentes
   - Índices estão em campos de relacionamento e busca

3. **Campos Opcionais**
   - `CodigoProfessor` em tb_notas_alunos é opcional (para retrocompatibilidade)
   - `CodigoTurma` em tb_notas_alunos é opcional (algumas notas podem não ter turma)
   - `CodigoPeriodo` em tb_notas_alunos é opcional (retrocompatibilidade)

4. **Status e Datas**
   - Todos os models têm `Status` (padrão "Activo")
   - Todos os models têm timestamps `DataCadastro` e `DataActualizacao`

---

## 📝 Exemplo de Uso

```javascript
// Criar um professor
const professor = await prisma.tb_professores.create({
  data: {
    Nome: "João Silva",
    Email: "joao@escola.com",
    Formacao: "Licenciatura em Matemática",
    NivelAcademico: "Licenciado",
    Especialidade: "Matemática Avançada",
    Status: "Activo"
  }
});

// Atribuir disciplina a professor
await prisma.tb_professor_disciplina.create({
  data: {
    Codigo_Professor: professor.Codigo,
    Codigo_Disciplina: 1, // Matemática
    Codigo_Curso: 5, // 10-12 Geral
    AnoLectivo: "2024-2025",
    Status: "Activo"
  }
});

// Lançar nota
await prisma.tb_notas_alunos.create({
  data: {
    CodigoAluno: 100,
    CodigoProfessor: professor.Codigo,
    CodigoDisciplina: 1,
    CodigoTurma: 1,
    CodigoAnoLectivo: 1,
    CodigoTipoAvaliacao: 1,
    CodigoTrimestre: 1,
    CodigoPeriodo: 1,
    CodigoUtilizador: 5,
    NotaMAC: 15,
    NotaPP: 14,
    NotaPT: 16,
    MediaTrimestre: 15,
    Classificacao: "Aprovado",
    Status: "Activo"
  }
});

// Rastrear alteração
await prisma.tb_historico_notas.create({
  data: {
    Codigo_Nota: 1,
    CampoAlterado: "NotaMAC",
    ValorAnterior: 14,
    ValorNovo: 15,
    MotivoAlteracao: "Correção de lançamento",
    AlteradoPor: 5
  }
});
```

---

## ✅ Checklist de Validação

- [x] Todas as 5 tabelas foram criadas
- [x] Relacionamentos foram configurados
- [x] Índices foram criados para performance
- [x] Constraints únicos para evitar duplicatas
- [x] Status padrão definido como "Activo"
- [x] Timestamps `DataCadastro` e `DataActualizacao`
- [x] Mapeamento de nomes de campos (@map)
- [x] Tipos de dados apropriados (@db.UnsignedInt, @db.Text, etc.)
- [x] Relacionamentos bidirecionais configurados
- [x] Documentação completa

---

**Schema pronto para migração e geração!** 🎉
