import { X, Search, Plus, Building, CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { IConfirmation, IConfirmationInput } from '../../types/confirmation.types'
import { useMatriculas } from '../../hooks/useMatricula'
import { useTurmas } from '../../hooks/useTurma'
import { useAnosLectivos } from '../../hooks/useAnoLectivo'
import { mockStatus } from '../../mocks/status.mock'

interface ConfirmationFormModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (data: IConfirmationInput) => void
	confirmation?: IConfirmation | null
	isLoading: boolean
}

export default function ConfirmationFormModal({
	isOpen,
	onClose,
	onSubmit,
	confirmation,
	isLoading,
}: ConfirmationFormModalProps) {
	const isEditMode = !!confirmation
	const [searchTerm, setSearchTerm] = useState('')
	const [turmaSearchTerm, setTurmaSearchTerm] = useState('')
	const [debouncedTurmaSearch, setDebouncedTurmaSearch] = useState('')
	const [selectedMatricula, setSelectedMatricula] = useState<{
		codigo: number
		aluno: string
		curso: string
	} | null>(null)
	const [selectedTurma, setSelectedTurma] = useState<{
		codigo: number
		designacao: string
		classe?: string
		curso?: string
	} | null>(null)
	const [showMatriculaList, setShowMatriculaList] = useState(false)
	const [showTurmaList, setShowTurmaList] = useState(false)

	// Debounce para busca de turmas
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedTurmaSearch(turmaSearchTerm)
		}, 500) // Espera 500ms após parar de digitar

		return () => clearTimeout(timer)
	}, [turmaSearchTerm])

	// Buscar matrículas
	const { data: matriculasData, isLoading: isLoadingMatriculas } = useMatriculas({
		page: 1,
		limit: 50,
		search: searchTerm,
	})

	const matriculas = matriculasData?.data || []

	// Buscar turmas com debounce
	const { data: turmasData, isLoading: isLoadingTurmas } = useTurmas({
		page: 1,
		limit: 20,
		search: debouncedTurmaSearch,
	})
	const turmas = turmasData?.data || []

	// Buscar anos letivos
	const { data: anosLectivosData, isLoading: _isLoadingAnosLectivos } = useAnosLectivos({
		page: 1,
		limit: 100,
	})
	const anosLectivos = anosLectivosData?.data || []

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm<IConfirmationInput>({
		defaultValues: {
			codigo_Status: 1, // Status padrão: Ativo
		},
	})

	// Preenche o formulário quando está em modo de edição
	useEffect(() => {
		if (confirmation && isOpen) {
			setValue('codigo_Matricula', confirmation.codigo_Matricula)
			setValue('codigo_Turma', confirmation.codigo_Turma)
			setValue('codigo_Ano_lectivo', confirmation.codigo_Ano_lectivo)
			setValue('codigo_Status', confirmation.codigo_Status)
			setValue('classificacao', confirmation.classificacao || '')

			// Formata a data para o input datetime-local
			if (confirmation.data_Confirmacao && typeof confirmation.data_Confirmacao === 'string') {
				const date = new Date(confirmation.data_Confirmacao)
				const formattedDate = date.toISOString().slice(0, 16)
				setValue('data_Confirmacao', formattedDate)
			}

			// Formata mes_Comecar se existir
			if (confirmation.mes_Comecar && typeof confirmation.mes_Comecar === 'string') {
				const date = new Date(confirmation.mes_Comecar)
				const formattedDate = date.toISOString().slice(0, 16)
				setValue('mes_Comecar', formattedDate)
			}

			// Define a matrícula selecionada em modo de edição
			if (confirmation.tb_matriculas) {
				setSelectedMatricula({
					codigo: confirmation.codigo_Matricula,
					aluno: confirmation.tb_matriculas.tb_alunos?.nome || 'Aluno',
					curso: confirmation.tb_matriculas.tb_cursos?.designacao || 'Curso'
				})
			}

			// Define a turma selecionada em modo de edição
			if (confirmation.tb_turmas) {
				setSelectedTurma({
					codigo: confirmation.codigo_Turma,
					designacao: confirmation.tb_turmas.designacao || 'Turma',
					classe: confirmation.tb_turmas.tb_classes?.designacao,
					curso: undefined
				})
			}
		} else if (!isOpen) {
			reset()
			setSelectedMatricula(null)
			setSelectedTurma(null)
			setSearchTerm('')
			setTurmaSearchTerm('')
			setShowMatriculaList(false)
			setShowTurmaList(false)
		}
	}, [confirmation, isOpen, setValue, reset])

	// Handler para selecionar uma matrícula
	const handleSelectMatricula = (matricula: {
		codigo: number
		aluno: string
		curso: string
	}) => {
		setSelectedMatricula(matricula)
		setValue('codigo_Matricula', matricula.codigo)
		setShowMatriculaList(false)
		setSearchTerm('')
	}

	// Handler para selecionar uma turma
	const handleSelectTurma = (turma: {
		codigo: number
		designacao: string
		classe?: string
		curso?: string
	}) => {
		setSelectedTurma(turma)
		setValue('codigo_Turma', turma.codigo)
		setShowTurmaList(false)
		setTurmaSearchTerm('')
	}

	// Fechar listas ao clicar fora
	useEffect(() => {
		const handleClickOutside = () => {
			if (showMatriculaList) {
				setShowMatriculaList(false)
			}
			if (showTurmaList) {
				setShowTurmaList(false)
			}
		}

		if (showMatriculaList || showTurmaList) {
			document.addEventListener('click', handleClickOutside)
		}

		return () => {
			document.removeEventListener('click', handleClickOutside)
		}
	}, [showMatriculaList, showTurmaList])

	const handleFormSubmit = (data: IConfirmationInput) => {
		// Converte as datas para ISO string
		const formattedData = {
			...data,
			data_Confirmacao: new Date(data.data_Confirmacao).toISOString(),
			mes_Comecar: data.mes_Comecar ? new Date(data.mes_Comecar).toISOString() : null,
			codigo_Utilizador: 1, // TODO: Pegar do contexto de autenticação
		}
		onSubmit(formattedData)
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<div className="flex min-h-screen items-center justify-center p-4">
				<div
					className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm transition-opacity"
					onClick={isLoading ? undefined : onClose}
				/>

				<div className="relative bg-[#f8fafc] rounded-4xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-white/20 slide-in-bottom">
					{/* Header */}
					<div className="flex items-center justify-between p-8 bg-white border-b border-gray-100 shrink-0">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-2xl bg-[#3964d7]/10 flex items-center justify-center">
								<Plus className={`h-6 w-6 text-[#3964d7] transition-transform duration-500 ${isEditMode ? 'rotate-45' : ''}`} />
							</div>
							<div>
								<h2 className="text-xl font-black text-[#1e293b]">
									{isEditMode ? 'Editar Confirmação' : 'Registar Confirmação'}
								</h2>
								<p className="text-[10px] font-black text-[#3964d7] uppercase tracking-widest mt-0.5">
									Módulo de Gestão Académica
								</p>
							</div>
						</div>
						<button
							onClick={onClose}
							disabled={isLoading}
							className="p-3 bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all duration-300 disabled:opacity-50"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto p-8 lg:p-10">
						<div className="space-y-8">
							{/* Seção 1: Seleção de Matrícula */}
							<div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
								<div className="flex items-center gap-3 mb-6">
									<div className="w-10 h-10 rounded-xl bg-[#3964d7]/5 flex items-center justify-center">
										<Search className="h-5 w-5 text-[#3964d7]" />
									</div>
									<div>
										<h3 className="text-sm font-black text-[#1e293b] uppercase tracking-widest">Aluno & Matrícula</h3>
										<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identificação do Beneficiário</p>
									</div>
								</div>

								<div className="space-y-4">
									{isEditMode ? (
										<div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
											<div className="w-12 h-12 rounded-xl bg-[#3964d7] flex items-center justify-center text-white font-black text-lg">
												{selectedMatricula?.aluno.charAt(0).toUpperCase()}
											</div>
											<div>
												<p className="text-sm font-bold text-[#1e293b]">{selectedMatricula?.aluno}</p>
												<p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{selectedMatricula?.curso}</p>
											</div>
										</div>
									) : (
										<div className="relative">
											{!selectedMatricula ? (
												<div className="relative group">
													<Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#3964d7] transition-colors" />
													<input
														type="text"
														placeholder="Pesquisar por aluno ou número de matrícula..."
														value={searchTerm}
														onChange={(e) => {
															setSearchTerm(e.target.value)
															setShowMatriculaList(true)
														}}
														onFocus={() => setShowMatriculaList(true)}
														disabled={isLoading}
														className={`w-full pl-14 pr-4 py-4 bg-gray-50 border rounded-2xl text-sm font-bold text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 transition-all duration-300 ${errors.codigo_Matricula ? 'border-rose-200' : 'border-gray-100'
															}`}
													/>
												</div>
											) : (
												<div className="flex items-center justify-between p-4 bg-[#3964d7]/5 border border-[#3964d7]/10 rounded-2xl">
													<div className="flex items-center gap-4">
														<div className="w-12 h-12 rounded-xl bg-[#3964d7] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#3964d7]/20">
															{selectedMatricula.aluno.charAt(0).toUpperCase()}
														</div>
														<div>
															<p className="text-sm font-bold text-[#1e293b]">{selectedMatricula.aluno}</p>
															<p className="text-[10px] font-black text-[#3964d7] uppercase tracking-widest">{selectedMatricula.curso}</p>
														</div>
													</div>
													<button
														type="button"
														onClick={() => {
															setSelectedMatricula(null)
															setValue('codigo_Matricula', 0)
															setSearchTerm('')
														}}
														className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
													>
														<X className="h-4 w-4" />
													</button>
												</div>
											)}

											{/* Dropdown de Resultados de Matrícula */}
											{showMatriculaList && searchTerm && !selectedMatricula && (
												<div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2">
													{isLoadingMatriculas ? (
														<div className="p-8 text-center">
															<div className="w-8 h-8 border-4 border-[#3964d7] border-t-transparent rounded-full animate-spin mx-auto"></div>
															<p className="mt-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Buscando registros...</p>
														</div>
													) : matriculas.length > 0 ? (
														<div className="p-2">
															{matriculas.map((m) => (
																<button
																	key={m.codigo}
																	type="button"
																	onClick={() => handleSelectMatricula({
																		codigo: m.codigo,
																		aluno: m.tb_alunos?.nome || 'Registo sem nome',
																		curso: m.tb_cursos?.designacao || 'Curso não definido'
																	})}
																	className="w-full flex items-center gap-4 p-4 hover:bg-[#3964d7]/5 rounded-2xl transition-all text-left group"
																>
																	<div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-bold group-hover:bg-[#3964d7] group-hover:text-white transition-all">
																		{m.tb_alunos?.nome?.charAt(0).toUpperCase() || 'A'}
																	</div>
																	<div>
																		<p className="text-sm font-bold text-[#1e293b] group-hover:text-[#3964d7] transition-colors">{m.tb_alunos?.nome}</p>
																		<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{m.tb_cursos?.designacao}</p>
																	</div>
																</button>
															))}
														</div>
													) : (
														<div className="p-8 text-center">
															<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nenhum aluno localizado</p>
														</div>
													)}
												</div>
											)}
										</div>
									)}
									{errors.codigo_Matricula && !selectedMatricula && (
										<p className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-2">Campo obrigatório</p>
									)}
								</div>
							</div>

							{/* Seção 2: Dados Académicos */}
							<div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
								<div className="flex items-center gap-3 mb-8">
									<div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
										<Building className="h-5 w-5 text-amber-500" />
									</div>
									<div>
										<h3 className="text-sm font-black text-[#1e293b] uppercase tracking-widest">Configuração Académica</h3>
										<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Turma e Calendário</p>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
									{/* Turma */}
									<div className="space-y-2">
										<label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Turma de Alocação</label>
										<div className="relative">
											{!selectedTurma ? (
												<div className="relative group">
													<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#3964d7] transition-colors" />
													<input
														type="text"
														placeholder="Pesquisar turma..."
														value={turmaSearchTerm}
														onChange={(e) => {
															setTurmaSearchTerm(e.target.value)
															setShowTurmaList(true)
														}}
														onFocus={() => setShowTurmaList(true)}
														disabled={isLoading}
														className={`w-full pl-11 pr-4 py-4 bg-gray-50 border rounded-2xl text-sm font-bold text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 transition-all duration-300 ${errors.codigo_Turma ? 'border-rose-200' : 'border-gray-100'
															}`}
													/>
												</div>
											) : (
												<div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-2xl group">
													<div>
														<p className="text-sm font-bold text-[#1e293b]">{selectedTurma.designacao}</p>
														<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
															{selectedTurma.classe ? `${selectedTurma.classe} • ` : ''}{selectedTurma.curso || 'Curso N/A'}
														</p>
													</div>
													<button
														type="button"
														onClick={() => {
															setSelectedTurma(null)
															setValue('codigo_Turma', 0)
															setTurmaSearchTerm('')
														}}
														className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
													>
														<X className="h-4 w-4" />
													</button>
												</div>
											)}

											{showTurmaList && !selectedTurma && (
												<div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
													{isLoadingTurmas ? (
														<div className="p-6 text-center">
															<div className="w-6 h-6 border-3 border-[#3964d7] border-t-transparent rounded-full animate-spin mx-auto"></div>
														</div>
													) : turmas.length > 0 ? (
														<div className="p-2">
															{turmas.map((t) => (
																<button
																	key={t.codigo}
																	type="button"
																	onClick={() => handleSelectTurma({
																		codigo: t.codigo,
																		designacao: t.designacao,
																		classe: t.tb_classes?.designacao,
																		curso: t.tb_cursos?.designacao
																	})}
																	className="w-full p-4 hover:bg-[#3964d7]/5 rounded-2xl transition-all text-left"
																>
																	<p className="text-sm font-bold text-[#1e293b]">{t.designacao}</p>
																	<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.tb_classes?.designacao} • {t.tb_cursos?.designacao}</p>
																</button>
															))}
														</div>
													) : (
														<div className="p-6 text-center">
															<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nenhuma turma</p>
														</div>
													)}
												</div>
											)}
										</div>
										{errors.codigo_Turma && !selectedTurma && (
											<p className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">Seleção necessária</p>
										)}
									</div>

									{/* Ano Lectivo */}
									<div className="space-y-2">
										<label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Ciclo Académico</label>
										<select
											{...register('codigo_Ano_lectivo', {
												required: 'Ano letivo é obrigatório',
												valueAsNumber: true,
											})}
											disabled={isLoading}
											className={`w-full px-5 py-4 bg-gray-50 border rounded-2xl text-sm font-bold text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 transition-all appearance-none ${errors.codigo_Ano_lectivo ? 'border-rose-200' : 'border-gray-100'
												}`}
										>
											<option value="">Selecione o Ciclo...</option>
											{anosLectivos.map((ano) => (
												<option key={ano.codigo} value={ano.codigo}>{ano.designacao}</option>
											))}
										</select>
									</div>

									{/* Data de Confirmação */}
									<div className="space-y-2">
										<label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Data de Registro</label>
										<input
											type="datetime-local"
											{...register('data_Confirmacao', { required: true })}
											disabled={isLoading}
											className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 transition-all"
										/>
									</div>

									{/* Mês Começar */}
									<div className="space-y-2">
										<label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Início das Aulas</label>
										<input
											type="datetime-local"
											{...register('mes_Comecar')}
											disabled={isLoading}
											className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 transition-all"
										/>
									</div>

									{/* Status */}
									<div className="space-y-2">
										<label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Estado da Confirmação</label>
										<select
											{...register('codigo_Status', { required: true, valueAsNumber: true })}
											disabled={isLoading}
											className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 transition-all appearance-none"
										>
											{mockStatus.map((s) => (
												<option key={s.codigo} value={s.codigo}>{s.designacao}</option>
											))}
										</select>
									</div>

									{/* Classificação */}
									<div className="space-y-2">
										<label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Qualificação / Resultado</label>
										<select
											{...register('classificacao')}
											disabled={isLoading}
											className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-[#1e293b] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 transition-all appearance-none"
										>
											<option value="">Nenhuma / Em Processo</option>
											<option value="Aprovado">Aprovado</option>
											<option value="Pendente">Pendente</option>
											<option value="Reprovado">Reprovado</option>
										</select>
									</div>
								</div>
							</div>

							{/* Banner Informativo */}
							<div className="bg-linear-to-r from-[#3964d7] to-[#2d52b2] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-[#3964d7]/20">
								<div className="relative z-10 flex items-start gap-4">
									<div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
										<CheckCircle className="h-5 w-5 text-white" />
									</div>
									<div>
										<h4 className="text-sm font-black uppercase tracking-widest mb-2">Protocolo Operacional</h4>
										<p className="text-sm text-white/80 leading-relaxed font-medium">
											O registro de confirmação é o ato final que vincula oficialmentre o discente à sua unidade curricular e turma.
											Certifique-se de que todos os dados financeiros e documentos prévios estão em conformidade.
										</p>
									</div>
								</div>
								<div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
								<div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
							</div>
						</div>
					</form>

					{/* Footer */}
					<div className="p-8 bg-white border-t border-gray-100 flex items-center justify-end gap-4 shrink-0 shadow-[0_-8px_30px_rgb(0,0,0,0.02)]">
						<button
							type="button"
							onClick={onClose}
							disabled={isLoading}
							className="px-10 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#1e293b] transition-all disabled:opacity-50"
						>
							Cancelar Registro
						</button>
						<button
							type="submit"
							onClick={handleSubmit(handleFormSubmit)}
							disabled={isLoading}
							className="relative px-12 py-4 bg-[#3964d7] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#2d52b2] transition-all duration-300 shadow-[0_8px_16px_-4px_rgba(57,100,215,0.4)] hover:shadow-[0_12px_20px_-4px_rgba(57,100,215,0.5)] active:scale-95 disabled:opacity-50 min-w-[220px]"
						>
							{isLoading ? (
								<div className="flex items-center justify-center gap-2">
									<div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
									<span>Processando...</span>
								</div>
							) : (
								<span>{isEditMode ? 'Guardar Alterações' : 'Concluir Registro'}</span>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
