-- CreateTable tb_professores
CREATE TABLE `tb_professores` (
    `Codigo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nome` VARCHAR(200) NOT NULL,
    `Email` VARCHAR(100) NOT NULL,
    `Telefone` VARCHAR(45),
    `Formacao` VARCHAR(200) NOT NULL,
    `NivelAcademico` VARCHAR(100) NOT NULL,
    `Especialidade` VARCHAR(100),
    `NumeroFuncionario` VARCHAR(50),
    `DataAdmissao` DATE,
    `Status` VARCHAR(20) NOT NULL DEFAULT 'Activo',
    `Codigo_Utilizador` INT UNSIGNED,
    `DataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `DataActualizacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    PRIMARY KEY (`Codigo`),
    INDEX `FK_tb_professores_status` (`Status`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable tb_professor_disciplina
CREATE TABLE `tb_professor_disciplina` (
    `Codigo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Professor` INT UNSIGNED NOT NULL,
    `Codigo_Disciplina` INT UNSIGNED NOT NULL,
    `Codigo_Curso` INT UNSIGNED NOT NULL,
    `AnoLectivo` VARCHAR(45) NOT NULL,
    `Status` VARCHAR(20) NOT NULL DEFAULT 'Activo',
    `DataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    PRIMARY KEY (`Codigo`),
    UNIQUE INDEX `UK_professor_disciplina_curso_ano` (`Codigo_Professor`, `Codigo_Disciplina`, `Codigo_Curso`, `AnoLectivo`),
    INDEX `FK_tb_professor_disciplina_professor` (`Codigo_Professor`),
    INDEX `FK_tb_professor_disciplina_disciplina` (`Codigo_Disciplina`),
    INDEX `FK_tb_professor_disciplina_curso` (`Codigo_Curso`),
    CONSTRAINT `FK_tb_professor_disciplina_professor` FOREIGN KEY (`Codigo_Professor`) REFERENCES `tb_professores` (`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `FK_tb_professor_disciplina_disciplina` FOREIGN KEY (`Codigo_Disciplina`) REFERENCES `tb_disciplinas` (`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `FK_tb_professor_disciplina_curso` FOREIGN KEY (`Codigo_Curso`) REFERENCES `tb_cursos` (`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable tb_professor_turma
CREATE TABLE `tb_professor_turma` (
    `Codigo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Professor` INT UNSIGNED NOT NULL,
    `Codigo_Turma` INT UNSIGNED NOT NULL,
    `Codigo_Disciplina` INT UNSIGNED NOT NULL,
    `AnoLectivo` VARCHAR(45) NOT NULL,
    `Status` VARCHAR(20) NOT NULL DEFAULT 'Activo',
    `DataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    PRIMARY KEY (`Codigo`),
    UNIQUE INDEX `UK_professor_turma_disciplina_ano` (`Codigo_Professor`, `Codigo_Turma`, `Codigo_Disciplina`, `AnoLectivo`),
    INDEX `FK_tb_professor_turma_professor` (`Codigo_Professor`),
    INDEX `FK_tb_professor_turma_turma` (`Codigo_Turma`),
    INDEX `FK_tb_professor_turma_disciplina` (`Codigo_Disciplina`),
    CONSTRAINT `FK_tb_professor_turma_professor` FOREIGN KEY (`Codigo_Professor`) REFERENCES `tb_professores` (`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `FK_tb_professor_turma_turma` FOREIGN KEY (`Codigo_Turma`) REFERENCES `tb_turmas` (`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `FK_tb_professor_turma_disciplina` FOREIGN KEY (`Codigo_Disciplina`) REFERENCES `tb_disciplinas` (`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable tb_periodos_avaliacao
CREATE TABLE `tb_periodos_avaliacao` (
    `Codigo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(100) NOT NULL,
    `TipoAvaliacao` VARCHAR(10) NOT NULL,
    `Trimestre` INT UNSIGNED NOT NULL,
    `DataInicio` DATE NOT NULL,
    `DataFim` DATE NOT NULL,
    `AnoLectivo` VARCHAR(45) NOT NULL,
    `Status` VARCHAR(20) NOT NULL DEFAULT 'Activo',
    `Observacoes` LONGTEXT,
    `DataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    PRIMARY KEY (`Codigo`),
    INDEX `FK_tb_periodos_avaliacao_trimestre` (`Trimestre`),
    INDEX `FK_tb_periodos_avaliacao_ano` (`AnoLectivo`),
    INDEX `FK_tb_periodos_avaliacao_tipo` (`TipoAvaliacao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable tb_historico_notas
CREATE TABLE `tb_historico_notas` (
    `Codigo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Nota` INT UNSIGNED NOT NULL,
    `CampoAlterado` VARCHAR(50) NOT NULL,
    `ValorAnterior` DOUBLE,
    `ValorNovo` DOUBLE,
    `MotivoAlteracao` LONGTEXT,
    `AlteradoPor` INT UNSIGNED NOT NULL,
    `DataAlteracao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    PRIMARY KEY (`Codigo`),
    INDEX `FK_tb_historico_notas_nota` (`Codigo_Nota`),
    INDEX `FK_tb_historico_notas_usuario` (`AlteradoPor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
