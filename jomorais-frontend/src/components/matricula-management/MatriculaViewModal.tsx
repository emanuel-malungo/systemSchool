import { X, Edit2, User, Calendar, GraduationCap, FileText, CheckCircle, Phone, Mail, Users } from 'lucide-react'
import { useMatricula } from '../../hooks/useMatricula'
import type { IMatricula } from '../../types/matricula.types'

interface MatriculaViewModalProps {
	isOpen: boolean
	onClose: () => void
	matricula: IMatricula | null
	onEdit: () => void
}

export default function MatriculaViewModal({
	isOpen,
	onClose,
	matricula,
	onEdit,
}: MatriculaViewModalProps) {
	// Busca dados completos da matrícula
	const { data: matriculaData, isLoading } = useMatricula(matricula?.codigo || 0, isOpen && !!matricula)

	// Usa os dados completos se disponíveis, senão usa os dados básicos
	const fullMatricula = matriculaData?.data || matricula

	if (!isOpen || !matricula) return null

	if (isLoading) {
		return (
			<div className="fixed inset-0 z-50 overflow-y-auto">
				<div className="flex min-h-screen items-center justify-center p-4">
					<div className="fixed inset-0 bg-black/20 transition-opacity" onClick={onClose} />
					<div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
						<div className="flex items-center justify-center h-64">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C00]"></div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!fullMatricula) return null

	const formatDate = (date: string) => {
		try {
			return new Date(date).toLocaleDateString('pt-BR', {
				day: '2-digit',
				month: 'long',
				year: 'numeric',
			})
		} catch {
			return 'Data inválida'
		}
	}

	const getStatusText = (status: number) => {
		return status === 1 ? 'Ativa' : 'Inativa'
	}

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="fixed inset-0 bg-black/20 transition-opacity" onClick={onClose} />

				<div className="relative bg-white rounded-3xl border border-gray-100 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
					{/* Header fixo */}
					<div className="flex items-center justify-between p-8 border-b border-gray-100 shrink-0">
						<h2 className="text-xl font-black text-[#1e293b]">Detalhes da Matrícula</h2>
						<button
							onClick={onClose}
							className="p-2 bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					{/* Conteúdo com scroll */}
					<div className="flex-1 overflow-y-auto p-8">
						<div className="space-y-8">
							{/* Cabeçalho da Matrícula */}
							<div className="flex items-center gap-6 p-6 bg-gray-50/50 rounded-3xl border border-gray-100 transition-all duration-300 hover:bg-white hover:shadow-xl group">
								<div className="h-20 w-20 rounded-2xl bg-[#3964d7] flex items-center justify-center text-white text-3xl font-black shadow-[0_8px_16px_-4px_rgba(57,100,215,0.4)] transition-transform group-hover:scale-105">
									{fullMatricula.tb_alunos.nome.charAt(0).toUpperCase()}
								</div>
								<div className="flex-1">
									<h3 className="text-2xl font-black text-[#1e293b] leading-tight">{fullMatricula.tb_alunos.nome}</h3>
									<div className="flex items-center gap-3 mt-2">
										<span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 text-[10px] font-black text-[#1e293b] uppercase tracking-wider">
											Matrícula: #{fullMatricula.codigo}
										</span>
										<div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${fullMatricula.codigoStatus === 1
											? 'bg-emerald-50 text-emerald-600'
											: 'bg-rose-50 text-rose-600'
											}`}>
											<div className={`w-1.5 h-1.5 rounded-full animate-pulse ${fullMatricula.codigoStatus === 1 ? 'bg-emerald-500' : 'bg-rose-500'
												}`}></div>
											{getStatusText(fullMatricula.codigoStatus)}
										</div>
									</div>
								</div>
							</div>

							{/* Informações da Matrícula */}
							<div className="grid grid-cols-2 gap-6">
								<div className="flex items-start gap-4">
									<div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
										<Calendar className="h-6 w-6 text-emerald-600" />
									</div>
									<div>
										<p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Data de Matrícula</p>
										<p className="text-base font-bold text-[#1e293b]">
											{formatDate(fullMatricula.data_Matricula)}
										</p>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
										<GraduationCap className="h-6 w-6 text-[#3964d7]" />
									</div>
									<div>
										<p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Curso</p>
										<p className="text-base font-bold text-[#1e293b]">
											{fullMatricula.tb_cursos.designacao}
										</p>
									</div>
								</div>
							</div>

							{/* Informações Pessoais do Aluno */}
							<div className="border-t border-gray-100 pt-8">
								<h4 className="text-xs font-black text-[#1e293b] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
									<User className="h-4 w-4 text-[#3964d7]" />
									Dados Pessoais do Aluno
								</h4>
								<div className="grid grid-cols-2 gap-6">
									<div className="flex items-start gap-4">
										<div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
											<User className="h-5 w-5 text-gray-400" />
										</div>
										<div>
											<p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Sexo</p>
											<p className="text-sm font-bold text-[#1e293b]">
												{fullMatricula.tb_alunos.sexo}
											</p>
										</div>
									</div>

									<div className="flex items-start gap-4">
										<div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
											<Calendar className="h-5 w-5 text-gray-400" />
										</div>
										<div>
											<p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Data de Nascimento</p>
											<p className="text-sm font-bold text-[#1e293b]">
												{fullMatricula.tb_alunos.dataNascimento ? formatDate(fullMatricula.tb_alunos.dataNascimento) : 'N/A'}
											</p>
										</div>
									</div>

									<div className="flex items-start gap-4">
										<div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
											<Phone className="h-5 w-5 text-gray-400" />
										</div>
										<div>
											<p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Telefone</p>
											<p className="text-sm font-bold text-[#1e293b]">
												{fullMatricula.tb_alunos.telefone && fullMatricula.tb_alunos.telefone.trim() !== '' ? fullMatricula.tb_alunos.telefone : 'N/A'}
											</p>
										</div>
									</div>

									<div className="flex items-start gap-4">
										<div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
											<Mail className="h-5 w-5 text-gray-400" />
										</div>
										<div>
											<p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Email</p>
											<p className="text-sm font-bold text-[#1e293b]">
												{fullMatricula.tb_alunos.email && fullMatricula.tb_alunos.email.trim() !== '' ? fullMatricula.tb_alunos.email : 'N/A'}
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Filiação */}
							{(fullMatricula.tb_alunos.pai || fullMatricula.tb_alunos.mae) && (
								<div className="border-t border-gray-100 pt-8">
									<h4 className="text-xs font-black text-[#1e293b] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
										<Users className="h-4 w-4 text-[#3964d7]" />
										Filiação
									</h4>
									<div className="grid grid-cols-2 gap-6">
										<div className="flex items-start gap-4">
											<div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
												<User className="h-5 w-5 text-gray-400" />
											</div>
											<div>
												<p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Nome do Pai</p>
												<p className="text-sm font-bold text-[#1e293b]">
													{fullMatricula.tb_alunos.pai || 'N/A'}
												</p>
											</div>
										</div>

										<div className="flex items-start gap-4">
											<div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
												<User className="h-5 w-5 text-gray-400" />
											</div>
											<div>
												<p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Nome da Mãe</p>
												<p className="text-sm font-bold text-[#1e293b]">
													{fullMatricula.tb_alunos.mae || 'N/A'}
												</p>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Matrícula Detalhes */}
							<div className="border-t border-gray-100 pt-8">
								<h4 className="text-xs font-black text-[#1e293b] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
									<FileText className="h-4 w-4 text-[#3964d7]" />
									Registro do Sistema
								</h4>
								<div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
									<div className="grid grid-cols-2 gap-6">
										<div>
											<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Matriculado por</p>
											<p className="text-sm font-bold text-[#1e293b]">
												{fullMatricula.tb_utilizadores.nome}
											</p>
											<p className="text-[11px] text-gray-400">@{fullMatricula.tb_utilizadores.user}</p>
										</div>
										{fullMatricula.tb_confirmacoes && fullMatricula.tb_confirmacoes.length > 0 && (
											<div>
												<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Atividade</p>
												<p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
													<CheckCircle className="h-4 w-4" />
													{fullMatricula.tb_confirmacoes.length} confirmação(ões)
												</p>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Cronologia de Confirmações */}
							{fullMatricula.tb_confirmacoes && fullMatricula.tb_confirmacoes.length > 0 && (
								<div className="space-y-4">
									{fullMatricula.tb_confirmacoes.map((confirmacao) => (
										<div key={confirmacao.codigo} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
											<div className="grid grid-cols-2 gap-4">
												<div className="flex items-center gap-3">
													<div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
														<CheckCircle className="h-4 w-4 text-emerald-600" />
													</div>
													<div>
														<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Turma/Classe</p>
														<p className="text-xs font-bold text-[#1e293b]">
															{confirmacao.tb_turmas.designacao} • {confirmacao.tb_turmas.tb_classes.designacao}
														</p>
													</div>
												</div>
												<div className="text-right">
													<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</p>
													<p className="text-xs font-bold text-[#1e293b]">
														{confirmacao.data_Confirmacao ? formatDate(confirmacao.data_Confirmacao) : 'N/A'}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Footer com Ações */}
					<div className="flex gap-4 p-8 border-t border-gray-100 shrink-0">
						<button
							onClick={onClose}
							className="flex-1 px-6 py-3.5 border border-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all"
						>
							Fechar
						</button>
						<button
							onClick={onEdit}
							className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#3964d7] text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-[#2d52b2] transition-all shadow-[0_8px_20px_-6px_rgba(57,100,215,0.4)] active:scale-95"
						>
							<Edit2 className="h-4 w-4" />
							Editar Matrícula
						</button>
					</div>
				</div>
			</div>
		</div>
	)

}
