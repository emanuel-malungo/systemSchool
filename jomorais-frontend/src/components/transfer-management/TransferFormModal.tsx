import { X, Search, ArrowRightLeft, Building, User, FileText, AlertCircle, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { ITransfer, ITransferInput } from '../../types/transfer.types'
import { useStudents } from '../../hooks/useStudent'
import { useProvenienciasComplete } from '../../hooks/useProveniencia'

interface TransferFormModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (data: ITransferInput) => void
	transfer?: ITransfer | null
	isLoading: boolean
}

export default function TransferFormModal({
	isOpen,
	onClose,
	onSubmit,
	transfer,
	isLoading,
}: TransferFormModalProps) {
	const isEditMode = !!transfer
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedStudent, setSelectedStudent] = useState<{ codigo: number; nome: string } | null>(null)
	const [showStudentList, setShowStudentList] = useState(false)

	// Buscar alunos
	const { data: studentsData, isLoading: isLoadingStudents } = useStudents({
		page: 1,
		limit: 50,
		search: searchTerm,
	})

	const students = studentsData?.data || []

	// Buscar proveniências (escolas)
	const { data: provenienciasData, isLoading: isLoadingProveniencias } = useProvenienciasComplete()
	const proveniencias = provenienciasData?.data || []

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm<ITransferInput>()

	// Preenche o formulário quando está em modo de edição
	useEffect(() => {
		if (transfer && isOpen) {
			setValue('codigoAluno', transfer.codigoAluno)
			setValue('codigoEscola', transfer.codigoEscola)
			setValue('codigoMotivo', transfer.codigoMotivo)
			setValue('obs', transfer.obs || '')

			// Formata a data para o input datetime-local
			if (transfer.dataTransferencia && typeof transfer.dataTransferencia === 'string') {
				const date = new Date(transfer.dataTransferencia)
				const formattedDate = date.toISOString().slice(0, 16)
				setValue('dataTransferencia', formattedDate)
			}

			// Define o aluno selecionado em modo de edição
			if (transfer.tb_alunos) {
				setSelectedStudent({
					codigo: transfer.codigoAluno,
					nome: transfer.tb_alunos.nome
				})
			}
		} else if (!isOpen) {
			reset()
			setSelectedStudent(null)
			setSearchTerm('')
			setShowStudentList(false)
		}
	}, [transfer, isOpen, setValue, reset])

	// Handler para selecionar um aluno
	const handleSelectStudent = (student: { codigo: number; nome: string }) => {
		setSelectedStudent(student)
		setValue('codigoAluno', student.codigo)
		setShowStudentList(false)
		setSearchTerm('')
	}

	// Fechar lista ao clicar fora
	useEffect(() => {
		const handleClickOutside = () => {
			if (showStudentList) {
				setShowStudentList(false)
			}
		}

		if (showStudentList) {
			document.addEventListener('click', handleClickOutside)
		}

		return () => {
			document.removeEventListener('click', handleClickOutside)
		}
	}, [showStudentList])

	const handleFormSubmit = (data: ITransferInput) => {
		// Converte a data para ISO string
		const formattedData = {
			...data,
			dataTransferencia: new Date(data.dataTransferencia).toISOString(),
		}
		onSubmit(formattedData)
	}

	if (!isOpen) return null

	const motivos = [
		{ value: 1, label: 'Mudança de Residência' },
		{ value: 2, label: 'Problemas Financeiros' },
		{ value: 3, label: 'Insatisfação com a Escola' },
		{ value: 4, label: 'Problemas de Saúde' },
		{ value: 5, label: 'Outros Motivos' },
	]

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
			<div className="flex min-h-screen items-center justify-center p-4">
				<div
					className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm transition-opacity"
					onClick={isLoading ? undefined : onClose}
				/>

				<div className="relative bg-gray-50/80 backdrop-blur-xl rounded-4xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-white slide-in-bottom">
					{/* Header */}
					<div className="relative bg-white p-8 border-b border-gray-100 flex items-center justify-between z-10 shrink-0">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-2xl bg-[#3964d7]/5 flex items-center justify-center">
								<ArrowRightLeft className="h-6 w-6 text-[#3964d7]" />
							</div>
							<div>
								<h2 className="text-xl font-black text-[#1e293b] uppercase tracking-tight">
									{isEditMode ? 'Retificar Transferência' : 'Formalizar Transferência'}
								</h2>
								<div className="flex items-center gap-2 mt-0.5">
									<span className="h-1.5 w-1.5 rounded-full bg-[#3964d7] animate-pulse"></span>
									<span className="text-[10px] font-black text-[#3964d7] uppercase tracking-widest">Procedimento Oficial</span>
								</div>
							</div>
						</div>
						<button
							onClick={onClose}
							disabled={isLoading}
							className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition-all disabled:opacity-50"
						>
							<X className="h-6 w-6" />
						</button>
					</div>

					<form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-8">
						{/* Card: Seleção do Aluno */}
						<div className="bg-white rounded-4xl border border-gray-100 p-8 shadow-sm">
							<div className="flex items-center gap-3 mb-8">
								<div className="w-10 h-10 rounded-xl bg-[#3964d7]/5 flex items-center justify-center text-[#3964d7]">
									<User className="h-5 w-5" />
								</div>
								<h3 className="text-xs font-black text-[#1e293b] uppercase tracking-widest">Identificação do Aluno</h3>
							</div>

							<div className="space-y-4">
								{isEditMode ? (
									<div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
										<div className="w-12 h-12 bg-[#3964d7] rounded-xl flex items-center justify-center text-white font-black text-lg">
											{selectedStudent?.nome?.charAt(0).toUpperCase() || 'A'}
										</div>
										<div>
											<p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aluno Selecionado</p>
											<p className="text-sm font-black text-[#1e293b] mt-0.5">{selectedStudent?.nome}</p>
										</div>
									</div>
								) : (
									<div className="relative">
										{!selectedStudent ? (
											<div className="relative group">
												<Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#3964d7] transition-all" />
												<input
													type="text"
													placeholder="Digite o nome do aluno para pesquisar..."
													value={searchTerm}
													onChange={(e) => {
														setSearchTerm(e.target.value)
														setShowStudentList(true)
													}}
													onFocus={() => setShowStudentList(true)}
													disabled={isLoading}
													className={`w-full pl-14 pr-4 py-4 bg-gray-50 border rounded-2xl text-sm font-bold text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 transition-all duration-300 ${errors.codigoAluno ? 'border-rose-200 focus:ring-rose-500/5' : 'border-gray-100 focus:ring-[#3964d7]/5'
														}`}
												/>

												{showStudentList && searchTerm && (
													<div className="absolute z-20 w-full mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden slide-in-bottom">
														{isLoadingStudents ? (
															<div className="p-8 text-center bg-white">
																<div className="h-8 w-8 rounded-full border-4 border-[#3964d7]/10 border-t-[#3964d7] animate-spin mx-auto mb-4"></div>
																<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Buscando Base de Dados...</p>
															</div>
														) : students.length > 0 ? (
															<div className="max-h-60 overflow-y-auto scrollbar-hide">
																{students.map((student) => (
																	<button
																		key={student.codigo}
																		type="button"
																		onClick={() => handleSelectStudent({ codigo: student.codigo, nome: student.nome })}
																		className="w-full p-4 flex items-center gap-4 hover:bg-[#3964d7]/5 transition-colors text-left group"
																	>
																		<div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-[#3964d7] flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
																			{student.nome.charAt(0).toUpperCase()}
																		</div>
																		<div>
																			<p className="text-sm font-bold text-[#1e293b] uppercase tracking-tight">{student.nome}</p>
																			<p className="text-[10px] font-medium text-gray-400 tracking-widest uppercase">ID: {student.codigo}</p>
																		</div>
																	</button>
																))}
															</div>
														) : (
															<div className="p-8 text-center">
																<p className="text-xs font-black text-gray-400 uppercase tracking-widest">Nenhum Registro Encontrado</p>
															</div>
														)}
													</div>
												)}
											</div>
										) : (
											<div className="flex items-center justify-between p-5 bg-[#3964d7]/5 border border-[#3964d7]/20 rounded-2xl shadow-sm slide-in-bottom">
												<div className="flex items-center gap-4">
													<div className="w-12 h-12 bg-[#3964d7] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
														{selectedStudent.nome.charAt(0).toUpperCase()}
													</div>
													<div>
														<p className="text-xs font-bold text-[#3964d7] uppercase tracking-widest">Beneficiário Selecionado</p>
														<p className="text-sm font-black text-[#1e293b] mt-0.5">{selectedStudent.nome}</p>
													</div>
												</div>
												<button
													type="button"
													onClick={() => {
														setSelectedStudent(null)
														setValue('codigoAluno', 0)
														setSearchTerm('')
													}}
													className="w-10 h-10 rounded-xl bg-white border border-[#3964d7]/10 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
												>
													<X className="h-5 w-5" />
												</button>
											</div>
										)}
									</div>
								)}

								<input
									type="hidden"
									{...register('codigoAluno', {
										required: 'Selecione um aluno',
										min: { value: 1, message: 'Selecione um aluno válido' },
									})}
								/>
								{errors.codigoAluno && !selectedStudent && (
									<p className="px-2 text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.codigoAluno.message}</p>
								)}
							</div>
						</div>

						{/* Card: Dados de Destino */}
						<div className="bg-white rounded-4xl border border-gray-100 p-8 shadow-sm">
							<div className="flex items-center gap-3 mb-8">
								<div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
									<Building className="h-5 w-5" />
								</div>
								<h3 className="text-xs font-black text-[#1e293b] uppercase tracking-widest">Configuração de Destino</h3>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div>
									<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">
										Instituição de Destino
									</label>
									<div className="relative group">
										<select
											{...register('codigoEscola', {
												required: 'Campo obrigatório',
												valueAsNumber: true,
											})}
											disabled={isLoading || isLoadingProveniencias}
											className={`w-full px-5 py-4 bg-gray-50 border rounded-2xl text-xs font-black text-[#1e293b] uppercase tracking-widest focus:bg-white focus:outline-none focus:ring-4 transition-all duration-300 appearance-none cursor-pointer ${errors.codigoEscola ? 'border-rose-200 focus:ring-rose-500/5' : 'border-gray-100 focus:ring-[#3964d7]/5'
												}`}
										>
											<option value="">{isLoadingProveniencias ? 'Solicitando Lista...' : 'Selecione a Unidade'}</option>
											{proveniencias.map((p) => (
												<option key={p.codigo} value={p.codigo}>{p.designacao}</option>
											))}
										</select>
										<div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
											<ChevronRight className="h-4 w-4 transform rotate-90" />
										</div>
									</div>
									{errors.codigoEscola && <p className="mt-2 px-2 text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.codigoEscola.message}</p>}
								</div>

								<div>
									<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">
										Data da Operação
									</label>
									<input
										type="datetime-local"
										{...register('dataTransferencia', { required: 'Data obrigatória' })}
										disabled={isLoading}
										className={`w-full px-5 py-4 bg-gray-50 border rounded-2xl text-xs font-black text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 transition-all duration-300 ${errors.dataTransferencia ? 'border-rose-200 focus:ring-rose-500/5' : 'border-gray-100 focus:ring-[#3964d7]/5'
											}`}
									/>
									{errors.dataTransferencia && <p className="mt-2 px-2 text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.dataTransferencia.message}</p>}
								</div>

								<div className="md:col-span-2">
									<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">
										Motivação do Processo
									</label>
									<div className="relative group">
										<select
											{...register('codigoMotivo', {
												required: 'Selecione um motivo',
												valueAsNumber: true,
											})}
											disabled={isLoading}
											className={`w-full px-5 py-4 bg-gray-50 border rounded-2xl text-xs font-black text-[#1e293b] uppercase tracking-widest focus:bg-white focus:outline-none focus:ring-4 transition-all duration-300 appearance-none cursor-pointer ${errors.codigoMotivo ? 'border-rose-200 focus:ring-rose-500/5' : 'border-gray-100 focus:ring-[#3964d7]/5'
												}`}
										>
											<option value="">Selecione uma Razão</option>
											{motivos.map((m) => (
												<option key={m.value} value={m.value}>{m.label}</option>
											))}
										</select>
										<div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
											<ChevronRight className="h-4 w-4 transform rotate-90" />
										</div>
									</div>
									{errors.codigoMotivo && <p className="mt-2 px-2 text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.codigoMotivo.message}</p>}
								</div>

								<div className="md:col-span-2">
									<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">
										Notas e Observações
									</label>
									<textarea
										{...register('obs')}
										disabled={isLoading}
										rows={4}
										placeholder="Espaço reservado para parecer técnico ou observações relevantes..."
										className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-medium text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 transition-all duration-300 resize-none placeholder:text-gray-300"
									/>
								</div>
							</div>

							{/* Banner Informativo */}
							<div className="mt-10 p-6 bg-linear-to-br from-[#3964d7] to-[#2d52b2] rounded-3xl relative overflow-hidden group shadow-xl shadow-[#3964d7]/20">
								<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl group-hover:scale-150 transition-transform duration-700"></div>
								<div className="relative z-10 flex items-start gap-4">
									<div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
										<AlertCircle className="h-5 w-5 text-white" />
									</div>
									<div>
										<h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-1">Implicação Regulamentar</h4>
										<p className="text-[10px] font-medium text-blue-100/80 leading-relaxed uppercase tracking-widest">
											A finalização deste processo alterará permanentemente o estatuto académico do discente nesta instituição, marcando-o como "Transferido" nos registos oficiais.
										</p>
									</div>
								</div>
							</div>
						</div>
					</form>

					{/* Footer */}
					<div className="px-8 py-8 bg-white border-t border-gray-100 flex gap-4 shrink-0">
						<button
							type="button"
							onClick={onClose}
							disabled={isLoading}
							className="flex-1 px-8 py-4 bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 hover:text-gray-600 transition-all duration-300 disabled:opacity-50 active:scale-95"
						>
							Interromper
						</button>
						<button
							type="button"
							onClick={handleSubmit(handleFormSubmit)}
							disabled={isLoading}
							className="flex-2 px-8 py-4 bg-[#3964d7] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-[#2d52b2] transition-all duration-300 shadow-xl shadow-[#3964d7]/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
						>
							{isLoading ? (
								<>
									<div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									Processando...
								</>
							) : (
								<>
									<FileText className="h-4 w-4" />
									{isEditMode ? 'Gravar Alterações' : 'Confirmar e Gerar Guia'}
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
