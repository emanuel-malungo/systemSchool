# 📜 Documentação - Implementação de Certificados (FASE 2)

## ✅ O que foi implementado

Implementação completa do módulo de **Gestão de Certificados** no jomorais-backend, permitindo a emissão, assinatura digital e consulta de certificados de conclusão/aprovação de disciplinas.

### 📁 Arquivos Criados

1. **Service** - `src/services/certificates.services.js` (450+ linhas)
2. **Controller** - `src/controller/certificates.controller.js` (180+ linhas)
3. **Routes** - `src/routes/certificates.routes.js` (250+ linhas com Swagger)
4. **Database** - Modelos adicionados ao `prisma/schema.prisma`
5. **Server Integration** - Atualizado `src/server.js` com rotas

---

## 🎯 Funcionalidades Implementadas

### 1️⃣ **Criação de Certificados**

#### Método Service
- **`createCertificate(data)`** - Emitir certificado para aluno aprovado
  - Validações: codigoAluno, codigoDisciplina, codigoAnoLectivo obrigatórios
  - Validação de entidades: aluno, disciplina, ano letivo existem
  - **Validação crítica**: Aluno deve ter nota ≥ 10 na disciplina
  - Validação de duplicata: não permite dois certificados para mesma combinação
  - Auto-gera: NumeroCertificado (CERT-2024-000001)
  - Status inicial: "Pendente"

#### Endpoint
```
POST /api/certificates
{
  "codigoAluno": 1,
  "codigoDisciplina": 5,
  "codigoAnoLectivo": 1,
  "observacoes": "Aluno com excelente desempenho"
}
```

---

### 2️⃣ **Listagem de Certificados**

#### Método Service
- **`getCertificates(page, limit, filters)`** - Listar certificados com paginação
  - Filtros opcionais: codigoAluno, codigoDisciplina, status, codigoAnoLectivo
  - Paginação: skip/take pattern
  - Resposta: com relacionamentos de aluno, disciplina, ano letivo
  - Ordenação: por data de emissão (mais recentes primeiro)

#### Endpoint
```
GET /api/certificates?page=1&limit=10&codigoAluno=1&status=Pendente
```

---

### 3️⃣ **Consulta Individual**

#### Método Service
- **`getCertificateById(id)`** - Obter detalhes completos de um certificado
  - Inclui: aluno, disciplina, ano letivo, assinador (se houver)
  - Status: Pendente, Assinado, Cancelado

#### Endpoint
```
GET /api/certificates/:id
```

---

### 4️⃣ **Actualização de Certificado**

#### Método Service
- **`updateCertificate(id, data)`** - Atualizar observações
  - Validação: não permite alterar certificados já assinados
  - Campo atualizável: observacoes

#### Endpoint
```
PUT /api/certificates/:id
{
  "observacoes": "Novas observações"
}
```

---

### 5️⃣ **Assinatura Digital**

#### Método Service
- **`signCertificate(id, codigoUtilizador)`** - Assinar certificado digitalmente
  - Valida: certificado e utilizador existem
  - Validação: não permite dupla assinatura
  - Registra: data/hora de assinatura e quem assinou
  - Muda status: Pendente → Assinado
  - Auditoria: rastreia assinador

#### Endpoint
```
POST /api/certificates/:id/sign
{
  "codigoUtilizador": 10
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Certificado assinado com sucesso",
  "data": {
    "Codigo": 1,
    "NumeroCertificado": "CERT-2024-000001",
    "Status": "Assinado",
    "DataAssinatura": "2024-05-27T10:30:00Z",
    "AssinadoPor": {
      "Codigo": 10,
      "Nome": "Dr. João Silva"
    }
  }
}
```

---

### 6️⃣ **Cancelamento de Certificado**

#### Método Service
- **`deleteCertificate(id)`** - Cancelar certificado
  - Muda status para "Cancelado" (soft delete)
  - Preserva histórico (não remove registos)

#### Endpoint
```
DELETE /api/certificates/:id
```

---

### 7️⃣ **Certificados por Aluno**

#### Método Service
- **`getCertificatesByStudent(codigoAluno, codigoAnoLectivo)`** - Todos os certificados de um aluno
  - Filtro opcional: por ano letivo
  - Retorna: perfil do aluno + array de certificados
  - Ordenação: por data de emissão (mais recentes)

#### Endpoint
```
GET /api/certificates/aluno/:codigoAluno?codigoAnoLectivo=1
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "aluno": {
      "codigo": 1,
      "nome": "João Silva",
      "email": "joao@email.com"
    },
    "totalCertificados": 3,
    "certificados": [
      {
        "Codigo": 1,
        "NumeroCertificado": "CERT-2024-000001",
        "tb_disciplinas": {
          "designacao": "Matemática"
        },
        "Status": "Assinado",
        "DataEmissao": "2024-05-20T00:00:00Z"
      }
    ]
  }
}
```

---

### 8️⃣ **Estatísticas de Certificados**

#### Método Service
- **`getCertificateStatistics(codigoAnoLectivo)`** - Análise de certificados emitidos
  - Calcula: total, assinados, pendentes, cancelados
  - Taxa: percentagem de assinatura
  - Distribuição: por disciplina

#### Endpoint
```
GET /api/certificates/stats/por-ano?codigoAnoLectivo=1
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "anoLectivo": "2024/2025",
    "totalCertificados": 150,
    "assinados": 120,
    "pendentes": 25,
    "cancelados": 5,
    "taxaAssinatura": "80.00%",
    "porDisciplina": [
      { "disciplina": "Matemática", "total": 45 },
      { "disciplina": "Português", "total": 38 },
      { "disciplina": "Ciências", "total": 32 }
    ]
  }
}
```

---

## 🏗️ Arquitetura

### Service Layer
- Static methods (sem instantiation)
- Try-catch com AppError
- Validações: existência, unicidade, regra de negócio (nota ≥ 10)
- Auto-geração: numeração sequencial de certificados
- Auditoria: rastreia assinadores

### Database Models (Prisma)

#### tb_certificados
```
Codigo (PK)              - Auto-increment
Codigo_Aluno (FK)        - Referência ao aluno
Codigo_Disciplina (FK)   - Referência à disciplina
Codigo_AnoLectivo (FK)   - Ano letivo
NumeroCertificado        - Único, sequencial (CERT-2024-000001)
DataEmissao              - Data da emissão
DataAssinatura           - Data da assinatura (opcional)
AssinadoPor (FK)         - Utilizador que assinou (opcional)
Status                   - Pendente, Assinado, Cancelado
Observacoes              - Texto livre
DataCadastro             - Timestamp
Relacionamentos:
  - tb_alunos
  - tb_disciplinas
  - tb_ano_lectivo
  - tb_utilizadores (assinador)
```

#### Restrições
- `UK_tb_certificados`: Única combinação (Codigo_Aluno, Codigo_Disciplina, Codigo_AnoLectivo)
- Índices: em todas as FKs para performance

---

## 📊 Fluxo de Emissão de Certificado

```
1. Diretor/Admin acessa POST /api/certificates
2. Verifica se aluno está aprovado (nota >= 10)
3. Se SIM:
   - Gera NumeroCertificado automático
   - Cria registo com Status='Pendente'
   - Retorna 201 Created
4. Se NÃO:
   - Retorna 400 "Aluno não aprovado"
5. Diretor assina:
   - POST /api/certificates/:id/sign
   - Status muda para 'Assinado'
   - Registra assinador e data
```

---

## 🔗 Endpoints Totais (8)

```
CRIAÇÃO E GESTÃO (5)
  POST   /certificates               (criar)
  GET    /certificates               (listar com paginação)
  GET    /certificates/:id           (detalhe)
  PUT    /certificates/:id           (atualizar observações)
  DELETE /certificates/:id           (cancelar)

ASSINATURA (1)
  POST   /certificates/:id/sign      (assinar digitalmente)

CONSULTAS (2)
  GET    /certificates/aluno/:codigoAluno    (por aluno)
  GET    /certificates/stats/por-ano         (estatísticas)
```

---

## 💾 Estrutura de Dados

### Tabela: tb_certificados
| Campo | Tipo | Descrição |
|---|---|---|
| Codigo | INT | PK, auto-increment |
| Codigo_Aluno | INT | FK → tb_alunos |
| Codigo_Disciplina | INT | FK → tb_disciplinas |
| Codigo_AnoLectivo | INT | FK → tb_ano_lectivo |
| NumeroCertificado | VARCHAR(50) | UNIQUE, sequencial |
| DataEmissao | DATETIME | Data da emissão |
| DataAssinatura | DATETIME | Data da assinatura (NULL antes de assinar) |
| AssinadoPor | INT | FK → tb_utilizadores (NULL antes de assinar) |
| Status | VARCHAR(20) | Pendente\|Assinado\|Cancelado |
| Observacoes | TEXT | Anotações livres |
| DataCadastro | DATETIME | Timestamp de criação |

---

## 🚀 Exemplo de Uso Completo

### Passo 1: Emitir Certificado
```bash
curl -X POST http://localhost:8000/api/certificates \
  -H "Content-Type: application/json" \
  -d '{
    "codigoAluno": 1,
    "codigoDisciplina": 5,
    "codigoAnoLectivo": 1,
    "observacoes": "Aluno com excelente desempenho"
  }'
```

**Resposta:** `201 Created` com NumeroCertificado gerado

### Passo 2: Verificar Certificados do Aluno
```bash
curl "http://localhost:8000/api/certificates/aluno/1?codigoAnoLectivo=1"
```

### Passo 3: Assinar Certificado
```bash
curl -X POST http://localhost:8000/api/certificates/1/sign \
  -H "Content-Type: application/json" \
  -d '{
    "codigoUtilizador": 10
  }'
```

**Resultado:** Status muda para "Assinado", Data assinatura registada

### Passo 4: Ver Estatísticas
```bash
curl "http://localhost:8000/api/certificates/stats/por-ano?codigoAnoLectivo=1"
```

---

## ✨ Características Especiais

✅ **Auto-numeração**: CERT-AAAA-NNNNNN sequencial por ano  
✅ **Validação de Aprovação**: Rejeita se nota < 10  
✅ **Assinatura Digital**: Rastreia assinador e data  
✅ **Soft Delete**: Status "Cancelado" preserva histórico  
✅ **Paginação**: Em todas operações de listagem  
✅ **Estatísticas**: Taxa de assinatura e distribuição por disciplina  
✅ **Swagger Docs**: 8 endpoints documentados completamente  

---

## 📈 Validações Implementadas

| Validação | Descrição |
|---|---|
| ✅ Campo Obrigatório | codigoAluno, codigoDisciplina, codigoAnoLectivo |
| ✅ Existência de Entidades | Aluno, disciplina, ano letivo existem |
| ✅ Aprovação Mínima | Nota ≥ 10 (obrigatório) |
| ✅ Restrição Única | Um certificado por aluno/disciplina/ano |
| ✅ Dupla Assinatura | Não permite assinar certificado já assinado |
| ✅ Alterar Assinado | Não permite alterar certificado assinado |

---

## 🔧 Troubleshooting

| Erro | Causa | Solução |
|---|---|---|
| "Aluno não foi aprovado (nota < 10)" | Nota < 10 | Lançar nota superior a 10 antes |
| "Certificado já existe" | Duplicado | Um por aluno/disciplina/ano |
| "Certificado já foi assinado" | Dupla assinatura | Não pode assinar 2x |
| "Não é possível alterar certificado já assinado" | Tentou editar assinado | Cancele e recrie se necessário |

---

**Data de Implementação**: 27/05/2026  
**Versão**: 1.0.0  
**Status**: ✅ Pronto para Integração  
**Total de Código**: ~880 linhas  

---

## 📝 Próximos Passos (Fase 3 e 4)

- **Fase 3**: Implementar Declarações (similar a certificados)
- **Fase 4**: Implementar Histórico Escolar (transcript completo)
