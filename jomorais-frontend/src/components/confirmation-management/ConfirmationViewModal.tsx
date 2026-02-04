import { X, Edit2, User, Calendar, GraduationCap, FileText, CheckCircle, Building } from 'lucide-react'
import { useConfirmation } from '../../hooks/useConfirmation'
import type { IConfirmation } from '../../types/confirmation.types'

interface ConfirmationViewModalProps {
	isOpen: boolean
	onClose: () => void
	confirmation: IConfirmation | null
	onEdit?: () => void  // Opcional - apenas para administradores
}

export default function ConfirmationViewModal({
	isOpen,
	onClose,
	confirmation,
	onEdit,
}: ConfirmationViewModalProps) {
	// Busca dados completos da confirmação
	const { data: confirmationData, isLoading } = useConfirmation(
		confirmation?.codigo || 0,
		isOpen && !!confirmation
	)

	// Usa os dados completos se disponíveis, senão usa os dados básicos
	const fullConfirmation = confirmationData?.data || confirmation

	if (!isOpen || !confirmation) return null

	if (isLoading) {
		return (
			<div className="fixed inset-0 z-50 overflow-y-auto">
				<div className="flex min-h-screen items-center justify-center p-4">
					<div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
					<div className="relative bg-white rounded-4xl shadow-2xl max-w-lg w-full p-12 overflow-hidden border border-white/20">
						<div className="flex flex-col items-center justify-center">
							<div className="relative w-16 h-16">
								<div className="absolute inset-0 border-4 border-[#3964d7]/10 rounded-full"></div>
								<div className="absolute inset-0 border-4 border-[#3964d7] border-t-transparent rounded-full animate-spin"></div>
							</div>
							<p className="mt-6 text-sm font-bold text-[#1e293b] animate-pulse uppercase tracking-[0.2em]">Resgatando Detalhes...</p>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!fullConfirmation) return null

	const formatDate = (date: string | null) => {
		if (!date) return 'N/A'
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

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

				<div className="relative bg-[#f8fafc] rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-white/20 slide-in-bottom">
					{/* Header */}
					<div className="flex items-center justify-between p-8 bg-white border-b border-gray-100 shrink-0">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-2xl bg-[#3964d7]/10 flex items-center justify-center">
								<FileText className="h-6 w-6 text-[#3964d7]" />
							</div>
							<div>
								<h2 className="text-xl font-black text-[#1e293b]">Recibo de Confirmação</h2>
								<p className="text-[10px] font-black text-[#3964d7] uppercase tracking-widest mt-0.5">Identificador único • #{fullConfirmation.codigo}</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="p-3 bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all duration-300"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					{/* Conteúdo */}
					<div className="flex-1 overflow-y-auto p-8 lg:p-10">
						<div className="space-y-8">
							{/* Perfil do Aluno */}
							<div className="bg-white rounded-4xl border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
								<div className="relative">
									<div className="w-24 h-24 rounded-3xl bg-linear-to-br from-[#3964d7] to-[#2d52b2] flex items-center justify-center text-white text-4xl font-black shadow-xl">
										{fullConfirmation.tb_matriculas?.tb_alunos?.nome?.charAt(0).toUpperCase() || 'A'}
									</div>
									<div className={`absolute -bottom-2 -right-2 p-2 rounded-xl border-4 border-white shadow-lg ${fullConfirmation.codigo_Status === 1 ? 'bg-emerald-500' : 'bg-rose-500'
										}`}>
										<CheckCircle className="h-4 w-4 text-white" />
									</div>
								</div>

								<div className="flex-1 text-center md:text-left">
									<h3 className="text-2xl font-black text-[#1e293b] leading-tight">
										{fullConfirmation.tb_matriculas?.tb_alunos?.nome}
									</h3>
									<div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
										<div className="flex items-center gap-2 text-sm font-bold text-gray-500">
											<GraduationCap className="h-4 w-4 text-[#3964d7]" />
											{fullConfirmation.tb_matriculas?.tb_cursos?.designacao}
										</div>
										<div className="w-1.5 h-1.5 rounded-full bg-gray-200 hidden sm:block"></div>
										<div className="flex items-center gap-2 text-sm font-bold text-gray-500">
											<User className="h-4 w-4 text-[#3964d7]" />
											{fullConfirmation.tb_matriculas?.tb_alunos?.sexo}
										</div>
									</div>
								</div>

								<div className="flex flex-col items-center md:items-end gap-2">
									<span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${fullConfirmation.codigo_Status === 1
										? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
										: 'bg-rose-50 text-rose-600 border border-rose-100'
										}`}>
										{fullConfirmation.codigo_Status === 1 ? 'Matrícula Ativa' : 'Inativa'}
									</span>
									<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado Atual</p>
								</div>
							</div>

							{/* Grid de Informações */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Turma e Localização */}
								<div className="bg-white rounded-4xl border border-gray-100 p-8 space-y-6">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
											<Building className="h-5 w-5 text-amber-500" />
										</div>
										<div>
											<h4 className="text-sm font-black text-[#1e293b] uppercase tracking-widest">Alocação Académica</h4>
											<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Turma e Horário</p>
										</div>
									</div>

									<div className="space-y-4">
										<div className="flex justify-between items-center py-3 border-b border-gray-50">
											<span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Turma</span>
											<span className="text-sm font-black text-[#1e293b]">{fullConfirmation.tb_turmas?.designacao || 'N/A'}</span>
										</div>
										<div className="flex justify-between items-center py-3 border-b border-gray-50">
											<span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Classe</span>
											<span className="text-sm font-black text-[#1e293b]">{fullConfirmation.tb_turmas?.tb_classes?.designacao || 'N/A'}</span>
										</div>
										<div className="flex justify-between items-center py-3 border-b border-gray-50">
											<span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sala</span>
											<span className="text-sm font-black text-[#1e293b]">{fullConfirmation.tb_turmas?.tb_salas?.designacao || 'N/A'}</span>
										</div>
										<div className="flex justify-between items-center py-3">
											<span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Período</span>
											<span className="text-sm font-black text-[#1e293b]">{fullConfirmation.tb_turmas?.tb_periodos?.designacao || 'N/A'}</span>
										</div>
									</div>
								</div>

								{/* Datas e Classificação */}
								<div className="bg-white rounded-4xl border border-gray-100 p-8 space-y-6">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-xl bg-[#3964d7]/5 flex items-center justify-center">
											<Calendar className="h-5 w-5 text-[#3964d7]" />
										</div>
										<div>
											<h4 className="text-sm font-black text-[#1e293b] uppercase tracking-widest">Registro Temporal</h4>
											<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prazos e Rankings</p>
										</div>
									</div>

									<div className="space-y-4">
										<div className="flex justify-between items-center py-3 border-b border-gray-50">
											<span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Confirmação</span>
											<span className="text-sm font-black text-[#1e293b]">{formatDate(fullConfirmation.data_Confirmacao)}</span>
										</div>
										<div className="flex justify-between items-center py-3 border-b border-gray-50">
											<span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Início Previsto</span>
											<span className="text-sm font-black text-[#1e293b]">
												{fullConfirmation.mes_Comecar ? formatDate(fullConfirmation.mes_Comecar) : 'Não definido'}
											</span>
										</div>
										<div className="flex justify-between items-center py-3 border-b border-gray-50">
											<span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Classificação</span>
											<span className={`text-sm font-black ${fullConfirmation.classificacao === 'Aprovado' ? 'text-emerald-600' :
												fullConfirmation.classificacao === 'Reprovado' ? 'text-rose-600' : 'text-[#3964d7]'
												}`}>
												{fullConfirmation.classificacao || 'Pendente'}
											</span>
										</div>
										<div className="flex justify-between items-center py-3">
											<span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ano Lectivo</span>
											<span className="text-sm font-black text-[#1e293b]">{fullConfirmation.codigo_Ano_lectivo || 'N/A'}</span>
										</div>
									</div>
								</div>
							</div>

							{/* Histórico do Sistema */}
							<div className="bg-white rounded-4xl border border-gray-100 p-8">
								<div className="flex items-center gap-3 mb-8">
									<div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
										<CheckCircle className="h-5 w-5 text-gray-400" />
									</div>
									<div>
										<h4 className="text-sm font-black text-[#1e293b] uppercase tracking-widest">Rastreabilidade</h4>
										<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registro de Operação</p>
									</div>
								</div>

								<div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
											<User className="h-6 w-6 text-[#3964d7]" />
										</div>
										<div>
											<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Operador Responsável</p>
											<p className="text-sm font-black text-gray-700">{fullConfirmation.tb_utilizadores?.nome || 'Sistema'}</p>
										</div>
									</div>
									<div className="h-8 w-px bg-gray-200 hidden md:block"></div>
									<div>
										<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:text-right">Usuário de Acesso</p>
										<p className="text-sm font-black text-gray-700 md:text-right">@{fullConfirmation.tb_utilizadores?.user || 'admin'}</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-end gap-4 p-8 bg-white border-t border-gray-100 shrink-0">
						<button
							type="button"
							onClick={onClose}
							className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-all"
						>
							Fechar Visualização
						</button>
						{onEdit && (
							<button
								type="button"
								onClick={onEdit}
								className="flex items-center gap-2 px-8 py-4 bg-[#3964d7] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#2d52b2] transition-all duration-300 shadow-[0_8px_16px_-4px_rgba(57,100,215,0.4)]"
							>
								<Edit2 className="h-4 w-4" />
								Editar Dados
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
