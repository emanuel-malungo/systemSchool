-- ==================== PROFESSORES ====================
CREATE TABLE IF NOT EXISTS `tb_professores` (
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
  `DataCadastro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `DataActualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Codigo`),
  INDEX `FK_tb_professores_status` (`Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== PROFESSOR DISCIPLINA ====================
CREATE TABLE IF NOT EXISTS `tb_professor_disciplina` (
  `Codigo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Codigo_Professor` INT UNSIGNED NOT NULL,
  `Codigo_Disciplina` INT UNSIGNED NOT NULL,
  `Codigo_Curso` INT UNSIGNED NOT NULL,
  `AnoLectivo` VARCHAR(45) NOT NULL,
  `Status` VARCHAR(20) NOT NULL DEFAULT 'Activo',
  `DataCadastro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Codigo`),
  UNIQUE KEY `UK_professor_disciplina_curso_ano` (`Codigo_Professor`, `Codigo_Disciplina`, `Codigo_Curso`, `AnoLectivo`),
  INDEX `FK_tb_professor_disciplina_professor` (`Codigo_Professor`),
  INDEX `FK_tb_professor_disciplina_disciplina` (`Codigo_Disciplina`),
  INDEX `FK_tb_professor_disciplina_curso` (`Codigo_Curso`),
  CONSTRAINT `FK_tb_professor_disciplina_professor` FOREIGN KEY (`Codigo_Professor`) REFERENCES `tb_professores` (`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tb_professor_disciplina_disciplina` FOREIGN KEY (`Codigo_Disciplina`) REFERENCES `tb_disciplinas` (`codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tb_professor_disciplina_curso` FOREIGN KEY (`Codigo_Curso`) REFERENCES `tb_cursos` (`codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== PROFESSOR TURMA ====================
CREATE TABLE IF NOT EXISTS `tb_professor_turma` (
  `Codigo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Codigo_Professor` INT UNSIGNED NOT NULL,
  `Codigo_Turma` INT UNSIGNED NOT NULL,
  `Codigo_Disciplina` INT UNSIGNED NOT NULL,
  `AnoLectivo` VARCHAR(45) NOT NULL,
  `Status` VARCHAR(20) NOT NULL DEFAULT 'Activo',
  `DataCadastro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Codigo`),
  UNIQUE KEY `UK_professor_turma_disciplina_ano` (`Codigo_Professor`, `Codigo_Turma`, `Codigo_Disciplina`, `AnoLectivo`),
  INDEX `FK_tb_professor_turma_professor` (`Codigo_Professor`),
  INDEX `FK_tb_professor_turma_turma` (`Codigo_Turma`),
  INDEX `FK_tb_professor_turma_disciplina` (`Codigo_Disciplina`),
  CONSTRAINT `FK_tb_professor_turma_professor` FOREIGN KEY (`Codigo_Professor`) REFERENCES `tb_professores` (`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tb_professor_turma_turma` FOREIGN KEY (`Codigo_Turma`) REFERENCES `tb_turmas` (`codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tb_professor_turma_disciplina` FOREIGN KEY (`Codigo_Disciplina`) REFERENCES `tb_disciplinas` (`codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== PERIODOS AVALIACAO ====================
CREATE TABLE IF NOT EXISTS `tb_periodos_avaliacao` (
  `Codigo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Designacao` VARCHAR(100) NOT NULL,
  `TipoAvaliacao` VARCHAR(10) NOT NULL,
  `Trimestre` INT UNSIGNED NOT NULL,
  `DataInicio` DATE NOT NULL,
  `DataFim` DATE NOT NULL,
  `Status` VARCHAR(20) NOT NULL DEFAULT 'Activo',
  `DataCadastro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== HISTORICO NOTAS ====================
CREATE TABLE IF NOT EXISTS `tb_historico_notas` (
  `Codigo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Codigo_Nota` INT UNSIGNED NOT NULL,
  `CampoAlterado` VARCHAR(100) NOT NULL,
  `ValorAnterior` VARCHAR(255),
  `ValorNovo` VARCHAR(255),
  `MotivoAlteracao` VARCHAR(500),
  `AlteradoPor` INT UNSIGNED NOT NULL,
  `DataAlteracao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Codigo`),
  INDEX `FK_tb_historico_notas_nota` (`Codigo_Nota`),
  INDEX `FK_tb_historico_notas_usuario` (`AlteradoPor`),
  CONSTRAINT `FK_tb_historico_notas_nota` FOREIGN KEY (`Codigo_Nota`) REFERENCES `tb_notas_alunos` (`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tb_historico_notas_usuario` FOREIGN KEY (`AlteradoPor`) REFERENCES `tb_utilizadores` (`Codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== CERTIFICADOS ====================
CREATE TABLE IF NOT EXISTS `tb_certificados` (
  `Codigo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Codigo_Aluno` INT UNSIGNED NOT NULL,
  `Codigo_Disciplina` INT UNSIGNED NOT NULL,
  `Codigo_AnoLectivo` INT UNSIGNED NOT NULL,
  `NumeroCertificado` VARCHAR(50),
  `DataEmissao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `DataAssinatura` TIMESTAMP NULL DEFAULT NULL,
  `AssinadoPor` INT UNSIGNED,
  `Status` VARCHAR(20) NOT NULL DEFAULT 'Pendente',
  `Observacoes` TEXT,
  `DataCadastro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Codigo`),
  UNIQUE KEY `UK_tb_certificados` (`Codigo_Aluno`, `Codigo_Disciplina`, `Codigo_AnoLectivo`),
  INDEX `FK_tb_certificados_aluno_idx` (`Codigo_Aluno`),
  INDEX `FK_tb_certificados_disciplina_idx` (`Codigo_Disciplina`),
  INDEX `FK_tb_certificados_ano_lectivo_idx` (`Codigo_AnoLectivo`),
  INDEX `FK_tb_certificados_assinador_idx` (`AssinadoPor`),
  CONSTRAINT `FK_tb_certificados_aluno` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos` (`codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tb_certificados_disciplina` FOREIGN KEY (`Codigo_Disciplina`) REFERENCES `tb_disciplinas` (`codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tb_certificados_ano_lectivo` FOREIGN KEY (`Codigo_AnoLectivo`) REFERENCES `tb_ano_lectivo` (`codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tb_certificados_assinador` FOREIGN KEY (`AssinadoPor`) REFERENCES `tb_utilizadores` (`codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== DECLARAÇÕES ====================
CREATE TABLE IF NOT EXISTS `tb_declaracoes` (
  `Codigo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Codigo_Aluno` INT UNSIGNED NOT NULL,
  `TipoDeclaracao` VARCHAR(50) NOT NULL,
  `NumeroDeclaracao` VARCHAR(50) NOT NULL UNIQUE,
  `DataEmissao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `DataValidade` TIMESTAMP NULL DEFAULT NULL,
  `Finalidade` VARCHAR(100),
  `Conteudo` TEXT NOT NULL,
  `EmitidoPor` INT UNSIGNED NOT NULL,
  `Status` VARCHAR(20) NOT NULL DEFAULT 'Ativa',
  `Observacoes` TEXT,
  `DataCadastro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Codigo`),
  INDEX `FK_tb_declaracoes_aluno_idx` (`Codigo_Aluno`),
  INDEX `FK_tb_declaracoes_emissor_idx` (`EmitidoPor`),
  CONSTRAINT `FK_tb_declaracoes_aluno` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos` (`codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tb_declaracoes_emissor` FOREIGN KEY (`EmitidoPor`) REFERENCES `tb_utilizadores` (`codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== HISTÓRICO ESCOLAR ====================
CREATE TABLE IF NOT EXISTS `tb_historico_escolar` (
  `Codigo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Codigo_Aluno` INT UNSIGNED NOT NULL,
  `Codigo_AnoLectivo` INT UNSIGNED NOT NULL,
  `MediaGeral` FLOAT NOT NULL,
  `TotalDisciplinas` INT NOT NULL,
  `TotalAprovadas` INT NOT NULL,
  `TotalReprovadas` INT NOT NULL,
  `TaxaAprovacao` FLOAT NOT NULL,
  `Situacao` VARCHAR(50) NOT NULL,
  `Observacoes` TEXT,
  `DataGeracao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Codigo`),
  UNIQUE KEY `UK_tb_historico_escolar` (`Codigo_Aluno`, `Codigo_AnoLectivo`),
  INDEX `FK_tb_historico_escolar_aluno_idx` (`Codigo_Aluno`),
  INDEX `FK_tb_historico_escolar_ano_idx` (`Codigo_AnoLectivo`),
  CONSTRAINT `FK_tb_historico_escolar_aluno` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos` (`codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_tb_historico_escolar_ano` FOREIGN KEY (`Codigo_AnoLectivo`) REFERENCES `tb_ano_lectivo` (`codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
