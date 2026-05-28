-- AddColumn CodigoTurma to tb_notas_alunos
ALTER TABLE `tb_notas_alunos` 
ADD COLUMN `CodigoTurma` INT UNSIGNED;

-- AddForeignKey FK_tb_notas_alunos_turma
ALTER TABLE `tb_notas_alunos`
ADD INDEX `FK_tb_notas_alunos_turma` (`CodigoTurma`),
ADD CONSTRAINT `FK_tb_notas_alunos_turma` FOREIGN KEY (`CodigoTurma`) REFERENCES `tb_turmas` (`codigo`) ON DELETE NO ACTION ON UPDATE NO ACTION;
