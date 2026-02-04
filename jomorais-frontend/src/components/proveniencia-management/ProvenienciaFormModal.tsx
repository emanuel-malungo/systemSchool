import { X, Building, MapPin, Phone, AlertCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Proveniencia, CreateProvenienciaPayload } from '../../types/proveniencia.types'
import { mockStatus } from '../../mocks/status.mock'

interface ProvenienciaFormModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (data: CreateProvenienciaPayload) => void
	proveniencia?: Proveniencia | null
	isLoading: boolean
}

export default function ProvenienciaFormModal({
	isOpen,
	onClose,
	onSubmit,
	proveniencia,
	isLoading,
}: ProvenienciaFormModalProps) {
	const isEditMode = !!proveniencia

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm<CreateProvenienciaPayload>()

	// Preenche o formulário quando está em modo de edição
	useEffect(() => {
		if (proveniencia && isOpen) {
			setValue('designacao', proveniencia.designacao)
			setValue('localizacao', proveniencia.localizacao || '')
			setValue('contacto', proveniencia.contacto || '')
			setValue('codigoStatus', proveniencia.codigoStatus)
		} else if (!isOpen) {
			reset()
		}
	}, [proveniencia, isOpen, setValue, reset])

	const handleFormSubmit = (data: CreateProvenienciaPayload) => {
		onSubmit(data)
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden">
			<div className="flex min-h-screen items-center justify-center p-4">
				{/* Backdrop com Blur */}
				<div
					className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm transition-opacity duration-500"
					onClick={isLoading ? undefined : onClose}
				/>

				{/* Modal Container */}
				<div className="relative bg-[#f8fafc] rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-2xl w-full overflow-hidden border border-white flex flex-col slide-in-bottom">

					{/* Header com Estilo Premium */}
					<div className="bg-white p-8 border-b border-gray-100 flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-[#3964d7] rounded-2xl flex items-center justify-center shadow-lg shadow-[#3964d7]/20">
								<Building className="h-6 w-6 text-white" />
							</div>
							<div>
								<h2 className="text-xl font-black text-[#1e293b] uppercase tracking-tight">
									{isEditMode ? 'Editar Instituição' : 'Nova Instituição'}
								</h2>
								<div className="flex items-center gap-2 mt-0.5">
									<div className="h-1.5 w-1.5 rounded-full bg-[#3964d7] animate-pulse"></div>
									<span className="text-[10px] font-black text-[#3964d7] uppercase tracking-[0.2em]">Fluxo de Cadastro Administrativo</span>
								</div>
							</div>
						</div>
						<button
							onClick={onClose}
							disabled={isLoading}
							className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 active:scale-90 disabled:opacity-50"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					{/* Form Content */}
					<form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
						<div className="space-y-8">

							{/* Seção: Identificação Principal */}
							<div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
								<div className="flex items-center gap-3 mb-6">
									<div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
										<Building className="h-4 w-4 text-blue-500" />
									</div>
									<h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Identificação da Instituição</h3>
								</div>

								<div className="space-y-6">
									<div>
										<label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
											Designação Oficial <span className="text-rose-500">*</span>
										</label>
										<div className="relative group">
											<Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-[#3964d7] transition-colors" />
											<input
												type="text"
												placeholder="Nome da escola ou organização"
												{...register('designacao', {
													required: 'Designação é obrigatória',
													minLength: { value: 3, message: 'Mínimo de 3 caracteres' },
												})}
												disabled={isLoading}
												className={`w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 transition-all duration-300 ${errors.designacao ? 'border-rose-300 ring-rose-500/5' : ''
													}`}
											/>
										</div>
										{errors.designacao && (
											<p className="mt-2 ml-1 text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
												<AlertCircle className="h-3 w-3" />
												{errors.designacao.message}
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Seção: Localização e Contacto */}
							<div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
								<div className="flex items-center gap-3 mb-6">
									<div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
										<MapPin className="h-4 w-4 text-orange-500" />
									</div>
									<h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Dados Logísticos</h3>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
											Localização Física
										</label>
										<div className="relative group">
											<MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-[#3964d7] transition-colors" />
											<input
												type="text"
												placeholder="Cidade, Município..."
												{...register('localizacao')}
												disabled={isLoading}
												className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 transition-all duration-300"
											/>
										</div>
									</div>

									<div>
										<label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
											Canal de Contacto
										</label>
										<div className="relative group">
											<Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-[#3964d7] transition-colors" />
											<input
												type="text"
												placeholder="Telefone ou Email"
												{...register('contacto')}
												disabled={isLoading}
												className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 transition-all duration-300"
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Seção: Status Operacional */}
							<div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
								<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
									<div className="flex-1">
										<h4 className="text-sm font-black text-[#1e293b] uppercase tracking-tight mb-1">Estatuto de Disponibilidade</h4>
										<p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Ative ou desative a instituição no sistema</p>
									</div>
									<div className="w-full md:w-64">
										<select
											{...register('codigoStatus', {
												required: 'Status é obrigatório',
												valueAsNumber: true,
											})}
											disabled={isLoading}
											className={`w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 appearance-none cursor-pointer transition-all duration-300 ${errors.codigoStatus ? 'border-rose-300' : ''
												}`}
										>
											<option value="">Selecione...</option>
											{mockStatus.map((status) => (
												<option key={status.codigo} value={status.codigo}>
													{status.designacao}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>

							{/* Informações de Ajuda */}
							<div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex gap-5">
								<div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
									<AlertCircle className="h-6 w-6 text-blue-500" />
								</div>
								<div className="pt-1">
									<h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Protocolos do Sistema:</h4>
									<ul className="space-y-2">
										<li className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
											<div className="w-1 h-1 rounded-full bg-blue-400"></div>
											A designação deve ser o nome legal da escola
										</li>
										<li className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
											<div className="w-1 h-1 rounded-full bg-blue-400"></div>
											Status "Inativo" bloqueia novas transferências
										</li>
									</ul>
								</div>
							</div>
						</div>
					</form>

					{/* Footer fixo */}
					<div className="p-8 bg-white border-t border-gray-100 flex flex-col md:flex-row gap-4">
						<button
							type="button"
							onClick={onClose}
							disabled={isLoading}
							className="flex-1 py-4 bg-gray-50 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all duration-300 active:scale-95 disabled:opacity-50"
						>
							Cancelar Operação
						</button>
						<button
							type="button"
							onClick={handleSubmit(handleFormSubmit)}
							disabled={isLoading}
							className="flex-1 py-4 bg-[#3964d7] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-[#2d52b2] shadow-xl shadow-[#3964d7]/20 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
						>
							{isLoading ? (
								<div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							) : (
								isEditMode ? 'Consolidar Alterações' : 'Confirmar Cadastro'
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
