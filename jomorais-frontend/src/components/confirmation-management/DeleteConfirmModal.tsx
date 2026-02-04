import { AlertTriangle } from 'lucide-react'

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
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<div className="flex min-h-screen items-center justify-center p-4">
				<div
					className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm transition-opacity"
					onClick={isDeleting ? undefined : onClose}
				/>
				<div className="relative bg-white rounded-4xl shadow-2xl max-w-md w-full p-10 overflow-hidden border border-white/20 slide-in-bottom">
					<div className="flex flex-col items-center text-center">
						<div className="h-20 w-20 rounded-3xl bg-rose-50 flex items-center justify-center mb-6 shadow-lg shadow-rose-100/50">
							<AlertTriangle className="h-10 w-10 text-rose-500" />
						</div>

						<h2 className="text-xl font-black text-[#1e293b] mb-2">Eliminar Registro</h2>
						<p className="text-sm font-medium text-gray-500 leading-relaxed mb-8">
							Tem certeza que deseja deletar permanentemente a confirmação do aluno <span className="font-black text-[#1e293b]">{studentName}</span>?
						</p>

						<div className="w-full bg-rose-50/50 border border-rose-100 rounded-3xl p-6 mb-8">
							<div className="flex items-start gap-3 text-left">
								<div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shrink-0 mt-0.5">
									<span className="text-[10px] font-black text-white">!</span>
								</div>
								<div>
									<p className="text-[11px] font-black text-rose-600 uppercase tracking-widest mb-2">Impacto Crítico</p>
									<ul className="text-xs text-rose-600/80 space-y-1.5 font-medium">
										<li>• O registro será removido da base de dados</li>
										<li>• O vínculo com a turma será desfeito</li>
										<li>• Esta operação não pode ser revertida</li>
									</ul>
								</div>
							</div>
						</div>

						<div className="flex w-full gap-4">
							<button
								type="button"
								onClick={onClose}
								disabled={isDeleting}
								className="flex-1 px-6 py-4 bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 hover:text-gray-600 transition-all transition-all duration-300 disabled:opacity-50"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={onConfirm}
								disabled={isDeleting}
								className="flex-1 px-6 py-4 bg-rose-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-600 transition-all duration-300 shadow-lg shadow-rose-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
							>
								{isDeleting ? (
									<>
										<div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
										<span>Eliminando...</span>
									</>
								) : (
									<span>Sim, Eliminar</span>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
