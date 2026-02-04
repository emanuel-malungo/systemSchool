import { X, Edit2, User, Calendar, Building, FileText, ArrowRightLeft } from 'lucide-react'
import { useTransfer } from '../../hooks/useTransfer'
import type { ITransfer } from '../../types/transfer.types'

interface TransferViewModalProps {
	isOpen: boolean
	onClose: () => void
	transfer: ITransfer | null
	onEdit: () => void
}

export default function TransferViewModal({
	isOpen,
	onClose,
	transfer,
	onEdit,
}: TransferViewModalProps) {
	// Busca dados completos da transferência
	const { data: transferData, isLoading } = useTransfer(
		transfer?.codigo || 0,
		isOpen && !!transfer
	)

	// Usa os dados completos se disponíveis, senão usa os dados básicos
	const fullTransfer = transferData?.data || transfer

	if (!isOpen || !transfer) return null

	if (isLoading) {
		return (
			<div className="fixed inset-0 z-50 overflow-y-auto">
				<div className="flex min-h-screen items-center justify-center p-4">
					<div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
					<div className="relative bg-white rounded-4xl shadow-2xl max-w-lg w-full p-12 overflow-hidden border border-white/20">
						<div className="flex flex-col items-center justify-center">
							<div className="relative w-16 h-16">
								<div className="absolute inset-0 border-4 border-[#3964d7]/10 rounded-full"></div>
								<div className="absolute inset-0 border-4 border-[#3964d7] rounded-full border-t-transparent animate-spin"></div>
							</div>
							<p className="mt-6 text-xs font-black text-[#1e293b] uppercase tracking-[0.2em]">Sincronizando Dados...</p>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!fullTransfer) return null

	const formatDate = (date: string | object | null) => {
		if (!date) return 'N/A'
		if (typeof date === 'object') return 'N/A'
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

	// Mapeamento de motivos
	const getMotivoText = (codigoMotivo: number) => {
		const motivos: Record<number, string> = {
			1: 'Mudança de Residência',
			2: 'Problemas Financeiros',
			3: 'Insatisfação com a Escola',
			4: 'Problemas de Saúde',
			5: 'Outros Motivos',
		}
		return motivos[codigoMotivo] || `Motivo ${codigoMotivo}`
	}

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

				<div className="relative bg-gray-50/80 backdrop-blur-xl rounded-4xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-white slide-in-bottom">
					{/* Header */}
					<div className="relative bg-white p-8 border-b border-gray-100 flex items-center justify-between z-10">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-2xl bg-[#3964d7]/5 flex items-center justify-center">
								<ArrowRightLeft className="h-6 w-6 text-[#3964d7]" />
							</div>
							<div>
								<h2 className="text-xl font-black text-[#1e293b] uppercase tracking-tight">Dossiê de Transferência</h2>
								<div className="flex items-center gap-2 mt-0.5">
									<span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Protocolo:</span>
									<span className="text-[10px] font-black text-[#3964d7] bg-[#3964d7]/5 px-2 py-0.5 rounded-md">TRF-{fullTransfer.codigo}</span>
								</div>
							</div>
						</div>
						<button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition-all">
							<X className="h-6 w-6" />
						</button>
					</div>

					<div className="flex-1 overflow-y-auto p-8 lg:p-10">
						<div className="space-y-8">
							{/* Card Aluno Principal */}
							<div className="bg-white rounded-4xl border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
								<div className="relative">
									<div className="w-24 h-24 rounded-3xl bg-linear-to-br from-[#3964d7] to-[#2d52b2] flex items-center justify-center text-white text-4xl font-black shadow-xl">
										{fullTransfer.tb_alunos?.nome?.charAt(0).toUpperCase() || 'A'}
									</div>
									<div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-gray-50 flex items-center justify-center">
										<div className="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center">
											<ArrowRightLeft className="h-4 w-4 text-white" />
										</div>
									</div>
								</div>

								<div className="text-center md:text-left flex-1">
									<h3 className="text-2xl font-black text-[#1e293b] mb-2 uppercase tracking-tight">
										{fullTransfer.tb_alunos?.nome || 'Discente não identificado'}
									</h3>
									<div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
										<div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
											<User className="h-3.5 w-3.5 text-gray-400" />
											<span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{fullTransfer.tb_alunos?.sexo === 'M' ? 'Masculino' : 'Feminino'}</span>
										</div>
										<div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-100">
											<div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
											<span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Estatuto: Transferido</span>
										</div>
									</div>
								</div>
							</div>

							{/* Grid de Informações Técnicas */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Escola e Destino */}
								<div className="bg-white rounded-4xl border border-gray-100 p-8 space-y-6">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-xl bg-[#3964d7]/5 flex items-center justify-center">
											<Building className="h-5 w-5 text-[#3964d7]" />
										</div>
										<h4 className="text-xs font-black text-[#1e293b] uppercase tracking-widest">Destino do Aluno</h4>
									</div>

									<div className="space-y-4 divide-y divide-gray-50">
										<div className="flex justify-between items-center py-1">
											<span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Entidade</span>
											<span className="text-sm font-black text-[#1e293b]">Escola #{fullTransfer.codigoEscola}</span>
										</div>
										<div className="flex justify-between items-center pt-3">
											<span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estado Final</span>
											<span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-lg uppercase tracking-widest">Efectivado</span>
										</div>
									</div>
								</div>

								{/* Data e Motivo */}
								<div className="bg-white rounded-4xl border border-gray-100 p-8 space-y-6">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
											<Calendar className="h-5 w-5 text-amber-500" />
										</div>
										<h4 className="text-xs font-black text-[#1e293b] uppercase tracking-widest">Cronograma e Razão</h4>
									</div>

									<div className="space-y-4 divide-y divide-gray-50">
										<div className="flex justify-between items-center py-1">
											<span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data</span>
											<span className="text-sm font-black text-[#1e293b]">{formatDate(fullTransfer.dataTransferencia)}</span>
										</div>
										<div className="flex justify-between items-center pt-3">
											<span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Motivação</span>
											<span className="text-xs font-black text-[#3964d7] underline decoration-2 decoration-[#3964d7]/20 underline-offset-4 tracking-tight">
												{getMotivoText(fullTransfer.codigoMotivo)}
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Observações e Notas */}
							<div className="bg-white rounded-4xl border border-gray-100 p-8">
								<div className="flex items-center gap-3 mb-6">
									<div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
										<FileText className="h-5 w-5 text-gray-400" />
									</div>
									<h4 className="text-xs font-black text-[#1e293b] uppercase tracking-widest">Parecer Técnico / Notas</h4>
								</div>
								<div className="bg-gray-50 rounded-2xl p-6 text-sm font-medium text-gray-600 leading-relaxed border border-gray-100">
									{fullTransfer.obs || 'Nenhuma observação registrada para este processo de transferência.'}
								</div>
							</div>

							{/* Auditoria do Sistema */}
							<div className="bg-linear-to-r from-[#1e293b] to-[#334155] rounded-4xl p-8 text-white">
								<div className="flex flex-col md:flex-row items-center justify-between gap-6">
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
											<User className="h-6 w-6 text-white" />
										</div>
										<div>
											<p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Registrado por</p>
											<p className="text-sm font-black tracking-tight">{fullTransfer.tb_utilizadores?.nome || 'Admin'}</p>
										</div>
									</div>
									<div className="h-10 w-px bg-white/10 hidden md:block"></div>
									<div className="flex items-center gap-3">
										<div className="text-right">
											<p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Data de Atualização</p>
											<p className="text-sm font-black tracking-tight">{fullTransfer.dataActualizacao ? formatDate(fullTransfer.dataActualizacao) : 'N/A'}</p>
										</div>
										<div className="w-10 h-10 rounded-xl bg-[#3964d7]/40 flex items-center justify-center">
											<Calendar className="h-5 w-5 text-white" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="px-8 py-8 bg-white border-t border-gray-100 flex gap-4">
						<button
							onClick={onClose}
							className="flex-1 px-8 py-4 bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 hover:text-gray-600 transition-all duration-300 active:scale-95"
						>
							Fechar Visualização
						</button>
						<button
							onClick={onEdit}
							className="flex-2 px-8 py-4 bg-[#3964d7] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-[#2d52b2] transition-all duration-300 shadow-xl shadow-[#3964d7]/20 flex items-center justify-center gap-3 active:scale-95"
						>
							<Edit2 className="h-4 w-4" />
							Retificar Dados
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
