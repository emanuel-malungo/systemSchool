-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL DEFAULT 'root',
    `email` VARCHAR(191) NOT NULL,
    `email_verified_at` TIMESTAMP(0) NULL,
    `password` VARCHAR(191) NOT NULL,
    `tipo` INTEGER NOT NULL DEFAULT 1,
    `remember_token` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,
    `foto` VARCHAR(191) NOT NULL DEFAULT 'img_avatar1.png',

    UNIQUE INDEX `users_username_unique`(`username`),
    UNIQUE INDEX `users_email_unique`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_tipos_utilizador` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_utilizadores` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nome` VARCHAR(45) NOT NULL,
    `User` VARCHAR(45) NOT NULL,
    `Passe` VARCHAR(45) NOT NULL,
    `Codigo_Tipo_Utilizador` INTEGER UNSIGNED NOT NULL,
    `EstadoActual` VARCHAR(10) NOT NULL,
    `DataCadastro` DATE NOT NULL,
    `LoginStatus` VARCHAR(3) NOT NULL DEFAULT 'OFF',

    INDEX `FK_tb_utilizadores_1`(`Codigo_Tipo_Utilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_permissao` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_item_permissao_utilizador` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Permissao` INTEGER UNSIGNED NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,
    `Data_Permissao` DATE NOT NULL,
    `status` VARCHAR(45) NOT NULL DEFAULT 'desactivo',
    `Data_Inicio` DATE NOT NULL DEFAULT ('1970-01-01'),
    `Data_fin` DATE NOT NULL DEFAULT ('1970-01-01'),

    INDEX `FK_tb_item_permissao_utilizador_1`(`Codigo_Permissao`),
    INDEX `FK_tb_item_permissao_utilizador_2`(`Codigo_Utilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_permissao_turma_utilizador` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `CodigoTurma` INTEGER UNSIGNED NOT NULL,
    `CodigoUtilizador` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_permissao_turma_utilizador_tuma`(`CodigoTurma`),
    INDEX `FK_permissao_turma_utilizador_Utilizador`(`CodigoUtilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_nacionalidades` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_estado_civil` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_provincias` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_municipios` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Provincia` INTEGER UNSIGNED NOT NULL,
    `Designacao` VARCHAR(45) NOT NULL,

    INDEX `FK_Provincias`(`Codigo_Provincia`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_comunas` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Municipio` INTEGER UNSIGNED NOT NULL,
    `Designacao` VARCHAR(45) NOT NULL,

    INDEX `FK_tb_comunas_Municipio`(`Codigo_Municipio`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_profissao` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_tipo_docuemnto` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_regime_iva` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_dados_instituicao` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `N_Escola` VARCHAR(45) NOT NULL DEFAULT '0',
    `Nome` VARCHAR(450) NOT NULL DEFAULT 'nenhum',
    `Director` VARCHAR(145) NOT NULL DEFAULT 'nenhum',
    `SubDirector` VARCHAR(45) NOT NULL DEFAULT 'nenhum',
    `Telefone_Fixo` VARCHAR(45) NOT NULL DEFAULT '0',
    `Telefone_Movel` VARCHAR(45) NOT NULL DEFAULT '0',
    `Email` VARCHAR(145) NOT NULL DEFAULT 'nenhum',
    `Site` VARCHAR(145) NOT NULL DEFAULT 'nenhum',
    `Localidade` VARCHAR(145) NOT NULL DEFAULT '0',
    `Contribuinte` VARCHAR(45) NOT NULL DEFAULT '0',
    `NIF` VARCHAR(45) NOT NULL DEFAULT 'nenhum',
    `ContaBancaria1` VARCHAR(45) NOT NULL DEFAULT '0',
    `ContaBancaria2` VARCHAR(45) NOT NULL DEFAULT '0',
    `ContaBancaria3` VARCHAR(45) NOT NULL DEFAULT '0',
    `ContaBancaria4` VARCHAR(45) NOT NULL DEFAULT '0',
    `ContaBancaria5` VARCHAR(45) NOT NULL DEFAULT '0',
    `ContaBancaria6` VARCHAR(45) NOT NULL DEFAULT '0',
    `Regime_IVA` VARCHAR(450) NULL DEFAULT '0',
    `Logotipo` VARCHAR(200) NOT NULL DEFAULT '0',
    `Provincia` VARCHAR(45) NOT NULL DEFAULT '0',
    `Municipio` VARCHAR(45) NOT NULL DEFAULT '0',
    `Nescola` VARCHAR(45) NOT NULL DEFAULT '0',
    `taxaIva` INTEGER UNSIGNED NULL DEFAULT 1,

    INDEX `FK_tb_dados_instituicao_tb_regime_iva`(`taxaIva`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_parametros` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(545) NULL,
    `Valor` FLOAT NULL,
    `Descricao` VARCHAR(105) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `statusescola` (
    `codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_numeracao_documentos` (
    `codigo` INTEGER NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(50) NULL,
    `next` INTEGER NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_itens_guia` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_ano_lectivo` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,
    `mesInicial` VARCHAR(45) NOT NULL,
    `mesFinal` VARCHAR(45) NOT NULL,
    `anoInicial` VARCHAR(45) NOT NULL,
    `anoFinal` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_cursos` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,
    `codigo_Status` INTEGER UNSIGNED NOT NULL DEFAULT 1,

    INDEX `FK_tb_cursos_1`(`codigo_Status`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_classes` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,
    `Status` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `NotaMaxima` FLOAT NOT NULL DEFAULT 0,
    `Exame` BOOLEAN NOT NULL DEFAULT false,

    INDEX `FK_tb_classes_1`(`Status`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_disciplinas` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,
    `Codigo_Curso` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `Status` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `CadeiraEspecifica` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    INDEX `FK_tb_disciplinas_1`(`Codigo_Curso`),
    INDEX `FK_tb_disciplinas_2`(`Status`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_grade_curricular` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_disciplina` INTEGER UNSIGNED NOT NULL,
    `Codigo_Classe` INTEGER UNSIGNED NOT NULL,
    `Codigo_Curso` INTEGER UNSIGNED NOT NULL,
    `Codigo_user` INTEGER UNSIGNED NOT NULL,
    `Codigo_empresa` INTEGER UNSIGNED NOT NULL,
    `Status` INTEGER UNSIGNED NOT NULL,
    `CodigoTipoNota` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_grade_curricular_1`(`Codigo_disciplina`),
    INDEX `FK_tb_grade_curricular_2`(`Codigo_Classe`),
    INDEX `FK_tb_grade_curricular_3`(`Codigo_Curso`),
    INDEX `FK_tb_grade_curricular_4`(`Codigo_user`),
    INDEX `FK_tb_grade_curricular_5`(`Codigo_empresa`),
    INDEX `FK_tb_grade_curricular_6`(`Status`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_salas` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_periodos` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_turmas` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,
    `Codigo_Classe` INTEGER UNSIGNED NOT NULL,
    `Codigo_Curso` INTEGER UNSIGNED NOT NULL,
    `Codigo_Sala` INTEGER UNSIGNED NOT NULL,
    `Codigo_Periodo` INTEGER UNSIGNED NOT NULL,
    `Status` VARCHAR(45) NOT NULL DEFAULT 'Activo',
    `Codigo_AnoLectivo` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `Max_Alunos` INTEGER NULL DEFAULT 30,

    INDEX `FK_tb_turmas_Classe`(`Codigo_Classe`),
    INDEX `FK_tb_turmas_Curso`(`Codigo_Curso`),
    INDEX `FK_tb_turmas_Sala`(`Codigo_Sala`),
    INDEX `FK_tb_turmas_Periodos`(`Codigo_Periodo`),
    INDEX `FK_tb_turmas_AnoLectivo`(`Codigo_AnoLectivo`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_especialidade` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_docente` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nome` VARCHAR(100) NULL DEFAULT 'teste',
    `Status` INTEGER UNSIGNED NULL DEFAULT 1,
    `Codigo_disciplina` INTEGER UNSIGNED NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NULL,
    `Codigo_Especialidade` INTEGER UNSIGNED NULL,
    `Contacto` VARCHAR(45) NULL,
    `Email` VARCHAR(45) NULL,
    `user_id` BIGINT UNSIGNED NOT NULL DEFAULT 1,

    INDEX `FK_tb_docente_1`(`Status`),
    INDEX `FK_tb_docente_2`(`Codigo_disciplina`),
    INDEX `FK_tb_docente_3`(`user_id`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_disciplinas_docente` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `CodigoDocente` INTEGER UNSIGNED NOT NULL,
    `CodigoCurso` INTEGER UNSIGNED NOT NULL,
    `CodigoDisciplina` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_disciplinas_docente_1`(`CodigoDocente`),
    INDEX `FK_tb_disciplinas_docente_2`(`CodigoCurso`),
    INDEX `FK_tb_disciplinas_docente_3`(`CodigoDisciplina`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_directores_turmas` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NULL,
    `CodigoAnoLectivo` INTEGER UNSIGNED NOT NULL,
    `CodigoTurma` INTEGER UNSIGNED NOT NULL,
    `CodigoDocente` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_directores_turmas_1`(`CodigoAnoLectivo`),
    INDEX `FK_tb_directores_turmas_2`(`CodigoTurma`),
    INDEX `FK_tb_directores_turmas_3`(`CodigoDocente`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_docente_tuma` (
    `Codigo_Docente` INTEGER UNSIGNED NOT NULL,
    `Codigo_turma` INTEGER UNSIGNED NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_tipo_avaliacao` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Descricao` VARCHAR(45) NULL,
    `Designacao` VARCHAR(45) NOT NULL,
    `TipoAvaliacao` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_tipo_nota` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NULL,
    `PositivaMinima` FLOAT NULL,
    `Status` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_tipo_nota_valor` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `CodigoTipoNota` INTEGER UNSIGNED NOT NULL,
    `TipoValor` VARCHAR(45) NOT NULL,
    `ValorNumerico` FLOAT NOT NULL,
    `ValorSprecao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_tipo_pauta` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_trimestres` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_encarregados` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nome` VARCHAR(250) NOT NULL,
    `Telefone` VARCHAR(45) NOT NULL,
    `Email` VARCHAR(45) NULL,
    `Codigo_Profissao` INTEGER UNSIGNED NOT NULL,
    `Local_Trabalho` VARCHAR(45) NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,
    `DataCadastro` DATE NOT NULL,
    `Status` INTEGER UNSIGNED NOT NULL DEFAULT 1,

    INDEX `FK_tb_encarregados_Profissao`(`Codigo_Profissao`),
    INDEX `FK_tb_encarregados_Utilizador`(`Codigo_Utilizador`),
    INDEX `FK_tb_encarregados_2`(`Status`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_proveniencias` (
    `Codigo` INTEGER NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(100) NULL,
    `CodigoStatus` INTEGER UNSIGNED NULL,
    `Localizacao` VARCHAR(45) NULL,
    `Contacto` VARCHAR(45) NULL,
    `CodigoUtilizador` INTEGER UNSIGNED NULL,
    `DataCadastro` DATETIME(0) NULL,

    INDEX `FK_tb_proveniencias_1`(`CodigoStatus`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_alunos` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nome` VARCHAR(200) NULL,
    `Pai` VARCHAR(200) NULL,
    `Mae` VARCHAR(200) NULL,
    `Codigo_Nacionalidade` INTEGER UNSIGNED NOT NULL,
    `Codigo_Estado_Civil` INTEGER NULL,
    `DataNascimento` DATE NULL,
    `Email` VARCHAR(45) NULL,
    `Telefone` VARCHAR(45) NULL,
    `Codigo_Status` INTEGER NULL DEFAULT 1,
    `Codigo_Comuna` INTEGER UNSIGNED NOT NULL,
    `Codigo_Encarregado` INTEGER UNSIGNED NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,
    `Sexo` VARCHAR(10) NULL,
    `N_documento_identificacao` VARCHAR(45) NULL,
    `DataCadastro` DATE NULL,
    `Saldo` FLOAT NULL DEFAULT 0,
    `Desconto` FLOAT NULL,
    `URL_Foto` VARCHAR(345) NULL DEFAULT 'fotoDefault.png',
    `tipo_desconto` VARCHAR(45) NULL,
    `EscolaProveniencia` INTEGER NULL,
    `Saldo_Anterior` FLOAT NULL,
    `CodigoTipoDocumento` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `Morada` VARCHAR(60) NOT NULL DEFAULT '...',
    `DataEmissao` DATE NULL,
    `Motivo_Desconto` VARCHAR(455) NULL,
    `ProvinciaEmissao` VARCHAR(45) NOT NULL DEFAULT 'LUANDA',
    `user_id` BIGINT UNSIGNED NULL DEFAULT 1,

    UNIQUE INDEX `Index_9`(`Nome`),
    INDEX `FK_tb_alunos_2`(`user_id`),
    INDEX `FK_tb_alunos_Comuna`(`Codigo_Comuna`),
    INDEX `FK_tb_alunos_Encarregado`(`Codigo_Encarregado`),
    INDEX `FK_tb_alunos_Estado_Civil`(`Codigo_Estado_Civil`),
    INDEX `FK_tb_alunos_Nacionalidade`(`Codigo_Nacionalidade`),
    INDEX `FK_tb_alunos_Utilizador`(`Codigo_Utilizador`),
    INDEX `FK_tb_alunos_status`(`Codigo_Status`),
    INDEX `proveniencias`(`EscolaProveniencia`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_matriculas` (
    `Codigo` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `Data_Matricula` DATE NOT NULL,
    `Codigo_Curso` INTEGER UNSIGNED NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,
    `codigoStatus` INTEGER UNSIGNED NOT NULL DEFAULT 1,

    UNIQUE INDEX `Index_6`(`Codigo_Aluno`),
    INDEX `FK_tb_matriculas_Aluno`(`Codigo_Aluno`),
    INDEX `FK_tb_matriculas_Curso`(`Codigo_Curso`),
    INDEX `FK_tb_matriculas_4`(`codigoStatus`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_confirmacoes` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Matricula` INTEGER UNSIGNED NOT NULL,
    `Data_Confirmacao` DATE NOT NULL,
    `Codigo_Turma` INTEGER UNSIGNED NOT NULL,
    `Codigo_Ano_lectivo` INTEGER UNSIGNED NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,
    `Mes_Comecar` DATE NULL,
    `Codigo_Status` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `Classificacao` VARCHAR(45) NULL,

    INDEX `FK_tb_confirmacoes_Matricula`(`Codigo_Matricula`),
    INDEX `FK_tb_confirmacoes_Turma`(`Codigo_Turma`),
    INDEX `FK_tb_confirmacoes_Utilizador`(`Codigo_Utilizador`),
    INDEX `FK_tb_confirmacoes_Ano_Lectivo`(`Codigo_Ano_lectivo`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_transferencias` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `CodigoAluno` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `CodigoEscola` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `CodigoUtilizador` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `DataTransferencia` DATE NULL,
    `CodigoMotivo` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `OBS` VARCHAR(150) NULL,
    `DataActualizacao` DATE NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_motivos_anulacao` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_moedas` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_categoria_servicos` (
    `codigo` INTEGER NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(50) NULL DEFAULT '',

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `motivos_iva` (
    `codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigomotivo` VARCHAR(45) NOT NULL,
    `designacao` VARCHAR(45) NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taxa_iva` (
    `codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `taxa` DOUBLE NOT NULL DEFAULT 0,
    `designcao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_motivo_isencao` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Isencao` VARCHAR(5) NOT NULL DEFAULT '',
    `Designacao` VARCHAR(300) NOT NULL DEFAULT '',
    `Status` VARCHAR(30) NOT NULL DEFAULT 'Activo',

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_tipo_taxa_iva` (
    `Codigo` INTEGER NOT NULL AUTO_INCREMENT,
    `Taxa` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `Designacao` VARCHAR(45) NULL DEFAULT '',
    `Codigo_Isencao` INTEGER UNSIGNED NULL DEFAULT 0,
    `Status` VARCHAR(45) NOT NULL DEFAULT 'Activo',

    INDEX `FK_tb_tipo_taxa_iva_1`(`Codigo_Isencao`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_tipo_multa` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Descrisao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_tipo_servicos` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,
    `Preco` FLOAT NOT NULL,
    `Descricao` VARCHAR(45) NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,
    `Codigo_Moeda` INTEGER UNSIGNED NOT NULL,
    `TipoServico` VARCHAR(15) NOT NULL,
    `Status` VARCHAR(45) NOT NULL DEFAULT 'Activo',
    `AplicarMulta` BOOLEAN NOT NULL DEFAULT false,
    `AplicarDesconto` BOOLEAN NOT NULL DEFAULT false,
    `Codigo_Ano` INTEGER UNSIGNED NULL DEFAULT 1,
    `CodigoAnoLectivo` INTEGER UNSIGNED NULL,
    `ValorMulta` FLOAT NULL DEFAULT 0,
    `iva` INTEGER UNSIGNED NULL,
    `codigoRasao` INTEGER UNSIGNED NULL,
    `Categoria` INTEGER NULL,
    `codigo_multa` INTEGER NULL,

    INDEX `FK_tb_tipo_servicos_Moeda`(`Codigo_Moeda`),
    INDEX `FK_tb_tipo_servicos_Utilizador`(`Codigo_Utilizador`),
    INDEX `FK_tb_tipo_servicos_motivos_iva`(`codigoRasao`),
    INDEX `FK_tb_tipo_servicos_taxa_iva`(`iva`),
    INDEX `FK_tb_tipo_servicos_tb_categoria_servicos`(`Categoria`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_servicos_turma` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `CodigoTurma` INTEGER UNSIGNED NOT NULL,
    `AnoLectivo` VARCHAR(45) NOT NULL,
    `CodigoClasse` INTEGER UNSIGNED NOT NULL,
    `CodigoServico` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_servicos_turma_1`(`CodigoClasse`),
    INDEX `FK_tb_servicos_turma_2`(`CodigoTurma`),
    INDEX `FK_tb_servicos_turma_3`(`CodigoServico`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_servico_aluno` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Servico` INTEGER UNSIGNED NOT NULL,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `status` INTEGER UNSIGNED NOT NULL,
    `Codigo_Turma` INTEGER UNSIGNED NOT NULL DEFAULT 1,

    INDEX `FK_tb_servico_classe_1`(`Codigo_Servico`),
    INDEX `FK_tb_servico_classe_2`(`Codigo_Aluno`),
    INDEX `FK_tb_servico_classe_3`(`status`),
    INDEX `FK_tb_servico_aluno_4`(`Codigo_Turma`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_propina_classe` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `CodigoClasse` INTEGER UNSIGNED NOT NULL,
    `CodigoTipoServico` INTEGER UNSIGNED NOT NULL,
    `CodigoUtilizador` INTEGER UNSIGNED NOT NULL,
    `DataRegisto` DATE NOT NULL,
    `AnoLectivo` VARCHAR(45) NOT NULL DEFAULT '2017',

    INDEX `FK_tb_propina_classe_1`(`CodigoClasse`),
    INDEX `FK_tb_propina_classe_2`(`CodigoTipoServico`),
    INDEX `FK_tb_propina_classe_3`(`CodigoUtilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_limite_pagamento_propina` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `CodigoClasse` INTEGER UNSIGNED NOT NULL,
    `MesLimite` VARCHAR(45) NOT NULL,
    `mesInicial` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_meses_classe` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Mes` VARCHAR(45) NOT NULL,
    `CodigoClasse` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_forma_pagamento` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_pagamentoi` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Data` DATETIME(0) NOT NULL,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `Status` INTEGER UNSIGNED NOT NULL,
    `Total` FLOAT NULL,
    `ValorEntregue` FLOAT NOT NULL,
    `DataBanco` DATE NOT NULL,
    `TotalDesconto` FLOAT NOT NULL,
    `Obs` VARCHAR(200) NULL,
    `Borderoux` VARCHAR(200) NULL,
    `SaldoAnterior` FLOAT NOT NULL DEFAULT 0,
    `DescontoSaldo` FLOAT NOT NULL DEFAULT 0,
    `Saldo` FLOAT NOT NULL DEFAULT 0,
    `CodigoPagamento` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `SaldoOperacao` FLOAT NOT NULL DEFAULT 0,
    `CodigoUtilizador` INTEGER UNSIGNED NULL,
    `hash` VARCHAR(1000) NULL,
    `TipoDocumento` VARCHAR(50) NULL,
    `TotalIva` DOUBLE NULL,
    `nifCliente` VARCHAR(50) NULL,
    `troco` DOUBLE NULL,

    INDEX `FK_tb_pagamentoI_1`(`Status`),
    INDEX `Index_3`(`Borderoux`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_pagamentos` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `Codigo_Tipo_Servico` INTEGER UNSIGNED NULL,
    `Data` DATE NOT NULL,
    `N_Bordoro` VARCHAR(200) NOT NULL,
    `Multa` FLOAT NOT NULL,
    `Mes` VARCHAR(45) NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,
    `Observacao` VARCHAR(100) NOT NULL,
    `Ano` INTEGER UNSIGNED NULL DEFAULT 1975,
    `ContaMovimentada` VARCHAR(45) NOT NULL,
    `Quantidade` INTEGER UNSIGNED NULL,
    `Desconto` FLOAT NULL,
    `Totalgeral` FLOAT NULL,
    `DataBanco` DATE NULL,
    `Codigo_Estatus` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `Codigo_Empresa` INTEGER UNSIGNED NULL DEFAULT 1,
    `Codigo_FormaPagamento` INTEGER UNSIGNED NULL DEFAULT 1,
    `Saldo_Anterior` FLOAT NULL DEFAULT 0,
    `CodigoPagamento` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `DescontoSaldo` FLOAT NOT NULL DEFAULT 1,
    `TipoDocumento` VARCHAR(45) NOT NULL,
    `Next` VARCHAR(45) NOT NULL,
    `codoc` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `fatura` VARCHAR(45) NOT NULL,
    `taxa_iva` DOUBLE NULL,
    `hash` VARCHAR(555) NOT NULL,
    `preco` DOUBLE NOT NULL DEFAULT 0,
    `indice_mes` INTEGER NULL,
    `indice_ano` INTEGER NULL,

    INDEX `FK_tb_pagamentos_Utilizadore`(`Codigo_Utilizador`),
    INDEX `FK_tb_pagamentos_Tipo_Servicos`(`Codigo_Tipo_Servico`),
    INDEX `FK_tb_pagamentos_Aluno`(`Codigo_Aluno`),
    INDEX `FK_tb_pagamentos_CodigoPagamento`(`CodigoPagamento`),
    INDEX `FK_tb_pagamentos_Codigo_FormaPagamento`(`Codigo_FormaPagamento`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_nota_credito` (
    `codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,
    `fatura` VARCHAR(45) NOT NULL,
    `Descricao` VARCHAR(45) NOT NULL,
    `valor` VARCHAR(45) NOT NULL,
    `codigo_aluno` INTEGER UNSIGNED NOT NULL,
    `Documento` VARCHAR(45) NOT NULL,
    `next` VARCHAR(45) NOT NULL,
    `DataOperacao` VARCHAR(45) NULL DEFAULT '00-00-0000',
    `hash` VARCHAR(555) NULL,
    `CodigoPagamentoi` INTEGER UNSIGNED NULL,

    INDEX `FK_tb_nota_credito_1`(`codigo_aluno`),
    INDEX `FK_tb_nota_credito_tb_pagamentoi`(`CodigoPagamentoi`),
    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_tipo_status` (
    `codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_status` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,
    `tipoStatus` INTEGER UNSIGNED NULL,

    INDEX `FK_tb_status_1`(`tipoStatus`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_tipo_declaracao` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_efeitos_declaracao` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exp` (
    `idExp` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`idExp`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loginadmin` (
    `codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `usuario` VARCHAR(45) NOT NULL,
    `senha` VARCHAR(45) NOT NULL,
    `nomeCompleto` VARCHAR(45) NOT NULL,
    `resetSenha` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loginpedagogico` (
    `codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `usuario` VARCHAR(45) NOT NULL,
    `senha` VARCHAR(45) NOT NULL,
    `nomeCompleto` VARCHAR(45) NOT NULL,
    `resetSenha` VARCHAR(45) NOT NULL,
    `TipoUsuario` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logssenhaalter` (
    `codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `designacao` VARCHAR(45) NOT NULL,
    `senha` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materias` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `imagem` VARCHAR(191) NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `FK_materias_1`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `migrations` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `migration` VARCHAR(191) NOT NULL,
    `batch` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modoescolas` (
    `codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modomat` (
    `codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nota_credito_itens` (
    `codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `DataOperaÃ§ao` VARCHAR(45) NOT NULL,
    `fatura` VARCHAR(45) NOT NULL,
    `DataOperaÃƒÂ§ao` VARCHAR(45) NOT NULL,
    `DataOperaÃƒÆ’Ã‚Â§ao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_resets` (
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,

    INDEX `password_resets_email_index`(`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `setmodoescola` (
    `codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_acessos_sistema` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `CodigoUtilizador` INTEGER UNSIGNED NOT NULL,
    `DataEntrada` DATETIME(0) NOT NULL,
    `DataSaida` DATETIME(0) NULL,
    `Descricao` VARCHAR(145) NULL,
    `IpAcesso` VARCHAR(45) NULL,
    `MacAdrress` VARCHAR(95) NULL,

    INDEX `FK_tb_acessos_sistema_1`(`CodigoUtilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_anexo` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `CodigoAluno` INTEGER UNSIGNED NULL,
    `NomeFile` VARCHAR(45) NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_anulacoes` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Confirmacao` INTEGER UNSIGNED NOT NULL,
    `Data_Anulacao` DATE NOT NULL,
    `Codigo_Motivo_Anulacao` INTEGER UNSIGNED NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_anulacoes_Confirmacao`(`Codigo_Confirmacao`),
    INDEX `FK_tb_anulacoes_Motivos`(`Codigo_Motivo_Anulacao`),
    INDEX `FK_tb_anulacoes_Utilizador`(`Codigo_Utilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_avaliacao_classe` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `CodigoCalsse` INTEGER UNSIGNED NOT NULL,
    `CodigoAvaliacao` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_avaliacao_classe_1`(`CodigoCalsse`),
    INDEX `FK_tb_avaliacao_classe_2`(`CodigoAvaliacao`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_avaliacao_tipo_nota` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Avaliacao` INTEGER UNSIGNED NOT NULL,
    `Codigo_Tipo_Nota` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_certificado_items` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Disciplina` VARCHAR(60) NOT NULL,
    `Nota1` VARCHAR(10) NOT NULL,
    `Nota2` VARCHAR(10) NOT NULL,
    `Nota3` VARCHAR(10) NOT NULL,
    `CodigoCertificado` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_classe_disiciplina_terminal` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `CodigoDisciplina` INTEGER UNSIGNED NULL,
    `CodigoClasseInicio` INTEGER UNSIGNED NULL,
    `CodigoClasseFim` INTEGER UNSIGNED NULL,
    `CodigoCurso` INTEGER UNSIGNED NULL,

    INDEX `FK_tb_classe_trminal_ClasseFim`(`CodigoClasseFim`),
    INDEX `FK_tb_classe_trminal_ClasseInicio`(`CodigoClasseInicio`),
    INDEX `FK_tb_classe_trminal_Curso`(`CodigoCurso`),
    INDEX `FK_tb_classe_trminal_Disciplina`(`CodigoDisciplina`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_classificacao` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,
    `Descricao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_classificacao_final` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,
    `Descricao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_comportamento` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `AnoLectivo` VARCHAR(45) NOT NULL,
    `CodigoDisciplina` INTEGER UNSIGNED NULL,
    `Trimestre` VARCHAR(45) NOT NULL,
    `Comportamento` VARCHAR(45) NOT NULL,

    INDEX `FK_tb_comportamento_CodigoAluno`(`Codigo_Aluno`),
    INDEX `FK_tb_comportamento_CodigoDisciplina`(`CodigoDisciplina`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_condicao_aprovacao` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `CodigoCurso` INTEGER UNSIGNED NOT NULL,
    `CodigoClasse` INTEGER UNSIGNED NOT NULL,
    `CodigoDisciplina` INTEGER UNSIGNED NOT NULL,
    `NotaMinima` INTEGER UNSIGNED NOT NULL DEFAULT 10,
    `Global` VARCHAR(45) NOT NULL DEFAULT 'Sim',

    INDEX `FK_tb_condicao_aprovacao_1`(`CodigoCurso`),
    INDEX `FK_tb_condicao_aprovacao_2`(`CodigoClasse`),
    INDEX `FK_tb_condicao_aprovacao_3`(`CodigoDisciplina`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_conta_aluno` (
    `Codigo` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `Saldo` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,

    INDEX `FK_tb_conta_aluno_1`(`Codigo_Aluno`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_declaracao_notas` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `dataPedido` DATE NOT NULL,
    `Codigo_Matricula` INTEGER UNSIGNED NOT NULL,
    `Codigo_Efeito` INTEGER UNSIGNED NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_declaracao_notas_Efeito`(`Codigo_Efeito`),
    INDEX `FK_tb_declaracao_notas_Matricula`(`Codigo_Matricula`),
    INDEX `FK_tb_declaracao_notas_Utilizador`(`Codigo_Utilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_declaracao_sem_nota` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `DataPedido` DATE NOT NULL,
    `Codigo_Matricula` INTEGER UNSIGNED NOT NULL,
    `Codigo_Efeito` INTEGER UNSIGNED NOT NULL,
    `Codigo_Utilizadores` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_declaracao_sem_nota_Efeito`(`Codigo_Efeito`),
    INDEX `FK_tb_declaracao_sem_nota_Matricula`(`Codigo_Matricula`),
    INDEX `FK_tb_declaracao_sem_nota_Utilizador`(`Codigo_Utilizadores`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_deposito_valor` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_moeda` INTEGER UNSIGNED NOT NULL,
    `forma_pagamento` VARCHAR(45) NOT NULL,
    `ContaBanco` VARCHAR(45) NULL,
    `Data` DATE NOT NULL,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `Obs` VARCHAR(60) NULL,
    `Valor` FLOAT NOT NULL,

    INDEX `FK_tb_deposito_valor_1`(`Codigo_moeda`),
    INDEX `FK_tb_deposito_valor_2`(`Codigo_Aluno`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_entrada_valores` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `CodigoAluno` INTEGER UNSIGNED NOT NULL,
    `SaldoAnterior` FLOAT NOT NULL,
    `Turma` VARCHAR(50) NOT NULL,
    `Curso` VARCHAR(95) NOT NULL,
    `ValorEntregue` FLOAT NOT NULL,
    `Moeda` VARCHAR(5) NOT NULL,
    `ContraValor` FLOAT NOT NULL,
    `SaldoActual` FLOAT NOT NULL,
    `ContaMovimentada` VARCHAR(45) NOT NULL,
    `NBordoro` VARCHAR(25) NULL,
    `Cambio` FLOAT NOT NULL,
    `DataDeposito` DATE NULL,
    `DataCadastro` DATETIME(0) NOT NULL,
    `CodigoUtilizador` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_entrada_valores_1`(`CodigoAluno`),
    INDEX `FK_tb_entrada_valores_2`(`CodigoUtilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_entrega_declarcoes` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Pedido_Declaracao` INTEGER UNSIGNED NOT NULL,
    `Data_Entrega` DATE NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_entrega_declarcoes_Pedido_Declaracao`(`Codigo_Pedido_Declaracao`),
    INDEX `FK_tb_entrega_declarcoes_Utilizador`(`Codigo_Utilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_faltas` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nFaltas` INTEGER UNSIGNED NOT NULL,
    `Codigo_Matricula` INTEGER UNSIGNED NOT NULL,
    `Codigo_Disciplina` INTEGER UNSIGNED NOT NULL,
    `dataFalta` DATE NOT NULL,
    `Codigo_Utilizadores` INTEGER UNSIGNED NOT NULL,
    `Descricao` VARCHAR(45) NULL,
    `AnoLectivo` VARCHAR(45) NOT NULL,
    `dataRegisto` DATETIME(0) NULL,
    `Trimestre` VARCHAR(45) NOT NULL,

    INDEX `FK_tb_faltas_Aluno`(`Codigo_Matricula`),
    INDEX `FK_tb_faltas_Disciplina`(`Codigo_Disciplina`),
    INDEX `FK_tb_faltas_Utilizadores`(`Codigo_Utilizadores`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_formula_media` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `formula` VARCHAR(45) NOT NULL,
    `data` DATE NOT NULL,
    `tipo_media` VARCHAR(45) NOT NULL,
    `tipo_pauta` INTEGER UNSIGNED NOT NULL,
    `Codigo_Curso` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_formula_media_1`(`tipo_pauta`),
    INDEX `FK_tb_formula_media_2`(`Codigo_Curso`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_foto` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` VARCHAR(200) NOT NULL,
    `foto` MEDIUMBLOB NOT NULL,
    `tipo` VARCHAR(15) NULL,
    `tamanho` INTEGER UNSIGNED NULL,
    `codigoAluno` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_foto_1`(`codigoAluno`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_historico_aluno` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `Data` DATE NOT NULL,
    `Ato` VARCHAR(200) NOT NULL,
    `Codigo_Classificacao` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_historico_aluno_1`(`Codigo_Classificacao`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_irmaos` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Aluno1` VARCHAR(95) NOT NULL,
    `Aluno2` VARCHAR(95) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_logs` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Descricao` VARCHAR(1000) NOT NULL,
    `OBS` VARCHAR(245) NULL,
    `Data` DATETIME(0) NOT NULL,
    `CodigoUtilizador` INTEGER UNSIGNED NOT NULL DEFAULT 1,

    INDEX `FK_tb_logs_1`(`CodigoUtilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_merito` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Descricao` VARCHAR(45) NOT NULL,
    `Data_Merito` DATE NOT NULL,
    `Codigo_Matricula` INTEGER UNSIGNED NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_merito_Matricula`(`Codigo_Matricula`),
    INDEX `FK_tb_merito_Utilizador`(`Codigo_Utilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_multa` (
    `Codigo` INTEGER NOT NULL AUTO_INCREMENT,
    `mes_cobranca` INTEGER NULL,
    `dia_cobranca` INTEGER NULL,
    `tipo_cobranca` INTEGER NULL,
    `valor_multa` DOUBLE NULL,
    `taxa_acrescimo` DOUBLE NULL,
    `taxa_adicional` DOUBLE NULL,
    `codigo_ano` INTEGER NULL,
    `designacao` VARCHAR(500) NULL,
    `n_limite_taxa_adicional` INTEGER NULL DEFAULT 0,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_multas` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Dia_Inicio` INTEGER UNSIGNED NOT NULL,
    `Dia_Fim` INTEGER UNSIGNED NOT NULL,
    `Percentagem` FLOAT NULL,
    `Codigo_Tipo_Multa` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `Valor` FLOAT NULL,
    `codigoAnoLectivo` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `mescobrar` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    INDEX `FK_tb_multas_1`(`Codigo_Tipo_Multa`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_notas` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `CodigoAluno` INTEGER UNSIGNED NOT NULL,
    `Nota` FLOAT NOT NULL,
    `CodigoDisciplina` INTEGER UNSIGNED NOT NULL,
    `DataCadastro` DATETIME(0) NOT NULL DEFAULT ('2017-01-01 00:00:00'),
    `CodigoTipoAvaliacao` INTEGER UNSIGNED NOT NULL,
    `CodigoUtilizador` INTEGER UNSIGNED NOT NULL,
    `Obs` VARCHAR(100) NULL,
    `CodigoAnoLectivo` INTEGER UNSIGNED NOT NULL,
    `Codigo_Turma` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `NotaExpressao` VARCHAR(45) NULL DEFAULT 'Nao',
    `Trimestre` VARCHAR(20) NOT NULL,
    `ComportamentoAluno` VARCHAR(200) NULL,

    INDEX `FK_tb_notas_1`(`CodigoAluno`),
    INDEX `FK_tb_notas_2`(`CodigoDisciplina`),
    INDEX `FK_tb_notas_3`(`CodigoAnoLectivo`),
    INDEX `FK_tb_notas_4`(`CodigoTipoAvaliacao`),
    INDEX `FK_tb_notas_5`(`CodigoUtilizador`),
    INDEX `FK_tb_notas_6`(`Codigo_Turma`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_notas_1_4` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `MAT_AC1` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC2` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC3` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR1` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR2` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR3` FLOAT NOT NULL DEFAULT 0,
    `PT_AC1` FLOAT NOT NULL DEFAULT 0,
    `PT_AC2` FLOAT NOT NULL DEFAULT 0,
    `PT_AC3` FLOAT NOT NULL DEFAULT 0,
    `PT_FR1` FLOAT NOT NULL DEFAULT 0,
    `PT_FR2` FLOAT NOT NULL DEFAULT 0,
    `PT_FR3` FLOAT NOT NULL DEFAULT 0,
    `EST_MEIO_AC1` FLOAT NOT NULL DEFAULT 0,
    `EST_MEIO_AC2` FLOAT NOT NULL DEFAULT 0,
    `EST_MEIO_AC3` FLOAT NOT NULL DEFAULT 0,
    `EST_MEIO_FR1` FLOAT NOT NULL DEFAULT 0,
    `EST_MEIO_FR2` FLOAT NOT NULL DEFAULT 0,
    `EST_MEIO_FR3` FLOAT NOT NULL DEFAULT 0,
    `ED_MUS_AC1` FLOAT NOT NULL DEFAULT 0,
    `ED_MUS_AC2` FLOAT NOT NULL DEFAULT 0,
    `ED_MUS_AC3` FLOAT NOT NULL DEFAULT 0,
    `ED_MUS_FR1` FLOAT NOT NULL DEFAULT 0,
    `ED_MUS_FR2` FLOAT NOT NULL DEFAULT 0,
    `ED_MUS_FR3` FLOAT NOT NULL DEFAULT 0,
    `EMP_AC1` FLOAT NOT NULL DEFAULT 0,
    `EMP_AC2` FLOAT NOT NULL DEFAULT 0,
    `EMP_AC3` FLOAT NOT NULL DEFAULT 0,
    `EMP_FR1` FLOAT NOT NULL DEFAULT 0,
    `EMP_FR2` FLOAT NOT NULL DEFAULT 0,
    `EMP_FR3` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_AC1` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_AC2` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_AC3` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_FR1` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_FR2` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_FR3` FLOAT NOT NULL DEFAULT 0,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `Codigo_Ano_Lectivo` INTEGER UNSIGNED NOT NULL,
    `Codigo_Turma` INTEGER UNSIGNED NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,
    `obs` VARCHAR(45) NOT NULL,
    `desempenho` VARCHAR(45) NOT NULL,
    `DataCastro` DATE NOT NULL,
    `LP_EXAME` FLOAT NOT NULL DEFAULT 0,
    `MAT_EXAME` FLOAT NOT NULL DEFAULT 0,
    `EST_MEIO_EXAME` FLOAT NOT NULL DEFAULT 0,
    `EMP_EXAME` FLOAT NOT NULL DEFAULT 0,
    `ED_MUS_EXAME` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_EXAME` FLOAT NOT NULL DEFAULT 0,
    `MAT_NER` FLOAT NOT NULL DEFAULT 0,
    `EST_MEIO_NER` FLOAT NOT NULL DEFAULT 0,
    `ED_MUS_NER` FLOAT NOT NULL DEFAULT 0,
    `EMP_NER` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_NER` FLOAT NOT NULL DEFAULT 0,

    INDEX `FK_tb_notas_1_4_Aluno`(`Codigo_Aluno`),
    INDEX `FK_tb_notas_1_4_Ano_Lectivo`(`Codigo_Ano_Lectivo`),
    INDEX `FK_tb_notas_1_4_Turma`(`Codigo_Turma`),
    INDEX `FK_tb_notas_1_4_User`(`Codigo_Utilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_notas_5_6` (
    `Codigo` INTEGER NOT NULL AUTO_INCREMENT,
    `PT_AC1` FLOAT NOT NULL DEFAULT 0,
    `PT_AC2` FLOAT NOT NULL DEFAULT 0,
    `PT_AC3` FLOAT NOT NULL DEFAULT 0,
    `PT_FR1` FLOAT NOT NULL DEFAULT 0,
    `PT_FR2` FLOAT NOT NULL DEFAULT 0,
    `PT_FR3` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC1` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC2` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC3` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR1` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR2` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR3` FLOAT NOT NULL DEFAULT 0,
    `GEO_AC1` FLOAT NOT NULL DEFAULT 0,
    `GEO_AC2` FLOAT NOT NULL DEFAULT 0,
    `GEO_AC3` FLOAT NOT NULL DEFAULT 0,
    `GEO_FR1` FLOAT NOT NULL DEFAULT 0,
    `GEO_FR2` FLOAT NOT NULL DEFAULT 0,
    `GEO_FR3` FLOAT NOT NULL DEFAULT 0,
    `HIST_AC1` FLOAT NOT NULL DEFAULT 0,
    `HIST_AC2` FLOAT NOT NULL DEFAULT 0,
    `HIST_AC3` FLOAT NOT NULL DEFAULT 0,
    `HIST_FR1` FLOAT NOT NULL DEFAULT 0,
    `HIST_FR2` FLOAT NOT NULL DEFAULT 0,
    `HIST_FR3` FLOAT NOT NULL DEFAULT 0,
    `EMP_AC1` FLOAT NOT NULL DEFAULT 0,
    `EMP_AC2` FLOAT NOT NULL DEFAULT 0,
    `EMP_AC3` FLOAT NOT NULL DEFAULT 0,
    `EMP_FR1` FLOAT NOT NULL DEFAULT 0,
    `EMP_FR2` FLOAT NOT NULL DEFAULT 0,
    `EMP_FR3` FLOAT NOT NULL DEFAULT 0,
    `ED_MUS_AC1` FLOAT NOT NULL DEFAULT 0,
    `ED_MUS_AC2` FLOAT NOT NULL DEFAULT 0,
    `ED_MUS_AC3` FLOAT NOT NULL DEFAULT 0,
    `ED_MUS_FR1` FLOAT NOT NULL DEFAULT 0,
    `ED_MUS_FR2` FLOAT NOT NULL DEFAULT 0,
    `ED_MUS_FR3` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_AC1` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_AC2` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_AC3` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_FR1` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_FR2` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_FR3` FLOAT NOT NULL DEFAULT 0,
    `CIEN_AC1` FLOAT NOT NULL DEFAULT 0,
    `CIEN_AC2` FLOAT NOT NULL DEFAULT 0,
    `CIEN_AC3` FLOAT NOT NULL DEFAULT 0,
    `CIEN_FR1` FLOAT NOT NULL DEFAULT 0,
    `CIEN_FR2` FLOAT NOT NULL DEFAULT 0,
    `CIEN_FR3` FLOAT NOT NULL DEFAULT 0,
    `LP_EXAME` FLOAT NOT NULL DEFAULT 0,
    `MAT_EXAME` FLOAT NOT NULL DEFAULT 0,
    `CIEN_EXAME` FLOAT NOT NULL DEFAULT 0,
    `HIST_EXAME` FLOAT NOT NULL DEFAULT 0,
    `GEO_EXAME` FLOAT NOT NULL DEFAULT 0,
    `EMC_EXAME` FLOAT NOT NULL DEFAULT 0,
    `EMP_EXAME` FLOAT NOT NULL DEFAULT 0,
    `ED_MUS_EXAME` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_EXAME` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_EXAME` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_AC1` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_AC2` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_AC3` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_FR1` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_FR2` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_FR3` FLOAT NOT NULL DEFAULT 0,
    `EVP_AC1` FLOAT NOT NULL DEFAULT 0,
    `EVP_AC2` FLOAT NOT NULL DEFAULT 0,
    `EVP_AC3` FLOAT NOT NULL DEFAULT 0,
    `EVP_FR1` FLOAT NOT NULL DEFAULT 0,
    `EVP_FR2` FLOAT NOT NULL DEFAULT 0,
    `EVP_FR3` FLOAT NOT NULL DEFAULT 0,
    `MAT_NER` FLOAT NOT NULL DEFAULT 0,
    `PT__NER` FLOAT NOT NULL DEFAULT 0,
    `CIEN_NER` FLOAT NOT NULL DEFAULT 0,
    `HIST_NER` FLOAT NOT NULL DEFAULT 0,
    `GEO_NER` FLOAT NOT NULL DEFAULT 0,
    `EMC_NER` FLOAT NOT NULL DEFAULT 0,
    `EVP_NER` FLOAT NOT NULL DEFAULT 0,
    `ED_MUS_NER` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_NER` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_NER` FLOAT NOT NULL DEFAULT 0,
    `obs` VARCHAR(45) NULL,
    `Desempenho` VARCHAR(45) NULL,
    `DataCadastro` DATE NULL,
    `CodigoAluno` INTEGER UNSIGNED NOT NULL,
    `CodigoUtilizador` INTEGER UNSIGNED NOT NULL,
    `CodigoTurma` INTEGER UNSIGNED NOT NULL,
    `CodigoAnoLectivo` INTEGER UNSIGNED NOT NULL,
    `EMC_AC1` FLOAT NOT NULL DEFAULT 0,

    INDEX `FK_tb_notas_5_6_1`(`CodigoAluno`),
    INDEX `FK_tb_notas_5_6_2`(`CodigoTurma`),
    INDEX `FK_tb_notas_5_6_3`(`CodigoUtilizador`),
    INDEX `FK_tb_notas_5_6_4`(`CodigoAnoLectivo`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_notas_7_9` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `MAT_AC1` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC2` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC3` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR1` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR2` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR3` FLOAT NOT NULL DEFAULT 0,
    `PT_AC1` FLOAT NOT NULL DEFAULT 0,
    `PT_AC2` FLOAT NOT NULL DEFAULT 0,
    `PT_AC3` FLOAT NOT NULL DEFAULT 0,
    `PT_FR1` FLOAT NOT NULL DEFAULT 0,
    `PT_FR2` FLOAT NOT NULL DEFAULT 0,
    `PT_FR3` FLOAT NOT NULL DEFAULT 0,
    `QUIM_AC1` FLOAT NOT NULL DEFAULT 0,
    `QUIM_AC2` FLOAT NOT NULL DEFAULT 0,
    `QUIM_AC3` FLOAT NOT NULL DEFAULT 0,
    `QUIM_FR1` FLOAT NOT NULL DEFAULT 0,
    `QUIM_FR2` FLOAT NOT NULL DEFAULT 0,
    `QUIM_FR3` FLOAT NOT NULL DEFAULT 0,
    `BIO_AC1` FLOAT NOT NULL DEFAULT 0,
    `BIO_AC2` FLOAT NOT NULL DEFAULT 0,
    `BIO_AC3` FLOAT NOT NULL DEFAULT 0,
    `BIO_FR1` FLOAT NOT NULL DEFAULT 0,
    `BIO_FR2` FLOAT NOT NULL DEFAULT 0,
    `BIO_FR3` FLOAT NOT NULL DEFAULT 0,
    `FIS_AC1` FLOAT NOT NULL DEFAULT 0,
    `FIS_AC2` FLOAT NOT NULL DEFAULT 0,
    `FIS_AC3` FLOAT NOT NULL DEFAULT 0,
    `FIS_FR1` FLOAT NOT NULL DEFAULT 0,
    `FIS_FR2` FLOAT NOT NULL DEFAULT 0,
    `FIS_FR3` FLOAT NOT NULL DEFAULT 0,
    `GEO_AC1` FLOAT NOT NULL DEFAULT 0,
    `GEO_AC2` FLOAT NOT NULL DEFAULT 0,
    `GEO_AC3` FLOAT NOT NULL DEFAULT 0,
    `GEO_FR1` FLOAT NOT NULL DEFAULT 0,
    `GEO_FR2` FLOAT NOT NULL DEFAULT 0,
    `GEO_FR3` FLOAT NOT NULL DEFAULT 0,
    `HIST_AC1` FLOAT NOT NULL DEFAULT 0,
    `HIST_AC2` FLOAT NOT NULL DEFAULT 0,
    `HIST_AC3` FLOAT NOT NULL DEFAULT 0,
    `HIST_FR1` FLOAT NOT NULL DEFAULT 0,
    `HIST_FR2` FLOAT NOT NULL DEFAULT 0,
    `HIST_FR3` FLOAT NOT NULL DEFAULT 0,
    `LING_ESTR_AC1` FLOAT NOT NULL DEFAULT 0,
    `LING_ESTR_AC2` FLOAT NOT NULL DEFAULT 0,
    `LING_ESTR_AC3` FLOAT NOT NULL DEFAULT 0,
    `LING_ESTR_FR1` FLOAT NOT NULL DEFAULT 0,
    `LING_ESTR_FR2` FLOAT NOT NULL DEFAULT 0,
    `LING_ESTR_FR3` FLOAT NOT NULL DEFAULT 0,
    `EMC_AC1` FLOAT NOT NULL DEFAULT 0,
    `EMC_AC2` FLOAT NOT NULL DEFAULT 0,
    `EMC_AC3` FLOAT NOT NULL DEFAULT 0,
    `EMC_FR1` FLOAT NOT NULL DEFAULT 0,
    `EMC_FR2` FLOAT NOT NULL DEFAULT 0,
    `EMC_FR3` FLOAT NOT NULL DEFAULT 0,
    `EVP_AC1` FLOAT NOT NULL DEFAULT 0,
    `EVP_AC2` FLOAT NOT NULL DEFAULT 0,
    `EVP_AC3` FLOAT NOT NULL DEFAULT 0,
    `EVP_FR1` FLOAT NOT NULL DEFAULT 0,
    `EVP_FR2` FLOAT NOT NULL DEFAULT 0,
    `EVP_FR3` FLOAT NOT NULL DEFAULT 0,
    `EMP_AC1` FLOAT NOT NULL DEFAULT 0,
    `EMP_AC2` FLOAT NOT NULL DEFAULT 0,
    `EMP_AC3` FLOAT NOT NULL DEFAULT 0,
    `EMP_FR1` FLOAT NOT NULL DEFAULT 0,
    `EMP_FR2` FLOAT NOT NULL DEFAULT 0,
    `EMP_FR3` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_AC1` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_AC2` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_AC3` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_FR1` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_FR2` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_FR3` FLOAT NOT NULL DEFAULT 0,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `Codigo_AnoLectivo` INTEGER UNSIGNED NOT NULL,
    `Codigo_Turma` INTEGER UNSIGNED NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,
    `obs` VARCHAR(45) NULL,
    `desempenho` VARCHAR(45) NULL,
    `DataCadastro` DATE NOT NULL,
    `LP_EXAME` FLOAT NOT NULL DEFAULT 0,
    `MAT_EXAME` FLOAT NOT NULL DEFAULT 0,
    `QUIM_EXAME` FLOAT NOT NULL DEFAULT 0,
    `GEO_EXAME` FLOAT NOT NULL DEFAULT 0,
    `BIO_EXAME` FLOAT NOT NULL DEFAULT 0,
    `HIST_EXAME` FLOAT NOT NULL DEFAULT 0,
    `FIS_EXAME` FLOAT NOT NULL DEFAULT 0,
    `EVP_EXAME` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_EXAME` FLOAT NOT NULL DEFAULT 0,
    `EMC_EXAME` FLOAT NULL DEFAULT 0,
    `ED_FIS_EXAME` FLOAT NULL DEFAULT 0,
    `EMP_EXAME` FLOAT NULL DEFAULT 0,
    `PT_NER` FLOAT NULL DEFAULT 0,
    `MAT_NER` FLOAT NULL DEFAULT 0,
    `QUIM_NER` FLOAT NULL DEFAULT 0,
    `GEO_NER` FLOAT NULL DEFAULT 0,
    `BIO_NER` FLOAT NULL DEFAULT 0,
    `HIST_NER` FLOAT NULL DEFAULT 0,
    `FIS_NER` FLOAT NULL DEFAULT 0,
    `EVP_NER` FLOAT NULL DEFAULT 0,
    `L_ESTR_NER` FLOAT NULL DEFAULT 0,
    `EMC_NER` FLOAT NULL DEFAULT 0,
    `ED_FIS_NER` FLOAT NULL DEFAULT 0,
    `EMP_NER` FLOAT NULL DEFAULT 0,
    `PT_EXAME` FLOAT NULL DEFAULT 0,
    `L_ESTR_AC1` FLOAT NULL DEFAULT 0,
    `L_ESTR_AC2` FLOAT NULL DEFAULT 0,
    `L_ESTR_AC3` FLOAT NULL DEFAULT 0,
    `L_ESTR_FR1` FLOAT NULL DEFAULT 0,
    `L_ESTR_FR2` FLOAT NULL DEFAULT 0,
    `L_ESTR_FR3` FLOAT NULL DEFAULT 0,

    INDEX `FK_tb_notas_7_9_Aluno`(`Codigo_Aluno`),
    INDEX `FK_tb_notas_7_9_AnoLectivo`(`Codigo_AnoLectivo`),
    INDEX `FK_tb_notas_7_9_Turma`(`Codigo_Turma`),
    INDEX `FK_tb_notas_7_9_User`(`Codigo_Utilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_notas_alunos` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `CodigoAluno` INTEGER UNSIGNED NOT NULL,
    `CodigoDisciplina` INTEGER UNSIGNED NOT NULL,
    `Nota` FLOAT NOT NULL,
    `CodigoAnoLectivo` INTEGER UNSIGNED NOT NULL,
    `CodigoTipoAvaliacao` INTEGER UNSIGNED NOT NULL,
    `CodigoTrimestre` INTEGER UNSIGNED NOT NULL,
    `DataCadastro` INTEGER UNSIGNED NOT NULL,
    `CodigoUtilizador` INTEGER UNSIGNED NOT NULL,
    `CodigoTurma` INTEGER UNSIGNED NULL,

    INDEX `FK_tb_notas_alunos_1`(`CodigoAluno`),
    INDEX `FK_tb_notas_alunos_2`(`CodigoDisciplina`),
    INDEX `FK_tb_notas_alunos_3`(`CodigoAnoLectivo`),
    INDEX `FK_tb_notas_alunos_4`(`CodigoTipoAvaliacao`),
    INDEX `FK_tb_notas_alunos_5`(`CodigoUtilizador`),
    INDEX `FK_tb_notas_alunos_6`(`CodigoTrimestre`),
    INDEX `FK_tb_notas_alunos_turma`(`CodigoTurma`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_notas_contgest_10_12` (
    `Codgigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `PT_AC1` FLOAT NOT NULL DEFAULT 0,
    `PT_AC2` FLOAT NOT NULL DEFAULT 0,
    `PT_AC3` FLOAT NOT NULL DEFAULT 0,
    `PT_FR1` FLOAT NOT NULL DEFAULT 0,
    `PT_FR2` FLOAT NOT NULL DEFAULT 0,
    `PT_FR3` FLOAT NOT NULL DEFAULT 0,
    `FAI_AC1` FLOAT NOT NULL DEFAULT 0,
    `FAI_AC2` FLOAT NOT NULL DEFAULT 0,
    `FAI_AC3` FLOAT NOT NULL DEFAULT 0,
    `FAI_FR1` FLOAT NOT NULL DEFAULT 0,
    `FAI_FR2` FLOAT NOT NULL DEFAULT 0,
    `FAI_FR3` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_AC1` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_AC2` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_AC3` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_FR1` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_FR2` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_FR3` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_AC1` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_AC2` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_AC3` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_FR1` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_FR2` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_FR3` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC1` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC2` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC3` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR1` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR2` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR3` FLOAT NOT NULL DEFAULT 0,
    `IACG_AC1` FLOAT NOT NULL DEFAULT 0,
    `IACG_AC2` FLOAT NOT NULL DEFAULT 0,
    `IACG_AC3` FLOAT NOT NULL DEFAULT 0,
    `IACG_FR1` FLOAT NOT NULL DEFAULT 0,
    `IACG_FR2` FLOAT NOT NULL DEFAULT 0,
    `IACG_FR3` FLOAT NOT NULL DEFAULT 0,
    `CONT_FIN_AC1` FLOAT NOT NULL DEFAULT 0,
    `CONT_FIN_AC2` FLOAT NOT NULL DEFAULT 0,
    `CONT_FIN_AC3` FLOAT NOT NULL DEFAULT 0,
    `CONT_FIN_FR1` FLOAT NOT NULL DEFAULT 0,
    `CONT_FIN_FR2` FLOAT NOT NULL DEFAULT 0,
    `CONT_FIN_FR3` FLOAT NOT NULL DEFAULT 0,
    `ECN_AC1` FLOAT NOT NULL DEFAULT 0,
    `ECN_AC2` FLOAT NOT NULL DEFAULT 0,
    `ECN_FR1` FLOAT NOT NULL DEFAULT 0,
    `ECN_FR2` FLOAT NOT NULL DEFAULT 0,
    `ECN_FR3` FLOAT NOT NULL DEFAULT 0,
    `DCL_AC1` FLOAT NOT NULL DEFAULT 0,
    `DCL_AC2` FLOAT NOT NULL DEFAULT 0,
    `DCL_AC3` FLOAT NOT NULL DEFAULT 0,
    `DCL_FR1` FLOAT NOT NULL DEFAULT 0,
    `DCL_FR2` FLOAT NOT NULL DEFAULT 0,
    `DCL_FR3` FLOAT NOT NULL DEFAULT 0,
    `OGE_AC1` FLOAT NOT NULL DEFAULT 0,
    `OGE_AC2` FLOAT NOT NULL DEFAULT 0,
    `OGE_AC3` FLOAT NOT NULL DEFAULT 0,
    `LP_AC1` FLOAT NOT NULL DEFAULT 0,
    `LP_AC2` FLOAT NOT NULL DEFAULT 0,
    `LP_AC3` FLOAT NOT NULL DEFAULT 0,
    `LP_FR1` FLOAT NOT NULL DEFAULT 0,
    `LP_FR2` FLOAT NOT NULL DEFAULT 0,
    `LP_FR3` FLOAT NOT NULL DEFAULT 0,
    `CONT_ANAL_AC1` FLOAT NOT NULL DEFAULT 0,
    `CONT_ANAL_AC2` FLOAT NOT NULL DEFAULT 0,
    `CONT_ANAL_AC3` FLOAT NOT NULL DEFAULT 0,
    `CONT_ANAL_FR1` FLOAT NOT NULL DEFAULT 0,
    `CONT_ANAL_FR2` FLOAT NOT NULL DEFAULT 0,
    `CONT_ANAL_FR3` FLOAT NOT NULL DEFAULT 0,
    `AEF_AC1` FLOAT NOT NULL DEFAULT 0,
    `AEF_AC2` FLOAT NOT NULL DEFAULT 0,
    `AEF_AC3` FLOAT NOT NULL DEFAULT 0,
    `AEF_FR1` FLOAT NOT NULL DEFAULT 0,
    `AEF_FR2` FLOAT NOT NULL DEFAULT 0,
    `AEF_FR3` FLOAT NOT NULL DEFAULT 0,
    `DIR_AC1` FLOAT NOT NULL DEFAULT 0,
    `DIR_AC2` FLOAT NOT NULL DEFAULT 0,
    `DIR_AC3` FLOAT NOT NULL DEFAULT 0,
    `DIR_FR1` FLOAT NOT NULL DEFAULT 0,
    `DIR_FR2` FLOAT NOT NULL DEFAULT 0,
    `DIR_FR3` FLOAT NOT NULL DEFAULT 0,
    `SCL_AC1` FLOAT NOT NULL DEFAULT 0,
    `SCL_AC2` FLOAT NOT NULL DEFAULT 0,
    `SCL_AC3` FLOAT NOT NULL DEFAULT 0,
    `SCL_FR1` FLOAT NOT NULL DEFAULT 0,
    `SCL_FR2` FLOAT NOT NULL DEFAULT 0,
    `SCL_FR3` FLOAT NOT NULL DEFAULT 0,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `Codigo_AnoLectivo` INTEGER UNSIGNED NOT NULL,
    `Codigo_Turma` INTEGER UNSIGNED NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,
    `obs` VARCHAR(45) NOT NULL,
    `desenpenho` VARCHAR(45) NOT NULL,
    `DataCadastro` DATE NOT NULL,
    `PT_NER` FLOAT NOT NULL DEFAULT 0,
    `PT_EXAME` FLOAT NOT NULL DEFAULT 0,
    `FAI_NER` FLOAT NOT NULL DEFAULT 0,
    `FAI_EXAME` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_NER` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_EXAME` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_NER` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_EXAME` FLOAT NOT NULL DEFAULT 0,
    `MAT_NER` FLOAT NOT NULL DEFAULT 0,
    `MAT_EXAME` FLOAT NOT NULL DEFAULT 0,
    `IACG_NER` FLOAT NOT NULL DEFAULT 0,
    `IACG_EXAME` FLOAT NOT NULL DEFAULT 0,
    `CONT_FIN_NER` FLOAT NOT NULL DEFAULT 0,
    `CONT_FIN_EXAME` FLOAT NOT NULL DEFAULT 0,
    `ACN_NER` FLOAT NOT NULL DEFAULT 0,
    `ACN_EXAME` FLOAT NOT NULL DEFAULT 0,
    `DCL_NER` FLOAT NOT NULL DEFAULT 0,
    `DCL_EXAME` FLOAT NOT NULL DEFAULT 0,
    `OGE_NER` FLOAT NOT NULL DEFAULT 0,
    `OGE_EXAME` FLOAT NOT NULL DEFAULT 0,
    `LP_NER` FLOAT NOT NULL DEFAULT 0,
    `LP_EXAME` FLOAT NOT NULL DEFAULT 0,
    `CONT_ANAL_NER` FLOAT NOT NULL DEFAULT 0,
    `CONT_ANAL_EXAME` FLOAT NOT NULL DEFAULT 0,
    `AEF_NER` FLOAT NOT NULL DEFAULT 0,
    `AEF_EXAME` FLOAT NOT NULL DEFAULT 0,
    `DIR_NER` FLOAT NOT NULL DEFAULT 0,
    `DIR_EXAME` FLOAT NOT NULL DEFAULT 0,
    `SCL_NER` FLOAT NOT NULL DEFAULT 0,
    `SCL_EXAME` FLOAT NOT NULL DEFAULT 0,
    `ECN_AC3` FLOAT NOT NULL DEFAULT 0,
    `ECN_NER` FLOAT NOT NULL DEFAULT 0,
    `ECN_EXAME` FLOAT NOT NULL DEFAULT 0,
    `OGE_FR1` FLOAT NOT NULL DEFAULT 0,
    `OGE_FR2` FLOAT NOT NULL DEFAULT 0,
    `OGE_FR3` FLOAT NOT NULL DEFAULT 0,

    INDEX `FK_tb_notas_contgest_10_12_Aluno`(`Codigo_Aluno`),
    INDEX `FK_tb_notas_contgest_10_12_AnoLectivo`(`Codigo_AnoLectivo`),
    INDEX `FK_tb_notas_contgest_10_12_Turma`(`Codigo_Turma`),
    INDEX `FK_tb_notas_contgest_10_12_Utilizador`(`Codigo_Utilizador`),
    PRIMARY KEY (`Codgigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_notas_enfermagem_10_12` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `INFOR_AC1` FLOAT NOT NULL DEFAULT 0,
    `INFOR_AC2` FLOAT NOT NULL DEFAULT 0,
    `INFOR_AC3` FLOAT NOT NULL DEFAULT 0,
    `INFOR_FR1` FLOAT NOT NULL DEFAULT 0,
    `INFOR_FR2` FLOAT NOT NULL DEFAULT 0,
    `INFOR_FR3` FLOAT NOT NULL DEFAULT 0,
    `INFOR_EXAME` FLOAT NOT NULL DEFAULT 0,
    `INFOR_NER` FLOAT NOT NULL DEFAULT 0,
    `FISICA_AC1` FLOAT NOT NULL DEFAULT 0,
    `FISICA_AC2` FLOAT NOT NULL DEFAULT 0,
    `FISICA_AC3` FLOAT NOT NULL DEFAULT 0,
    `FISICA_FR1` FLOAT NOT NULL DEFAULT 0,
    `FISICA_FR2` FLOAT NOT NULL DEFAULT 0,
    `FISICA_FR3` FLOAT NOT NULL DEFAULT 0,
    `FISICA_EXAME` FLOAT NOT NULL DEFAULT 0,
    `FISICA_NER` FLOAT NOT NULL DEFAULT 0,
    `LP_AC1` FLOAT NOT NULL DEFAULT 0,
    `LP_AC2` FLOAT NOT NULL DEFAULT 0,
    `LP_AC3` FLOAT NOT NULL DEFAULT 0,
    `LP_FR1` FLOAT NOT NULL DEFAULT 0,
    `LP_FR2` FLOAT NOT NULL DEFAULT 0,
    `LP_FR3` FLOAT NOT NULL DEFAULT 0,
    `LP_EXAME` FLOAT NOT NULL DEFAULT 0,
    `LP_NER` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_AC1` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_AC2` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_AC3` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_FR1` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_FR2` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_FR3` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_EXAME` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_NER` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC1` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC2` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC3` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR1` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR2` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR3` FLOAT NOT NULL DEFAULT 0,
    `MAT_EXAME` FLOAT NOT NULL DEFAULT 0,
    `MAT_NER` FLOAT NOT NULL DEFAULT 0,
    `IEC_AC1` FLOAT NOT NULL DEFAULT 0,
    `IEC_AC2` FLOAT NOT NULL DEFAULT 0,
    `IEC_AC3` FLOAT NOT NULL DEFAULT 0,
    `IEC_FR1` FLOAT NOT NULL DEFAULT 0,
    `IEC_FR2` FLOAT NOT NULL DEFAULT 0,
    `IEC_FR3` FLOAT NOT NULL DEFAULT 0,
    `IEC_EXAME` FLOAT NOT NULL DEFAULT 0,
    `IEC_NER` FLOAT NOT NULL DEFAULT 0,
    `FAI_AC1` FLOAT NOT NULL DEFAULT 0,
    `FAI_AC2` FLOAT NOT NULL DEFAULT 0,
    `FAI_AC3` FLOAT NOT NULL DEFAULT 0,
    `FAI_FR1` FLOAT NOT NULL DEFAULT 0,
    `FAI_FR2` FLOAT NOT NULL DEFAULT 0,
    `FAI_FR3` FLOAT NOT NULL DEFAULT 0,
    `FAI_EXAME` FLOAT NOT NULL DEFAULT 0,
    `FAI_NER` FLOAT NOT NULL DEFAULT 0,
    `BIO_AC1` FLOAT NOT NULL DEFAULT 0,
    `BIO_AC2` FLOAT NOT NULL DEFAULT 0,
    `BIO_AC3` FLOAT NOT NULL DEFAULT 0,
    `BIO_FR1` FLOAT NOT NULL DEFAULT 0,
    `BIO_FR2` FLOAT NOT NULL DEFAULT 0,
    `BIO_FR3` FLOAT NOT NULL DEFAULT 0,
    `BIO_EXAME` FLOAT NOT NULL DEFAULT 0,
    `BIO_NER` FLOAT NOT NULL DEFAULT 0,
    `ANAT_AC1` FLOAT NOT NULL DEFAULT 0,
    `ANAT_AC2` FLOAT NOT NULL DEFAULT 0,
    `ANAT_AC3` FLOAT NOT NULL DEFAULT 0,
    `ANAT_FR1` FLOAT NOT NULL DEFAULT 0,
    `ANAT_FR2` FLOAT NOT NULL DEFAULT 0,
    `ANAT_FR3` FLOAT NOT NULL DEFAULT 0,
    `ANAT_EXAME` FLOAT NOT NULL DEFAULT 0,
    `ANAT_NER` FLOAT NOT NULL DEFAULT 0,
    `ETICA_AC1` FLOAT NOT NULL DEFAULT 0,
    `ETICA_AC2` FLOAT NOT NULL DEFAULT 0,
    `ETICA_AC3` FLOAT NOT NULL DEFAULT 0,
    `ETICA_FR1` FLOAT NOT NULL DEFAULT 0,
    `ETICA_FR2` FLOAT NOT NULL DEFAULT 0,
    `ETICA_FR3` FLOAT NOT NULL DEFAULT 0,
    `ETICA_EXAME` FLOAT NOT NULL DEFAULT 0,
    `ETICA_NER` FLOAT NOT NULL DEFAULT 0,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `Codigo_AnoLectivo` INTEGER UNSIGNED NOT NULL,
    `Codigo_Turma` INTEGER UNSIGNED NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,
    `obs` VARCHAR(45) NOT NULL,
    `desempenho` VARCHAR(45) NOT NULL,
    `DataCadastro` DATE NOT NULL,

    INDEX `FK_tb_notas_enfermagem_Aluno`(`Codigo_Aluno`),
    INDEX `FK_tb_notas_enfermagem_AnoLectivo`(`Codigo_AnoLectivo`),
    INDEX `FK_tb_notas_enfermagem_Turma`(`Codigo_Turma`),
    INDEX `FK_tb_notas_enfermagem_Utilizador`(`Codigo_Utilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_notas_fis_bio_10_12` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `L_ESTR_AC1` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_AC2` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_AC3` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_FR1` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_FR2` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_FR3` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_EXAME` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_NER` FLOAT NOT NULL DEFAULT 0,
    `INF_AC1` FLOAT NOT NULL DEFAULT 0,
    `INF_AC2` FLOAT NOT NULL DEFAULT 0,
    `INF_AC3` FLOAT NOT NULL DEFAULT 0,
    `INF_FR1` FLOAT NOT NULL DEFAULT 0,
    `INF_FR2` FLOAT NOT NULL DEFAULT 0,
    `INF_FR3` FLOAT NOT NULL DEFAULT 0,
    `INF_EXAME` FLOAT NOT NULL DEFAULT 0,
    `INF_NER` FLOAT NOT NULL DEFAULT 0,
    `LP_AC1` FLOAT NOT NULL DEFAULT 0,
    `LP_AC2` FLOAT NOT NULL DEFAULT 0,
    `LP_AC3` FLOAT NOT NULL DEFAULT 0,
    `LP_FR1` FLOAT NOT NULL DEFAULT 0,
    `LP_FR2` FLOAT NOT NULL DEFAULT 0,
    `LP_FR3` FLOAT NOT NULL DEFAULT 0,
    `LP_EXAME` FLOAT NOT NULL DEFAULT 0,
    `LP_NER` FLOAT NOT NULL DEFAULT 0,
    `QUIM_AC1` FLOAT NOT NULL DEFAULT 0,
    `QUIM_AC2` FLOAT NOT NULL DEFAULT 0,
    `QUIM_AC3` FLOAT NOT NULL DEFAULT 0,
    `QUIM_FR1` FLOAT NOT NULL DEFAULT 0,
    `QUIM_FR2` FLOAT NOT NULL DEFAULT 0,
    `QUIM_FR3` FLOAT NOT NULL DEFAULT 0,
    `QUIM_EXAME` FLOAT NOT NULL DEFAULT 0,
    `QUIM_NER` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC1` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC2` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC3` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR1` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR2` FLOAT NOT NULL DEFAULT 0,
    `MAT_EXAME` FLOAT NOT NULL DEFAULT 0,
    `MAT_NER` FLOAT NOT NULL DEFAULT 0,
    `BIO_AC1` FLOAT NOT NULL DEFAULT 0,
    `BIO_AC2` FLOAT NOT NULL DEFAULT 0,
    `BIO_AC3` FLOAT NOT NULL DEFAULT 0,
    `BIO_FR1` FLOAT NOT NULL DEFAULT 0,
    `BIO_FR2` FLOAT NOT NULL DEFAULT 0,
    `BIO_FR3` FLOAT NOT NULL DEFAULT 0,
    `BIO_EXAME` FLOAT NOT NULL DEFAULT 0,
    `BIO_NER` FLOAT NOT NULL DEFAULT 0,
    `FIS_AC1` FLOAT NOT NULL DEFAULT 0,
    `FIS_AC2` FLOAT NOT NULL DEFAULT 0,
    `FIS_AC3` FLOAT NOT NULL DEFAULT 0,
    `FIS_FR1` FLOAT NOT NULL DEFAULT 0,
    `FIS_FR2` FLOAT NOT NULL DEFAULT 0,
    `FIS_FR3` FLOAT NOT NULL DEFAULT 0,
    `FIS_EXAME` FLOAT NOT NULL DEFAULT 0,
    `FIS_NER` FLOAT NOT NULL DEFAULT 0,
    `FLS_AC1` FLOAT NOT NULL DEFAULT 0,
    `FLS_AC2` FLOAT NOT NULL DEFAULT 0,
    `FLS_AC3` FLOAT NOT NULL DEFAULT 0,
    `FLS_FR1` FLOAT NOT NULL DEFAULT 0,
    `FLS_FR2` FLOAT NOT NULL DEFAULT 0,
    `FLS_FR3` FLOAT NOT NULL DEFAULT 0,
    `FLS_EXAME` FLOAT NOT NULL DEFAULT 0,
    `FLS_NER` FLOAT NOT NULL DEFAULT 0,
    `PSL_AC1` FLOAT NOT NULL DEFAULT 0,
    `PSL_AC2` FLOAT NOT NULL DEFAULT 0,
    `PSL_AC3` FLOAT NOT NULL DEFAULT 0,
    `PSL_FR1` FLOAT NOT NULL DEFAULT 0,
    `PSL_FR2` FLOAT NOT NULL DEFAULT 0,
    `PSL_FR3` FLOAT NOT NULL DEFAULT 0,
    `PSL_EXAME` FLOAT NOT NULL DEFAULT 0,
    `PSL_NER` FLOAT NOT NULL DEFAULT 0,
    `GEOL_AC1` FLOAT NOT NULL DEFAULT 0,
    `GEOL_AC2` FLOAT NOT NULL DEFAULT 0,
    `GEOL_AC3` FLOAT NOT NULL DEFAULT 0,
    `GEOL_FR1` FLOAT NOT NULL DEFAULT 0,
    `GEOL_FR2` FLOAT NOT NULL DEFAULT 0,
    `GEOL_FR3` FLOAT NOT NULL DEFAULT 0,
    `GEOL_EXAME` FLOAT NOT NULL DEFAULT 0,
    `GEOL_NER` FLOAT NOT NULL DEFAULT 0,
    `GD_AC1` FLOAT NOT NULL DEFAULT 0,
    `GD_AC2` FLOAT NOT NULL DEFAULT 0,
    `GD_AC3` FLOAT NOT NULL DEFAULT 0,
    `GD_FR1` FLOAT NOT NULL DEFAULT 0,
    `GD_FR2` FLOAT NOT NULL DEFAULT 0,
    `GD_FR3` FLOAT NOT NULL DEFAULT 0,
    `GD_EXAME` FLOAT NOT NULL DEFAULT 0,
    `GD_NER` FLOAT NOT NULL DEFAULT 0,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `Codigo_AnoLectivo` INTEGER UNSIGNED NOT NULL,
    `Codigo_Turma` INTEGER UNSIGNED NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,
    `obs` VARCHAR(45) NOT NULL,
    `desempenho` VARCHAR(45) NOT NULL,
    `DataCadastro` DATE NOT NULL,
    `MAT_FR3` FLOAT NOT NULL DEFAULT 0,

    INDEX `FK_tb_notas_fis_bio_10_12_AnoLectivo`(`Codigo_AnoLectivo`),
    INDEX `FK_tb_notas_fis_bio_10_12_Codigo_Aluno`(`Codigo_Aluno`),
    INDEX `FK_tb_notas_fis_bio_10_12_Turma`(`Codigo_Turma`),
    INDEX `FK_tb_notas_fis_bio_10_12_Utilizador`(`Codigo_Utilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_notas_jur_econ_10_12` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `LP_AC1` FLOAT NOT NULL DEFAULT 0,
    `LP_AC2` FLOAT NOT NULL DEFAULT 0,
    `LP_AC3` FLOAT NOT NULL DEFAULT 0,
    `LP_FR1` FLOAT NOT NULL DEFAULT 0,
    `LP_FR2` FLOAT NOT NULL DEFAULT 0,
    `LP_FR3` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_AC1` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_AC2` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_AC3` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_FR1` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_FR2` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_FR3` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC1` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC2` FLOAT NOT NULL DEFAULT 0,
    `MAT_AC3` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR1` FLOAT NOT NULL DEFAULT 0,
    `MAT_EXAME` FLOAT NOT NULL DEFAULT 0,
    `MAT_NER` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_EXAME` FLOAT NOT NULL DEFAULT 0,
    `L_ESTR_NER` FLOAT NOT NULL DEFAULT 0,
    `LP_EXAME` FLOAT NOT NULL DEFAULT 0,
    `LP_NER` FLOAT NOT NULL DEFAULT 0,
    `IN_DIR_AC1` FLOAT NOT NULL DEFAULT 0,
    `IN_DIR_AC2` FLOAT NOT NULL DEFAULT 0,
    `IN_DIR_AC3` FLOAT NOT NULL DEFAULT 0,
    `IN_DIR_FR1` FLOAT NOT NULL DEFAULT 0,
    `IN_DIR_FR2` FLOAT NOT NULL DEFAULT 0,
    `IN_DIR_FR3` FLOAT NOT NULL DEFAULT 0,
    `IN_DIR_EXAME` FLOAT NOT NULL DEFAULT 0,
    `IN_DIR_NER` FLOAT NOT NULL DEFAULT 0,
    `HIST_AC1` FLOAT NOT NULL DEFAULT 0,
    `HIST_AC2` FLOAT NOT NULL DEFAULT 0,
    `HIST_AC3` FLOAT NOT NULL DEFAULT 0,
    `HIST_FR1` FLOAT NOT NULL DEFAULT 0,
    `HIST_FR2` FLOAT NOT NULL DEFAULT 0,
    `HIST_FR3` FLOAT NOT NULL DEFAULT 0,
    `HIST_EXAME` FLOAT NOT NULL DEFAULT 0,
    `HIST_NER` FLOAT NOT NULL DEFAULT 0,
    `GEO_AC1` FLOAT NOT NULL DEFAULT 0,
    `GEO_AC2` FLOAT NOT NULL DEFAULT 0,
    `GEO_AC3` FLOAT NOT NULL DEFAULT 0,
    `GEO_FR1` FLOAT NOT NULL DEFAULT 0,
    `GEO_FR2` FLOAT NOT NULL DEFAULT 0,
    `GEO_FR3` FLOAT NOT NULL DEFAULT 0,
    `GEO_EXAME` FLOAT NOT NULL DEFAULT 0,
    `GEO_NER` FLOAT NOT NULL DEFAULT 0,
    `INT_ECN_AC1` FLOAT NOT NULL DEFAULT 0,
    `INT_ECN_AC2` FLOAT NOT NULL DEFAULT 0,
    `INT_ECN_AC3` FLOAT NOT NULL DEFAULT 0,
    `INT_ECN_FR1` FLOAT NOT NULL DEFAULT 0,
    `INT_ECN_FR2` FLOAT NOT NULL DEFAULT 0,
    `INT_ECN_FR3` FLOAT NOT NULL DEFAULT 0,
    `INFR_AC1` FLOAT NOT NULL DEFAULT 0,
    `INFR_AC2` FLOAT NOT NULL DEFAULT 0,
    `INFR_AC3` FLOAT NOT NULL DEFAULT 0,
    `INFR_FR1` FLOAT NOT NULL DEFAULT 0,
    `INFR_FR2` FLOAT NOT NULL DEFAULT 0,
    `INFR_FR3` FLOAT NOT NULL DEFAULT 0,
    `INFR_EXAME` FLOAT NOT NULL DEFAULT 0,
    `INFR_NER` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_AC1` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_AC2` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_AC3` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_EXAME` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_NER` FLOAT NOT NULL DEFAULT 0,
    `FLS_AC1` FLOAT NOT NULL DEFAULT 0,
    `FLS_AC2` FLOAT NOT NULL DEFAULT 0,
    `FLS_AC3` FLOAT NOT NULL DEFAULT 0,
    `FLS_FR1` FLOAT NOT NULL DEFAULT 0,
    `FLS_FR2` FLOAT NOT NULL DEFAULT 0,
    `FLS_FR3` FLOAT NOT NULL DEFAULT 0,
    `FLS_EXAME` FLOAT NOT NULL DEFAULT 0,
    `FLS_NER` FLOAT NOT NULL DEFAULT 0,
    `ATPL_AC1` FLOAT NOT NULL DEFAULT 0,
    `ATPL_AC2` FLOAT NOT NULL DEFAULT 0,
    `ATPL_AC3` FLOAT NOT NULL DEFAULT 0,
    `ATPL_FR1` FLOAT NOT NULL DEFAULT 0,
    `ATPL_FR2` FLOAT NOT NULL DEFAULT 0,
    `ATPL_FR3` FLOAT NOT NULL DEFAULT 0,
    `ATPL_EXAME` FLOAT NOT NULL DEFAULT 0,
    `ATPL_NER` FLOAT NOT NULL DEFAULT 0,
    `PSC_AC1` FLOAT NOT NULL DEFAULT 0,
    `PSC_AC2` FLOAT NOT NULL DEFAULT 0,
    `PSC_AC3` FLOAT NOT NULL DEFAULT 0,
    `PSC_FR1` FLOAT NOT NULL DEFAULT 0,
    `PSC_FR2` FLOAT NOT NULL DEFAULT 0,
    `PSC_FR3` FLOAT NOT NULL DEFAULT 0,
    `PSC_EXAME` FLOAT NOT NULL DEFAULT 0,
    `PSC_NER` FLOAT NOT NULL DEFAULT 0,
    `SCL_AC1` FLOAT NOT NULL DEFAULT 0,
    `SCL_AC2` FLOAT NOT NULL DEFAULT 0,
    `SCL_AC3` FLOAT NOT NULL DEFAULT 0,
    `SCL_FR1` FLOAT NOT NULL DEFAULT 0,
    `SCL_FR2` FLOAT NOT NULL DEFAULT 0,
    `SCL_FR3` FLOAT NOT NULL DEFAULT 0,
    `SCL_EXAME` FLOAT NOT NULL DEFAULT 0,
    `SCL_NER` FLOAT NOT NULL DEFAULT 0,
    `DES_AC1` FLOAT NOT NULL DEFAULT 0,
    `DES_AC2` FLOAT NOT NULL DEFAULT 0,
    `DES_AC3` FLOAT NOT NULL DEFAULT 0,
    `DES_FR1` FLOAT NOT NULL DEFAULT 0,
    `DES_FR2` FLOAT NOT NULL DEFAULT 0,
    `DES_FR3` FLOAT NOT NULL DEFAULT 0,
    `DES_EXAME` FLOAT NOT NULL DEFAULT 0,
    `DES_NER` FLOAT NOT NULL DEFAULT 0,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `Codigo_AnoLectivo` INTEGER UNSIGNED NOT NULL,
    `Codigo_Turma` INTEGER UNSIGNED NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,
    `obs` VARCHAR(45) NOT NULL,
    `desempenho` VARCHAR(45) NOT NULL,
    `DataCadastro` DATE NOT NULL,
    `MAT_FR3` FLOAT NOT NULL DEFAULT 0,
    `INT_ECN_NER` FLOAT NOT NULL DEFAULT 0,
    `INT_ECN_EXAME` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_FR1` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_FR3` FLOAT NOT NULL DEFAULT 0,
    `MAT_FR2` FLOAT NOT NULL DEFAULT 0,
    `ED_FIS_FR2` FLOAT NOT NULL DEFAULT 0,

    INDEX `FK_tb_notas_jur_econ_10_12_Aluno`(`Codigo_Aluno`),
    INDEX `FK_tb_notas_jur_econ_10_12_AnoLectivo`(`Codigo_AnoLectivo`),
    INDEX `FK_tb_notas_jur_econ_10_12_Turma`(`Codigo_Turma`),
    INDEX `FK_tb_notas_jur_econ_10_12_Utilizador`(`Codigo_Utilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_ocorrencias_alunos` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigoAluno` INTEGER UNSIGNED NOT NULL,
    `codigoTurma` INTEGER UNSIGNED NOT NULL,
    `codigoUtilizador` INTEGER UNSIGNED NOT NULL,
    `ocorrencia` TEXT NOT NULL,
    `codigoAnoLectivo` INTEGER UNSIGNED NOT NULL,
    `trimestre` VARCHAR(45) NOT NULL,
    `dataOcorrencia` DATE NOT NULL,

    INDEX `FK_tb_ocorrencias_alunos_1`(`codigoAluno`),
    INDEX `FK_tb_ocorrencias_alunos_2`(`codigoTurma`),
    INDEX `FK_tb_ocorrencias_alunos_3`(`codigoUtilizador`),
    INDEX `FK_tb_ocorrencias_alunos_4`(`codigoAnoLectivo`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_pauta` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_empresa` INTEGER UNSIGNED NOT NULL,
    `data` DATE NOT NULL,
    `Codigo_utilizador` INTEGER UNSIGNED NOT NULL,
    `Codigo_docente` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_Pauta_1`(`Codigo_empresa`),
    INDEX `FK_tb_Pauta_2`(`Codigo_utilizador`),
    INDEX `FK_tb_pauta_3`(`Codigo_docente`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_pedidos_declaracao` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Confirmacao` INTEGER UNSIGNED NOT NULL,
    `Data_Pedido_Declaracao` DATE NOT NULL,
    `Codigo_Efeito` INTEGER UNSIGNED NOT NULL,
    `Codigo_Tipo_Declaracao` INTEGER UNSIGNED NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_pedidos_declaracao_Confirmacao`(`Codigo_Confirmacao`),
    INDEX `FK_tb_pedidos_declaracao_Efeito_Declaracao`(`Codigo_Efeito`),
    INDEX `FK_tb_pedidos_declaracao_Tipo_Declaracao`(`Codigo_Tipo_Declaracao`),
    INDEX `FK_tb_pedidos_declaracao_Utilizador`(`Codigo_Utilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_pre_confirmacao` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `CodigoMatricula` INTEGER UNSIGNED NOT NULL,
    `CodigoClasse` INTEGER UNSIGNED NOT NULL,
    `CodigoPeriodo` INTEGER UNSIGNED NOT NULL,
    `CodigoAnoLectivo` INTEGER UNSIGNED NOT NULL,
    `CodigoUtilizador` INTEGER UNSIGNED NOT NULL,
    `CodigoStatus` INTEGER UNSIGNED NOT NULL,
    `DataCadastro` DATETIME(0) NOT NULL,

    INDEX `FK_tb_pre_confirmacao_1`(`CodigoMatricula`),
    INDEX `FK_tb_pre_confirmacao_2`(`CodigoClasse`),
    INDEX `FK_tb_pre_confirmacao_3`(`CodigoPeriodo`),
    INDEX `FK_tb_pre_confirmacao_4`(`CodigoAnoLectivo`),
    INDEX `FK_tb_pre_confirmacao_5`(`CodigoUtilizador`),
    INDEX `FK_tb_pre_confirmacao_6`(`CodigoStatus`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_processos_disciplinar` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Descricao` VARCHAR(45) NOT NULL,
    `Codigo_Matricula` INTEGER UNSIGNED NOT NULL,
    `Data_Proc_Disc` DATE NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_processos_disciplinar_Matricula`(`Codigo_Matricula`),
    INDEX `FK_tb_processos_disciplinar_Utilizador`(`Codigo_Utilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_propinas` (
    `Codigo` INTEGER NOT NULL AUTO_INCREMENT,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `Codigo_Tipo_Propina` INTEGER UNSIGNED NOT NULL,
    `Data_Pagamento` DATETIME(0) NULL,
    `Desconto` FLOAT NULL,
    `Multa` FLOAT NULL,
    `Cambio` FLOAT NULL,
    `Total_Pago_USD` FLOAT NULL DEFAULT 0,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,
    `DataVencimento` DATE NOT NULL,
    `obs` VARCHAR(145) NOT NULL,
    `N_Bordoro` VARCHAR(45) NOT NULL,
    `ContaMovimentada` VARCHAR(45) NOT NULL,
    `Total_Pago_AKZ` FLOAT NULL DEFAULT 0,
    `HoraPagamento` TIME(0) NOT NULL,
    `DataBanco` DATE NULL,

    INDEX `FK_tb_propinas_1`(`Codigo_Aluno`),
    INDEX `FK_tb_propinas_2`(`Codigo_Tipo_Propina`),
    INDEX `FK_tb_propinas_3`(`Codigo_Utilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_recibo` (
    `codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `codigo_aluno` INTEGER UNSIGNED NOT NULL,
    `Data` DATE NOT NULL,
    `N_bordero` INTEGER UNSIGNED NOT NULL,
    `multa` VARCHAR(45) NOT NULL,
    `codigo_utilizador` INTEGER UNSIGNED NOT NULL,
    `observacao` VARCHAR(45) NOT NULL,
    `ano` VARCHAR(45) NOT NULL,
    `quantidade` INTEGER UNSIGNED NOT NULL,
    `total_geral` VARCHAR(45) NOT NULL,
    `codigo_formaPagamento` INTEGER UNSIGNED NOT NULL,
    `tipo_documento` VARCHAR(45) NOT NULL DEFAULT 'RECIBO',
    `next` VARCHAR(45) NOT NULL,
    `fatura` VARCHAR(45) NOT NULL,

    INDEX `FK_tb_formaPagamento`(`codigo_formaPagamento`),
    INDEX `FK_tb_recibo_Utilizador`(`codigo_utilizador`),
    INDEX `FK_tb_recibo_aluno`(`codigo_aluno`),
    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_resultados_finais` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Confirmacao` INTEGER UNSIGNED NOT NULL,
    `Codigo_Disciplina` INTEGER UNSIGNED NOT NULL,
    `Media_Final` FLOAT NOT NULL,
    `Codigo_Classificacao_Final` INTEGER UNSIGNED NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_resultados_finais_Classificacao_Final`(`Codigo_Classificacao_Final`),
    INDEX `FK_tb_resultados_finais_Confirmacao`(`Codigo_Confirmacao`),
    INDEX `FK_tb_resultados_finais_Disciplina`(`Codigo_Disciplina`),
    INDEX `FK_tb_resultados_finais_Utilizador`(`Codigo_Utilizador`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_sumarios` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Conteudo` VARCHAR(200) NOT NULL,
    `N_aula` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_tipo_aval` (
    `codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(45) NOT NULL,
    `Designacao` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_tipos_propinas` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NULL,
    `Valor` FLOAT NOT NULL,
    `Codigo_Utilizador` INTEGER UNSIGNED NOT NULL,
    `Moeda` VARCHAR(45) NOT NULL,
    `Codigo_Turma` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_tb_tipos_propinas_1`(`Codigo_Utilizador`),
    INDEX `FK_tb_tipos_propinas_2`(`Codigo_Turma`),
    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_utilizador_docente` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Docente` INTEGER NOT NULL DEFAULT 0,
    `Codigo_Utilizador_Docente` INTEGER NOT NULL DEFAULT 0,
    `Codigo_Utilizador` INTEGER NOT NULL DEFAULT 0,
    `Data` DATE NOT NULL DEFAULT ('1970-01-01'),

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_valor_tipo_nota` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Designacao` VARCHAR(45) NOT NULL,
    `ValorNumerico` FLOAT NOT NULL,
    `Codigo_Tipo_Nota` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`Codigo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
CREATE TABLE `tb_certificados` (
    `Codigo` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Codigo_Aluno` INTEGER UNSIGNED NOT NULL,
    `Codigo_AnoLectivo` INTEGER UNSIGNED NOT NULL,
    `NumeroCertificado` VARCHAR(50) NOT NULL,
    `DataEmissao` DATETIME(3) NOT NULL,
    `DataAssinatura` DATETIME(3) NULL,
    `AssinadoPor` INTEGER UNSIGNED NULL,
    `Status` VARCHAR(20) NOT NULL DEFAULT 'Pendente',
    `Observacoes` TEXT NULL,
    `DataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FK_tb_certificados_aluno_idx`(`Codigo_Aluno`),
    INDEX `FK_tb_certificados_ano_lectivo_idx`(`Codigo_AnoLectivo`),
    INDEX `FK_tb_certificados_assinador_idx`(`AssinadoPor`),
    UNIQUE INDEX `UK_tb_certificados`(`Codigo_Aluno`, `Codigo_AnoLectivo`),
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

-- AddForeignKey
ALTER TABLE `tb_utilizadores` ADD CONSTRAINT `FK_tb_utilizadores_1` FOREIGN KEY (`Codigo_Tipo_Utilizador`) REFERENCES `tb_tipos_utilizador`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_item_permissao_utilizador` ADD CONSTRAINT `FK_tb_item_permissao_utilizador_2` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_permissao_turma_utilizador` ADD CONSTRAINT `FK_permissao_turma_utilizador_Utilizador` FOREIGN KEY (`CodigoUtilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_permissao_turma_utilizador` ADD CONSTRAINT `FK_permissao_turma_utilizador_tuma` FOREIGN KEY (`CodigoTurma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_municipios` ADD CONSTRAINT `FK_Provincias` FOREIGN KEY (`Codigo_Provincia`) REFERENCES `tb_provincias`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_comunas` ADD CONSTRAINT `FK_tb_comunas_Municipio` FOREIGN KEY (`Codigo_Municipio`) REFERENCES `tb_municipios`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_dados_instituicao` ADD CONSTRAINT `FK_tb_dados_instituicao_tb_regime_iva` FOREIGN KEY (`taxaIva`) REFERENCES `tb_regime_iva`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_cursos` ADD CONSTRAINT `FK_tb_cursos_1` FOREIGN KEY (`codigo_Status`) REFERENCES `tb_status`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_classes` ADD CONSTRAINT `FK_tb_classes_1` FOREIGN KEY (`Status`) REFERENCES `tb_status`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_disciplinas` ADD CONSTRAINT `FK_tb_disciplinas_1` FOREIGN KEY (`Codigo_Curso`) REFERENCES `tb_cursos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_disciplinas` ADD CONSTRAINT `FK_tb_disciplinas_2` FOREIGN KEY (`Status`) REFERENCES `tb_status`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_grade_curricular` ADD CONSTRAINT `FK_tb_grade_curricular_1` FOREIGN KEY (`Codigo_disciplina`) REFERENCES `tb_disciplinas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_grade_curricular` ADD CONSTRAINT `FK_tb_grade_curricular_2` FOREIGN KEY (`Codigo_Classe`) REFERENCES `tb_classes`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_grade_curricular` ADD CONSTRAINT `FK_tb_grade_curricular_3` FOREIGN KEY (`Codigo_Curso`) REFERENCES `tb_cursos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_grade_curricular` ADD CONSTRAINT `FK_tb_grade_curricular_4` FOREIGN KEY (`Codigo_user`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_grade_curricular` ADD CONSTRAINT `FK_tb_grade_curricular_5` FOREIGN KEY (`Codigo_empresa`) REFERENCES `tb_dados_instituicao`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_grade_curricular` ADD CONSTRAINT `FK_tb_grade_curricular_6` FOREIGN KEY (`Status`) REFERENCES `tb_status`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_turmas` ADD CONSTRAINT `FK_tb_turmas_AnoLectivo` FOREIGN KEY (`Codigo_AnoLectivo`) REFERENCES `tb_ano_lectivo`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_turmas` ADD CONSTRAINT `FK_tb_turmas_Classe` FOREIGN KEY (`Codigo_Classe`) REFERENCES `tb_classes`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_turmas` ADD CONSTRAINT `FK_tb_turmas_Curso` FOREIGN KEY (`Codigo_Curso`) REFERENCES `tb_cursos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_turmas` ADD CONSTRAINT `FK_tb_turmas_Periodos` FOREIGN KEY (`Codigo_Periodo`) REFERENCES `tb_periodos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_turmas` ADD CONSTRAINT `FK_tb_turmas_Sala` FOREIGN KEY (`Codigo_Sala`) REFERENCES `tb_salas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_docente` ADD CONSTRAINT `FK_tb_docente_1` FOREIGN KEY (`Status`) REFERENCES `tb_status`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_docente` ADD CONSTRAINT `FK_tb_docente_3` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_disciplinas_docente` ADD CONSTRAINT `FK_tb_disciplinas_docente_2` FOREIGN KEY (`CodigoCurso`) REFERENCES `tb_cursos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_disciplinas_docente` ADD CONSTRAINT `FK_tb_disciplinas_docente_3` FOREIGN KEY (`CodigoDisciplina`) REFERENCES `tb_disciplinas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_directores_turmas` ADD CONSTRAINT `FK_tb_directores_turmas_1` FOREIGN KEY (`CodigoAnoLectivo`) REFERENCES `tb_ano_lectivo`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_directores_turmas` ADD CONSTRAINT `FK_tb_directores_turmas_2` FOREIGN KEY (`CodigoTurma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_directores_turmas` ADD CONSTRAINT `FK_tb_directores_turmas_3` FOREIGN KEY (`CodigoDocente`) REFERENCES `tb_docente`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_encarregados` ADD CONSTRAINT `FK_tb_encarregados_2` FOREIGN KEY (`Status`) REFERENCES `tb_status`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_encarregados` ADD CONSTRAINT `FK_tb_encarregados_Profissao` FOREIGN KEY (`Codigo_Profissao`) REFERENCES `tb_profissao`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_proveniencias` ADD CONSTRAINT `FK_tb_proveniencias_1` FOREIGN KEY (`CodigoStatus`) REFERENCES `tb_status`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_alunos` ADD CONSTRAINT `FK_tb_alunos_2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_alunos` ADD CONSTRAINT `FK_tb_alunos_Comuna` FOREIGN KEY (`Codigo_Comuna`) REFERENCES `tb_comunas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_alunos` ADD CONSTRAINT `FK_tb_alunos_Encarregado` FOREIGN KEY (`Codigo_Encarregado`) REFERENCES `tb_encarregados`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_alunos` ADD CONSTRAINT `FK_tb_alunos_Nacionalidade` FOREIGN KEY (`Codigo_Nacionalidade`) REFERENCES `tb_nacionalidades`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_alunos` ADD CONSTRAINT `FK_tb_alunos_Utilizador` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_alunos` ADD CONSTRAINT `proveniencias` FOREIGN KEY (`EscolaProveniencia`) REFERENCES `tb_proveniencias`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_matriculas` ADD CONSTRAINT `FK_tb_matriculas_4` FOREIGN KEY (`codigoStatus`) REFERENCES `tb_status`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_matriculas` ADD CONSTRAINT `FK_tb_matriculas_Aluno` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_matriculas` ADD CONSTRAINT `FK_tb_matriculas_Curso` FOREIGN KEY (`Codigo_Curso`) REFERENCES `tb_cursos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_confirmacoes` ADD CONSTRAINT `FK_tb_confirmacoes_Ano_Lectivo` FOREIGN KEY (`Codigo_Ano_lectivo`) REFERENCES `tb_ano_lectivo`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_confirmacoes` ADD CONSTRAINT `FK_tb_confirmacoes_Matricula` FOREIGN KEY (`Codigo_Matricula`) REFERENCES `tb_matriculas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_confirmacoes` ADD CONSTRAINT `FK_tb_confirmacoes_Turma` FOREIGN KEY (`Codigo_Turma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_confirmacoes` ADD CONSTRAINT `FK_tb_confirmacoes_Utilizador` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_tipo_taxa_iva` ADD CONSTRAINT `FK_tb_tipo_taxa_iva_1` FOREIGN KEY (`Codigo_Isencao`) REFERENCES `tb_motivo_isencao`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_tipo_servicos` ADD CONSTRAINT `FK_tb_tipo_moedas` FOREIGN KEY (`Codigo_Moeda`) REFERENCES `tb_moedas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_tipo_servicos` ADD CONSTRAINT `FK_tb_tipo_servicos_motivos_iva` FOREIGN KEY (`codigoRasao`) REFERENCES `motivos_iva`(`codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_tipo_servicos` ADD CONSTRAINT `FK_tb_tipo_servicos_taxa_iva` FOREIGN KEY (`iva`) REFERENCES `taxa_iva`(`codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_tipo_servicos` ADD CONSTRAINT `FK_tb_tipo_servicos_tb_categoria_servicos` FOREIGN KEY (`Categoria`) REFERENCES `tb_categoria_servicos`(`codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_servicos_turma` ADD CONSTRAINT `FK_tb_servicos_turma_1` FOREIGN KEY (`CodigoClasse`) REFERENCES `tb_classes`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_servicos_turma` ADD CONSTRAINT `FK_tb_servicos_turma_2` FOREIGN KEY (`CodigoTurma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_servicos_turma` ADD CONSTRAINT `FK_tb_servicos_turma_3` FOREIGN KEY (`CodigoServico`) REFERENCES `tb_tipo_servicos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_servico_aluno` ADD CONSTRAINT `FK_tb_servico_aluno_3` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_servico_aluno` ADD CONSTRAINT `FK_tb_servico_aluno_4` FOREIGN KEY (`Codigo_Turma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_servico_aluno` ADD CONSTRAINT `FK_tb_servico_classe_1` FOREIGN KEY (`Codigo_Servico`) REFERENCES `tb_tipo_servicos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_servico_aluno` ADD CONSTRAINT `FK_tb_servico_classe_3` FOREIGN KEY (`status`) REFERENCES `tb_status`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_propina_classe` ADD CONSTRAINT `FK_tb_propina_classe_1` FOREIGN KEY (`CodigoClasse`) REFERENCES `tb_classes`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_propina_classe` ADD CONSTRAINT `FK_tb_propina_classe_2` FOREIGN KEY (`CodigoTipoServico`) REFERENCES `tb_tipo_servicos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_propina_classe` ADD CONSTRAINT `FK_tb_propina_classe_3` FOREIGN KEY (`CodigoUtilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_limite_pagamento_propina` ADD CONSTRAINT `FK_tb_limite_pagamento_propina_1` FOREIGN KEY (`Codigo`) REFERENCES `tb_classes`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pagamentoi` ADD CONSTRAINT `FK_tb_pagamentoI_1` FOREIGN KEY (`Status`) REFERENCES `tb_status`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pagamentos` ADD CONSTRAINT `FK_tb_pagamentos_4` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pagamentos` ADD CONSTRAINT `FK_tb_pagamentos_CodigoPagamento` FOREIGN KEY (`CodigoPagamento`) REFERENCES `tb_pagamentoi`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pagamentos` ADD CONSTRAINT `FK_tb_pagamentos_Codigo_FormaPagamento` FOREIGN KEY (`Codigo_FormaPagamento`) REFERENCES `tb_forma_pagamento`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pagamentos` ADD CONSTRAINT `FK_tb_pagamentos_Tipo_Servicos` FOREIGN KEY (`Codigo_Tipo_Servico`) REFERENCES `tb_tipo_servicos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pagamentos` ADD CONSTRAINT `FK_tb_pagamentos_Utilizadore` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_nota_credito` ADD CONSTRAINT `FK_tb_nota_credito_1` FOREIGN KEY (`codigo_aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_nota_credito` ADD CONSTRAINT `FK_tb_nota_credito_tb_pagamentoi` FOREIGN KEY (`CodigoPagamentoi`) REFERENCES `tb_pagamentoi`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_status` ADD CONSTRAINT `FK_tb_status_1` FOREIGN KEY (`tipoStatus`) REFERENCES `tb_tipo_status`(`codigo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materias` ADD CONSTRAINT `FK_materias_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_acessos_sistema` ADD CONSTRAINT `FK_tb_acessos_sistema_1` FOREIGN KEY (`CodigoUtilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_anulacoes` ADD CONSTRAINT `FK_tb_anulacoes_Confirmacao` FOREIGN KEY (`Codigo_Confirmacao`) REFERENCES `tb_confirmacoes`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_anulacoes` ADD CONSTRAINT `FK_tb_anulacoes_Motivos` FOREIGN KEY (`Codigo_Motivo_Anulacao`) REFERENCES `tb_motivos_anulacao`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_anulacoes` ADD CONSTRAINT `FK_tb_anulacoes_Utilizador` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_avaliacao_classe` ADD CONSTRAINT `FK_tb_avaliacao_classe_1` FOREIGN KEY (`CodigoCalsse`) REFERENCES `tb_classes`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_avaliacao_classe` ADD CONSTRAINT `FK_tb_avaliacao_classe_2` FOREIGN KEY (`CodigoAvaliacao`) REFERENCES `tb_tipo_avaliacao`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_classe_disiciplina_terminal` ADD CONSTRAINT `FK_tb_classe_trminal_ClasseFim` FOREIGN KEY (`CodigoClasseFim`) REFERENCES `tb_classes`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_classe_disiciplina_terminal` ADD CONSTRAINT `FK_tb_classe_trminal_ClasseInicio` FOREIGN KEY (`CodigoClasseInicio`) REFERENCES `tb_classes`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_classe_disiciplina_terminal` ADD CONSTRAINT `FK_tb_classe_trminal_Curso` FOREIGN KEY (`CodigoCurso`) REFERENCES `tb_cursos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_classe_disiciplina_terminal` ADD CONSTRAINT `FK_tb_classe_trminal_Disciplina` FOREIGN KEY (`CodigoDisciplina`) REFERENCES `tb_disciplinas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_comportamento` ADD CONSTRAINT `FK_tb_comportamento_CodigoAluno` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_condicao_aprovacao` ADD CONSTRAINT `FK_tb_condicao_aprovacao_1` FOREIGN KEY (`CodigoCurso`) REFERENCES `tb_cursos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_condicao_aprovacao` ADD CONSTRAINT `FK_tb_condicao_aprovacao_2` FOREIGN KEY (`CodigoClasse`) REFERENCES `tb_classes`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_condicao_aprovacao` ADD CONSTRAINT `FK_tb_condicao_aprovacao_3` FOREIGN KEY (`CodigoDisciplina`) REFERENCES `tb_disciplinas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_conta_aluno` ADD CONSTRAINT `FK_tb_conta_aluno_1` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_declaracao_notas` ADD CONSTRAINT `FK_tb_declaracao_notas_Efeito` FOREIGN KEY (`Codigo_Efeito`) REFERENCES `tb_efeitos_declaracao`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_declaracao_notas` ADD CONSTRAINT `FK_tb_declaracao_notas_Matricula` FOREIGN KEY (`Codigo_Matricula`) REFERENCES `tb_matriculas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_declaracao_notas` ADD CONSTRAINT `FK_tb_declaracao_notas_Utilizador` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_tipos_utilizador`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_declaracao_sem_nota` ADD CONSTRAINT `FK_tb_declaracao_sem_nota_Efeito` FOREIGN KEY (`Codigo_Efeito`) REFERENCES `tb_efeitos_declaracao`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_declaracao_sem_nota` ADD CONSTRAINT `FK_tb_declaracao_sem_nota_Matricula` FOREIGN KEY (`Codigo_Matricula`) REFERENCES `tb_matriculas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_declaracao_sem_nota` ADD CONSTRAINT `FK_tb_declaracao_sem_nota_Utilizador` FOREIGN KEY (`Codigo_Utilizadores`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_deposito_valor` ADD CONSTRAINT `FK_tb_deposito_valor_1` FOREIGN KEY (`Codigo_moeda`) REFERENCES `tb_moedas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_deposito_valor` ADD CONSTRAINT `FK_tb_deposito_valor_2` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_entrada_valores` ADD CONSTRAINT `FK_tb_entrada_valores_1` FOREIGN KEY (`CodigoAluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_entrada_valores` ADD CONSTRAINT `FK_tb_entrada_valores_2` FOREIGN KEY (`CodigoUtilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_entrega_declarcoes` ADD CONSTRAINT `FK_tb_entrega_declarcoes_Pedido_Declaracao` FOREIGN KEY (`Codigo_Pedido_Declaracao`) REFERENCES `tb_pedidos_declaracao`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_entrega_declarcoes` ADD CONSTRAINT `FK_tb_entrega_declarcoes_Utilizador` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_faltas` ADD CONSTRAINT `FK_tb_faltas_Disciplina` FOREIGN KEY (`Codigo_Disciplina`) REFERENCES `tb_disciplinas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_faltas` ADD CONSTRAINT `FK_tb_faltas_Matricula` FOREIGN KEY (`Codigo_Matricula`) REFERENCES `tb_matriculas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_faltas` ADD CONSTRAINT `FK_tb_faltas_Utilizadores` FOREIGN KEY (`Codigo_Utilizadores`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_formula_media` ADD CONSTRAINT `FK_tb_formula_media_1` FOREIGN KEY (`tipo_pauta`) REFERENCES `tb_tipo_pauta`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_formula_media` ADD CONSTRAINT `FK_tb_formula_media_2` FOREIGN KEY (`Codigo_Curso`) REFERENCES `tb_cursos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_foto` ADD CONSTRAINT `FK_tb_foto_1` FOREIGN KEY (`codigoAluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_historico_aluno` ADD CONSTRAINT `FK_tb_historico_aluno_1` FOREIGN KEY (`Codigo_Classificacao`) REFERENCES `tb_classificacao`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_logs` ADD CONSTRAINT `FK_tb_logs_1` FOREIGN KEY (`CodigoUtilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_merito` ADD CONSTRAINT `FK_tb_merito_Matricula` FOREIGN KEY (`Codigo_Matricula`) REFERENCES `tb_matriculas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_merito` ADD CONSTRAINT `FK_tb_merito_Utilizador` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_multas` ADD CONSTRAINT `FK_tb_multas_1` FOREIGN KEY (`Codigo_Tipo_Multa`) REFERENCES `tb_tipo_multa`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas` ADD CONSTRAINT `FK_tb_notas_1` FOREIGN KEY (`CodigoAluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas` ADD CONSTRAINT `FK_tb_notas_2` FOREIGN KEY (`CodigoDisciplina`) REFERENCES `tb_disciplinas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas` ADD CONSTRAINT `FK_tb_notas_3` FOREIGN KEY (`CodigoAnoLectivo`) REFERENCES `tb_ano_lectivo`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas` ADD CONSTRAINT `FK_tb_notas_4` FOREIGN KEY (`CodigoTipoAvaliacao`) REFERENCES `tb_tipo_avaliacao`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas` ADD CONSTRAINT `FK_tb_notas_5` FOREIGN KEY (`CodigoUtilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas` ADD CONSTRAINT `FK_tb_notas_6` FOREIGN KEY (`Codigo_Turma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_1_4` ADD CONSTRAINT `FK_tb_notas_1_4_Aluno` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_1_4` ADD CONSTRAINT `FK_tb_notas_1_4_Ano_Lectivo` FOREIGN KEY (`Codigo_Ano_Lectivo`) REFERENCES `tb_ano_lectivo`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_1_4` ADD CONSTRAINT `FK_tb_notas_1_4_Turma` FOREIGN KEY (`Codigo_Turma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_1_4` ADD CONSTRAINT `FK_tb_notas_1_4_User` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_5_6` ADD CONSTRAINT `FK_tb_notas_5_6_1` FOREIGN KEY (`CodigoAluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_5_6` ADD CONSTRAINT `FK_tb_notas_5_6_2` FOREIGN KEY (`CodigoTurma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_5_6` ADD CONSTRAINT `FK_tb_notas_5_6_3` FOREIGN KEY (`CodigoUtilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_5_6` ADD CONSTRAINT `FK_tb_notas_5_6_4` FOREIGN KEY (`CodigoAnoLectivo`) REFERENCES `tb_ano_lectivo`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_7_9` ADD CONSTRAINT `FK_tb_notas_7_9_Aluno` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_7_9` ADD CONSTRAINT `FK_tb_notas_7_9_AnoLectivo` FOREIGN KEY (`Codigo_AnoLectivo`) REFERENCES `tb_ano_lectivo`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_7_9` ADD CONSTRAINT `FK_tb_notas_7_9_Turma` FOREIGN KEY (`Codigo_Turma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_7_9` ADD CONSTRAINT `FK_tb_notas_7_9_User` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_alunos` ADD CONSTRAINT `FK_tb_notas_alunos_1` FOREIGN KEY (`CodigoAluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_alunos` ADD CONSTRAINT `FK_tb_notas_alunos_2` FOREIGN KEY (`CodigoDisciplina`) REFERENCES `tb_disciplinas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_alunos` ADD CONSTRAINT `FK_tb_notas_alunos_3` FOREIGN KEY (`CodigoAnoLectivo`) REFERENCES `tb_ano_lectivo`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_alunos` ADD CONSTRAINT `FK_tb_notas_alunos_4` FOREIGN KEY (`CodigoTipoAvaliacao`) REFERENCES `tb_tipo_avaliacao`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_alunos` ADD CONSTRAINT `FK_tb_notas_alunos_5` FOREIGN KEY (`CodigoUtilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_alunos` ADD CONSTRAINT `FK_tb_notas_alunos_6` FOREIGN KEY (`CodigoTrimestre`) REFERENCES `tb_trimestres`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_alunos` ADD CONSTRAINT `FK_tb_notas_alunos_turma` FOREIGN KEY (`CodigoTurma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_contgest_10_12` ADD CONSTRAINT `FK_tb_notas_contgest_10_12_Aluno` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_contgest_10_12` ADD CONSTRAINT `FK_tb_notas_contgest_10_12_AnoLectivo` FOREIGN KEY (`Codigo_AnoLectivo`) REFERENCES `tb_ano_lectivo`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_contgest_10_12` ADD CONSTRAINT `FK_tb_notas_contgest_10_12_Turma` FOREIGN KEY (`Codigo_Turma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_contgest_10_12` ADD CONSTRAINT `FK_tb_notas_contgest_10_12_Utilizador` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_enfermagem_10_12` ADD CONSTRAINT `FK_tb_notas_enfermagem_Aluno` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_enfermagem_10_12` ADD CONSTRAINT `FK_tb_notas_enfermagem_AnoLectivo` FOREIGN KEY (`Codigo_AnoLectivo`) REFERENCES `tb_ano_lectivo`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_enfermagem_10_12` ADD CONSTRAINT `FK_tb_notas_enfermagem_Turma` FOREIGN KEY (`Codigo_Turma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_enfermagem_10_12` ADD CONSTRAINT `FK_tb_notas_enfermagem_Utilizador` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_fis_bio_10_12` ADD CONSTRAINT `FK_tb_notas_fis_bio_10_12_AnoLectivo` FOREIGN KEY (`Codigo_AnoLectivo`) REFERENCES `tb_ano_lectivo`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_fis_bio_10_12` ADD CONSTRAINT `FK_tb_notas_fis_bio_10_12_Codigo_Aluno` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_fis_bio_10_12` ADD CONSTRAINT `FK_tb_notas_fis_bio_10_12_Turma` FOREIGN KEY (`Codigo_Turma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_fis_bio_10_12` ADD CONSTRAINT `FK_tb_notas_fis_bio_10_12_Utilizador` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_jur_econ_10_12` ADD CONSTRAINT `FK_tb_notas_jur_econ_10_12_Aluno` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_jur_econ_10_12` ADD CONSTRAINT `FK_tb_notas_jur_econ_10_12_AnoLectivo` FOREIGN KEY (`Codigo_AnoLectivo`) REFERENCES `tb_ano_lectivo`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_jur_econ_10_12` ADD CONSTRAINT `FK_tb_notas_jur_econ_10_12_Turma` FOREIGN KEY (`Codigo_Turma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_notas_jur_econ_10_12` ADD CONSTRAINT `FK_tb_notas_jur_econ_10_12_Utilizador` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_ocorrencias_alunos` ADD CONSTRAINT `FK_tb_ocorrencias_alunos_1` FOREIGN KEY (`codigoAluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_ocorrencias_alunos` ADD CONSTRAINT `FK_tb_ocorrencias_alunos_2` FOREIGN KEY (`codigoTurma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_ocorrencias_alunos` ADD CONSTRAINT `FK_tb_ocorrencias_alunos_3` FOREIGN KEY (`codigoUtilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_ocorrencias_alunos` ADD CONSTRAINT `FK_tb_ocorrencias_alunos_4` FOREIGN KEY (`codigoAnoLectivo`) REFERENCES `tb_ano_lectivo`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pauta` ADD CONSTRAINT `FK_tb_Pauta_1` FOREIGN KEY (`Codigo_empresa`) REFERENCES `tb_dados_instituicao`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pauta` ADD CONSTRAINT `FK_tb_Pauta_2` FOREIGN KEY (`Codigo_utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pauta` ADD CONSTRAINT `FK_tb_pauta_3` FOREIGN KEY (`Codigo_docente`) REFERENCES `tb_docente`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pedidos_declaracao` ADD CONSTRAINT `FK_tb_pedidos_declaracao_Confirmacao` FOREIGN KEY (`Codigo_Confirmacao`) REFERENCES `tb_confirmacoes`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pedidos_declaracao` ADD CONSTRAINT `FK_tb_pedidos_declaracao_Efeito_Declaracao` FOREIGN KEY (`Codigo_Efeito`) REFERENCES `tb_efeitos_declaracao`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pedidos_declaracao` ADD CONSTRAINT `FK_tb_pedidos_declaracao_Tipo_Declaracao` FOREIGN KEY (`Codigo_Tipo_Declaracao`) REFERENCES `tb_tipo_declaracao`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pedidos_declaracao` ADD CONSTRAINT `FK_tb_pedidos_declaracao_Utilizador` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pre_confirmacao` ADD CONSTRAINT `FK_tb_pre_confirmacao_1` FOREIGN KEY (`CodigoMatricula`) REFERENCES `tb_matriculas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pre_confirmacao` ADD CONSTRAINT `FK_tb_pre_confirmacao_2` FOREIGN KEY (`CodigoClasse`) REFERENCES `tb_classes`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pre_confirmacao` ADD CONSTRAINT `FK_tb_pre_confirmacao_3` FOREIGN KEY (`CodigoPeriodo`) REFERENCES `tb_periodos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pre_confirmacao` ADD CONSTRAINT `FK_tb_pre_confirmacao_4` FOREIGN KEY (`CodigoAnoLectivo`) REFERENCES `tb_ano_lectivo`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pre_confirmacao` ADD CONSTRAINT `FK_tb_pre_confirmacao_5` FOREIGN KEY (`CodigoUtilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_pre_confirmacao` ADD CONSTRAINT `FK_tb_pre_confirmacao_6` FOREIGN KEY (`CodigoStatus`) REFERENCES `tb_status`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_processos_disciplinar` ADD CONSTRAINT `FK_tb_processos_disciplinar_Matricula` FOREIGN KEY (`Codigo_Matricula`) REFERENCES `tb_matriculas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_processos_disciplinar` ADD CONSTRAINT `FK_tb_processos_disciplinar_Utilizador` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_propinas` ADD CONSTRAINT `FK_tb_propinas_1` FOREIGN KEY (`Codigo_Aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_propinas` ADD CONSTRAINT `FK_tb_propinas_2` FOREIGN KEY (`Codigo_Tipo_Propina`) REFERENCES `tb_tipos_propinas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_propinas` ADD CONSTRAINT `FK_tb_propinas_3` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_recibo` ADD CONSTRAINT `FK_tb_formaPagamento` FOREIGN KEY (`codigo_formaPagamento`) REFERENCES `tb_forma_pagamento`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_recibo` ADD CONSTRAINT `FK_tb_recibo_Utilizador` FOREIGN KEY (`codigo_utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_recibo` ADD CONSTRAINT `FK_tb_recibo_aluno` FOREIGN KEY (`codigo_aluno`) REFERENCES `tb_alunos`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_resultados_finais` ADD CONSTRAINT `FK_tb_resultados_finais_Classificacao_Final` FOREIGN KEY (`Codigo_Classificacao_Final`) REFERENCES `tb_classificacao_final`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_resultados_finais` ADD CONSTRAINT `FK_tb_resultados_finais_Confirmacao` FOREIGN KEY (`Codigo_Confirmacao`) REFERENCES `tb_confirmacoes`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_resultados_finais` ADD CONSTRAINT `FK_tb_resultados_finais_Disciplina` FOREIGN KEY (`Codigo_Disciplina`) REFERENCES `tb_disciplinas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_resultados_finais` ADD CONSTRAINT `FK_tb_resultados_finais_Utilizador` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_tipos_propinas` ADD CONSTRAINT `FK_tb_tipos_propinas_1` FOREIGN KEY (`Codigo_Utilizador`) REFERENCES `tb_utilizadores`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tb_tipos_propinas` ADD CONSTRAINT `FK_tb_tipos_propinas_2` FOREIGN KEY (`Codigo_Turma`) REFERENCES `tb_turmas`(`Codigo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

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
