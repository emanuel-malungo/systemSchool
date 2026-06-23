-- DropIndex
DROP INDEX `FK_docente_turma_1` ON `tb_docente_tuma`;

-- DropIndex
DROP INDEX `FK_docente_turma_2` ON `tb_docente_tuma`;

-- AlterTable
ALTER TABLE `tb_certificados` DROP COLUMN `Aluno`,
    DROP COLUMN `Ano`,
    DROP COLUMN `AnoDois`,
    DROP COLUMN `AnoTres`,
    DROP COLUMN `Classe`,
    DROP COLUMN `CodigoAluno`,
    DROP COLUMN `Curso`,
    DROP COLUMN `Turma`,
    DROP COLUMN `anoUm`,
    ADD COLUMN `AssinadoPor` INTEGER UNSIGNED NULL,
    ADD COLUMN `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    ADD COLUMN `Codigo_AnoLectivo` INTEGER UNSIGNED NOT NULL,
    ADD COLUMN `DataAssinatura` DATETIME(3) NULL,
    ADD COLUMN `DataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `DataEmissao` DATETIME(3) NOT NULL,
    ADD COLUMN `NumeroCertificado` VARCHAR(50) NOT NULL,
    ADD COLUMN `Observacoes` TEXT NULL,
    ADD COLUMN `Status` VARCHAR(20) NOT NULL DEFAULT 'Pendente';

-- AlterTable
ALTER TABLE `tb_docente_tuma` MODIFY `Codigo_Docente` INTEGER UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `tb_notas_alunos` ADD COLUMN `CodigoTurma` INTEGER UNSIGNED NULL;

-- CreateTable
CREATE TABLE `tb_professores` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nome` VARCHAR(200) NOT NULL,
    `Email` VARCHAR(100) NOT NULL,
    `Telefone` VARCHAR(45) NULL,
    `Formacao` VARCHAR(200) NOT NULL,
    `NivelAcademico` VARCHAR(100) NOT NULL,
    `Especialidade` VARCHAR(100) NULL,
    `NumeroFuncionario` VARCHAR(50) NULL,
    `DataAdmissao` DATE NULL,
    `Status` VARCHAR(20) NOT NULL DEFAULT 'Activo',
    `Codigo_Utilizador` INTEGER UNSIGNED NULL,
    `DataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `DataActualizacao` DATETIME(3) NOT NULL,

    INDEX `FK_tb_professores_status`(`Status`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_professor_disciplina` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Professor` INTEGER UNSIGNED NOT NULL,
    `Codigo_Disciplina` INTEGER UNSIGNED NOT NULL,
    `Codigo_Curso` INTEGER UNSIGNED NOT NULL,
    `AnoLectivo` VARCHAR(45) NOT NULL,
    `Status` VARCHAR(20) NOT NULL DEFAULT 'Activo',
    `DataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FK_tb_professor_disciplina_professor`(`Codigo_Professor`),
    INDEX `FK_tb_professor_disciplina_disciplina`(`Codigo_Disciplina`),
    INDEX `FK_tb_professor_disciplina_curso`(`Codigo_Curso`),
    UNIQUE INDEX `tb_professor_disciplina_Codigo_Professor_Codigo_Disciplina_C_key`(`Codigo_Professor`, `Codigo_Disciplina`, `Codigo_Curso`, `AnoLectivo`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_professor_turma` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Professor` INTEGER UNSIGNED NOT NULL,
    `Codigo_Turma` INTEGER UNSIGNED NOT NULL,
    `Codigo_Disciplina` INTEGER UNSIGNED NOT NULL,
    `AnoLectivo` VARCHAR(45) NOT NULL,
    `Status` VARCHAR(20) NOT NULL DEFAULT 'Activo',
    `DataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FK_tb_professor_turma_professor`(`Codigo_Professor`),
    INDEX `FK_tb_professor_turma_turma`(`Codigo_Turma`),
    INDEX `FK_tb_professor_turma_disciplina`(`Codigo_Disciplina`),
    UNIQUE INDEX `tb_professor_turma_Codigo_Professor_Codigo_Turma_Codigo_Disc_key`(`Codigo_Professor`, `Codigo_Turma`, `Codigo_Disciplina`, `AnoLectivo`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_periodos_avaliacao` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(100) NOT NULL,
    `TipoAvaliacao` VARCHAR(10) NOT NULL,
    `Trimestre` INTEGER UNSIGNED NOT NULL,
    `DataInicio` DATE NOT NULL,
    `DataFim` DATE NOT NULL,
    `AnoLectivo` VARCHAR(45) NOT NULL,
    `Status` VARCHAR(20) NOT NULL DEFAULT 'Activo',
    `Observacoes` TEXT NULL,
    `DataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FK_tb_periodos_avaliacao_trimestre`(`Trimestre`),
    INDEX `FK_tb_periodos_avaliacao_ano`(`AnoLectivo`),
    INDEX `FK_tb_periodos_avaliacao_tipo`(`TipoAvaliacao`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_historico_notas` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Nota` INTEGER UNSIGNED NOT NULL,
    `CampoAlterado` VARCHAR(50) NOT NULL,
    `ValorAnterior` DOUBLE NULL,
    `ValorNovo` DOUBLE NULL,
    `MotivoAlteracao` TEXT NULL,
    `AlteradoPor` INTEGER UNSIGNED NOT NULL,
    `DataAlteracao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FK_tb_historico_notas_nota`(`Codigo_Nota`),
    INDEX `FK_tb_historico_notas_usuario`(`AlteradoPor`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_declaracoes` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `TipoDeclaracao` VARCHAR(50) NOT NULL,
    `NumeroDeclaracao` VARCHAR(50) NOT NULL,
    `DataEmissao` DATETIME(3) NOT NULL,
    `DataValidade` DATETIME(3) NULL,
    `Finalidade` VARCHAR(100) NULL,
    `Conteudo` TEXT NOT NULL,
    `EmitidoPor` INTEGER UNSIGNED NOT NULL,
    `Status` VARCHAR(20) NOT NULL DEFAULT 'Ativa',
    `Observacoes` TEXT NULL,
    `DataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tb_declaracoes_NumeroDeclaracao_key`(`NumeroDeclaracao`),
    INDEX `FK_tb_declaracoes_aluno_idx`(`Codigo_Aluno`),
    INDEX `FK_tb_declaracoes_emissor_idx`(`EmitidoPor`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_historico_escolar` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `Codigo_AnoLectivo` INTEGER UNSIGNED NOT NULL,
    `MediaGeral` DOUBLE NOT NULL,
    `TotalDisciplinas` INTEGER NOT NULL,
    `TotalAprovadas` INTEGER NOT NULL,
    `TotalReprovadas` INTEGER NOT NULL,
    `TaxaAprovacao` DOUBLE NOT NULL,
    `Situacao` VARCHAR(50) NOT NULL,
    `Observacoes` TEXT NULL,
    `DataGeracao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FK_tb_historico_escolar_aluno_idx`(`Codigo_Aluno`),
    INDEX `FK_tb_historico_escolar_ano_idx`(`Codigo_AnoLectivo`),
    UNIQUE INDEX `UK_tb_historico_escolar`(`Codigo_Aluno`, `Codigo_AnoLectivo`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `FK_tb_certificados_aluno_idx` ON `tb_certificados`(`Codigo_Aluno`);

-- CreateIndex
CREATE INDEX `FK_tb_certificados_ano_lectivo_idx` ON `tb_certificados`(`Codigo_AnoLectivo`);

-- CreateIndex
CREATE INDEX `FK_tb_certificados_assinador_idx` ON `tb_certificados`(`AssinadoPor`);

-- CreateIndex
CREATE UNIQUE INDEX `UK_tb_certificados` ON `tb_certificados`(`Codigo_Aluno`, `Codigo_AnoLectivo`);

-- CreateIndex
CREATE INDEX `FK_tb_notas_alunos_turma` ON `tb_notas_alunos`(`CodigoTurma`);

-- AddForeignKey
ALTER TABLE `tb_notas_alunos` ADD CONSTRAINT `FK_tb_notas_alunos_turma` FOREIGN KEY (`CodigoTurma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_professor_disciplina` ADD CONSTRAINT `FK_tb_professor_disciplina_professor` FOREIGN KEY (`Codigo_Professor`) REFERENCES `tb_professores`(`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tb_professor_disciplina` ADD CONSTRAINT `FK_tb_professor_disciplina_disciplina` FOREIGN KEY (`Codigo_Disciplina`) REFERENCES `tb_disciplinas`(`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tb_professor_disciplina` ADD CONSTRAINT `FK_tb_professor_disciplina_curso` FOREIGN KEY (`Codigo_Curso`) REFERENCES `tb_cursos`(`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tb_professor_turma` ADD CONSTRAINT `FK_tb_professor_turma_professor` FOREIGN KEY (`Codigo_Professor`) REFERENCES `tb_professores`(`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tb_professor_turma` ADD CONSTRAINT `FK_tb_professor_turma_turma` FOREIGN KEY (`Codigo_Turma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tb_professor_turma` ADD CONSTRAINT `FK_tb_professor_turma_disciplina` FOREIGN KEY (`Codigo_Disciplina`) REFERENCES `tb_disciplinas`(`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tb_historico_notas` ADD CONSTRAINT `FK_tb_historico_notas_periodo` FOREIGN KEY (`Codigo_Nota`) REFERENCES `tb_periodos_avaliacao`(`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tb_certificados` ADD CONSTRAINT `FK_tb_certificados_aluno` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tb_certificados` ADD CONSTRAINT `FK_tb_certificados_ano_lectivo` FOREIGN KEY (`Codigo_AnoLectivo`) REFERENCES `tb_ano_lectivo`(`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tb_certificados` ADD CONSTRAINT `FK_tb_certificados_assinador` FOREIGN KEY (`AssinadoPor`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tb_declaracoes` ADD CONSTRAINT `FK_tb_declaracoes_aluno` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tb_declaracoes` ADD CONSTRAINT `FK_tb_declaracoes_emissor` FOREIGN KEY (`EmitidoPor`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tb_historico_escolar` ADD CONSTRAINT `FK_tb_historico_escolar_aluno` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tb_historico_escolar` ADD CONSTRAINT `FK_tb_historico_escolar_ano` FOREIGN KEY (`Codigo_AnoLectivo`) REFERENCES `tb_ano_lectivo`(`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

