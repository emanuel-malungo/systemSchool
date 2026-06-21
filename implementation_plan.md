# Verificação de Pagamentos na Emissão de Documentos

A nova regra de negócio dita que a escola apenas permite a impressão do **Certificado** (ou outros documentos oficiais emitidos pela secretaria) a alunos que já tenham o respetivo pagamento confirmado no sistema (estado pago/ativo).

## Contexto
1. Os pagamentos são gravados na tabela `tb_pagamentos`, associados a um `codigo_Tipo_Servico`.
2. Para gerar um Certificado, o funcionário clica em "Descarregar PDF" no menu de "Gestão de Certificados".
3. A nova barreira será colocada no momento exato deste clique: o sistema verificará se o aluno tem um pagamento válido para esse serviço.

## Open Questions

> [!IMPORTANT]
> **Questão sobre a restrição estrita**
> Se no sistema, por algum motivo de configuração, a escola não tiver criado o "Tipo de Serviço" chamado "Certificado", prefere que o sistema bloqueie TODAS as impressões até configurarem o serviço corretamente, ou que permita imprimir caso não encontre o serviço configurado na base de dados?
> *(Por defeito, assumirei a regra forte: se não encontrar o serviço ou se não encontrar o pagamento, Bloqueia a impressão e avisa o utilizador para verificar as propinas/pagamentos do aluno).*

## Proposed Changes

### 1. Backend: Obter o Status de Pagamento
#### [MODIFY] `src/services/certificates.services.js`
- Na função `getCertificateById` (a que busca os dados para gerar o PDF), será adicionada uma chamada intermédia à tabela `tb_pagamentos`.
- O sistema procurará por um pagamento ativo (`codigo_Estatus: 1`) onde o `codigo_Aluno` seja o do aluno do certificado, e cujo `codigo_Tipo_Servico` pertença a um serviço com o nome `Certificado`.
- A API passará a devolver um novo campo: `temPagamento: true | false`.

### 2. Frontend: Bloquear a Ação e Alertar
#### [MODIFY] `src/pages/Admin/teacher-management/CertificateManagement.tsx`
- Na função `handleDownloadPdf`, verificar se o campo `temPagamento` devolvido é falso.
- Se for `false`, **bloquear imediatamente a geração do PDF** e lançar um alerta vermelho ao ecrã com a mensagem: `"Impressão bloqueada: O aluno não tem o pagamento do Certificado confirmado."`.
- O utilizador será impedido de avançar.

## Verification Plan

### Manual Verification
1. Tentar gerar/descarregar um certificado de um aluno que nunca tenha feito o pagamento na secção "Serviços Financeiros".
2. Confirmar que aparece a mensagem vermelha de erro ("Impressão bloqueada") e que nenhum PDF é emitido.
3. Ir ao menu de "Serviços Financeiros > Pagamentos", registar e confirmar o pagamento do serviço "Certificado" para esse mesmo aluno.
4. Voltar ao menu de Certificados e clicar em descarregar novamente, validando que o PDF agora é gerado normalmente.
