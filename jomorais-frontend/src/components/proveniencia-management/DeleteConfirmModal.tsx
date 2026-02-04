import { AlertTriangle, Trash2 } from 'lucide-react'

interface DeleteConfirmModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	provenienciaName: string
	isDeleting: boolean
}

export default function DeleteConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	provenienciaName,
	isDeleting,
}: DeleteConfirmModalProps) {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden">
			<div className="flex min-h-screen items-center justify-center p-4">
				{/* Backdrop com Blur Profundo */}
				<div
					className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-md transition-opacity duration-500"
					onClick={isDeleting ? undefined : onClose}
				/>

				{/* Modal Container: Premium Rose Aesthetic */}
				<div className="relative bg-white rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] max-w-md w-full overflow-hidden border border-rose-50 flex flex-col slide-in-bottom">

					{/* Top Decorative Banner */}
					<div className="h-2 bg-linear-to-r from-rose-500 via-rose-400 to-rose-600"></div>

					<div className="p-10 flex flex-col items-center text-center">
						{/* Warning Icon with Animation */}
						<div className="mb-8 relative">
							<div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl animate-pulse"></div>
							<div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center relative border border-rose-100 transform rotate-3">
								<AlertTriangle className="h-10 w-10 text-rose-500" />
							</div>
						</div>

						{/* Content Highlighting */}
						<div className="space-y-3">
							<h2 className="text-xl font-black text-[#1e293b] uppercase tracking-tight">
								Eliminar Registro
							</h2>
							<div className="flex items-center justify-center gap-2">
								<div className="h-1 w-1 rounded-full bg-rose-500"></div>
								<span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Ação Irreversível</span>
							</div>
						</div>

						<div className="mt-8 p-6 bg-gray-50 rounded-3xl border border-gray-100 w-full relative group">
							<p className="text-sm font-medium text-gray-500 leading-relaxed">
								Você está prestes a remover permanentemente a instituição:
							</p>
							<p className="mt-2 text-base font-black text-[#1e293b] uppercase tracking-tight break-words">
								"{provenienciaName}"
							</p>

							<div className="mt-6 pt-6 border-t border-gray-100">
								<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed text-center">
									Esta ação resultará na exclusão total dos dados de proveniência do sistema.
								</p>
							</div>
						</div>
					</div>

					{/* Footer Ações */}
					<div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4">
						<button
							onClick={onClose}
							disabled={isDeleting}
							className="flex-1 py-4 bg-white text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 hover:text-gray-600 transition-all duration-300 border border-gray-200 active:scale-95 disabled:opacity-50"
						>
							Manter Dados
						</button>
						<button
							onClick={onConfirm}
							disabled={isDeleting}
							className="flex-1 py-4 bg-rose-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-600 shadow-xl shadow-rose-500/20 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
						>
							{isDeleting ? (
								<div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							) : (
								<>
									<Trash2 className="h-4 w-4" />
									Confirmar Exclusão
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
