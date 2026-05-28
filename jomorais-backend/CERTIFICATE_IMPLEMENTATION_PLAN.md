# Plano de Implementação - Template Certificado

## Estrutura do Certificado (baseado no arquivo ALEXANDRINA MADALENA BIOCO.docx)

### Seções do Certificado:
1. **Cabeçalho Oficial**
   - REPÚBLICA DE ANGOLA
   - MINISTÉRIO DA EDUCAÇÃO  
   - Nome do Instituto
   - Número do certificado (ex: 001-EG-25/26)

2. **Título**
   - "Certificado de Habilitações"

3. **Corpo Principal**
   - Identificação da directora
   - Declaração padrão com referência legal (art. 25 e 27, Decreto nº 90/04)
   - Dados do aluno:
     * Nome completo
     * Filiação (pais)
     * Natural de / Naturalidade
     * Data de nascimento
     * Número de BI/ID
     * Autoridade emissora do BI

4. **Informações Académicas**
   - Regime (ex: diurno)
   - Ano lectivo
   - Curso
   - Área de Formação
   - Turma
   - Número/Matricula

5. **Tabela de Classificações**
   - Componente Sociocultural:
     * Língua Portuguesa
     * Língua Inglesa
   - Componente Científica
   - Componente Prática
   - (Conforme o curso)

6. **Assinatura e Selo**
   - Assinado por: [Directora]
   - Data
   - Carimbo da instituição

## Implementação Recomendada:

### Backend
1. Criar endpoint `/api/certificates/:id/print` que:
   - Busca dados do certificado
   - Busca dados do aluno (nome, filiação, BI, data nasc.)
   - Busca notas do aluno em todas as disciplinas
   - Retorna PDF gerado com template

### Biblioteca Recomendada
- **puppeteer** ou **pdfkit** para gerar PDF
- **node-docx** para gerar DOCX (Word)

### Frontend
1. Botão "Download Certificado" na página de certificados
2. Clica e faz fetch de `/api/certificates/:id/print?format=pdf`
3. Baixa automaticamente

## Status Atual
✅ Certificados listando (API funciona)
✅ Alunos sendo retornados por turma
⏳ Template do certificado ainda precisa ser implementado
⏳ Geração de PDF/DOCX ainda precisa ser implementada

## Próximos Passos
1. Instalar dependência: `npm install puppeteer`
2. Criar serviço de geração de PDF
3. Adicionar endpoint de download
4. Testar geração do documento
