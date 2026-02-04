import { AlertTriangle, X } from 'lucide-react'

interface DeleteConfirmModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	studentName: string
	isDeleting: boolean
}

export default function DeleteConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	studentName,
	isDeleting,
}: DeleteConfirmModalProps) {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden">
			<div className="flex min-h-screen items-center justify-center p-4">
				{/* Backdrop com Blur */}
				<div
					className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm transition-opacity duration-500"
					onClick={isDeleting ? undefined : onClose}
				/>

				{/* Modal Container */}
				<div className="relative bg-white rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] max-w-md w-full overflow-hidden border border-white slide-in-bottom">
					{/* Top Decorative Warning Bar */}
					<div className="h-2 w-full bg-linear-to-r from-rose-400 to-rose-600"></div>

					<div className="p-10">
						{/* Header com Icone */}
						<div className="flex flex-col items-center text-center mb-8">
							<div className="relative mb-6">
								<div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
									<AlertTriangle className="h-10 w-10 text-rose-500" />
								</div>
								<div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center border border-rose-50">
									<div className="w-5 h-5 rounded-md bg-rose-500 flex items-center justify-center">
										<X className="h-3 w-3 text-white" />
									</div>
								</div>
							</div>

							<h2 className="text-xl font-black text-[#1e293b] uppercase tracking-tight">Expurgar Registro</h2>
							<p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mt-2">Ação Crítica Irreversível</p>
						</div>

						{/* Content Body */}
						<div className="space-y-6">
							<div className="text-center">
								<p className="text-sm font-medium text-gray-500 leading-relaxed uppercase tracking-widest text-[11px]">
									Confirma a exclusão definitiva do dossiê de transferência de:
								</p>
								<div className="mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
									<p className="text-sm font-black text-[#1e293b] uppercase tracking-tight">{studentName}</p>
								</div>
							</div>

							{/* Warning list */}
							<div className="p-5 bg-rose-50 rounded-3xl border border-rose-100 flex gap-4">
								<div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-rose-100">
									<AlertTriangle className="h-5 w-5 text-rose-500" />
								</div>
								<div className="pt-1">
									<h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Implicações:</h4>
									<ul className="space-y-2">
										<li className="flex items-center gap-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">
											<div className="w-1 h-1 rounded-full bg-rose-400"></div>
											Remoção do Histórico
										</li>
										<li className="flex items-center gap-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">
											<div className="w-1 h-1 rounded-full bg-rose-400"></div>
											Anulação do Protocolo
										</li>
									</ul>
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col gap-3 mt-10">
							<button
								type="button"
								onClick={onConfirm}
								disabled={isDeleting}
								className="w-full py-4 bg-rose-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-600 shadow-xl shadow-rose-500/20 transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
							>
								{isDeleting ? (
									<>
										<div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
										Processando...
									</>
								) : (
									'Sim, Confirmar Exclusão'
								)}
							</button>

							<button
								type="button"
								onClick={onClose}
								disabled={isDeleting}
								className="w-full py-4 bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 hover:text-gray-600 transition-all duration-300 active:scale-95 disabled:opacity-50"
							>
								Desistir da Operação
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
