import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { GraduationCap, ArrowLeft, Save, User, BookOpen, Calendar, AlertCircle } from 'lucide-react'
import { useCreateMatricula } from '../../../hooks/useMatricula'
import { useCourses } from '../../../hooks/useCourse'
import { useStudents } from '../../../hooks/useStudent'
import { useAuth } from '../../../hooks/useAuth'
import Container from '../../../components/layout/Container'
import Input from '../../../components/common/Input'
import Button from '../../../components/common/Button'
import type { IMatriculaInput } from '../../../types/matricula.types'
import { mockStatus } from '../../../mocks/status.mock'

// Validation Schema
const addMatriculaSchema = yup.object().shape({
	codigo_Aluno: yup.number().required('Aluno é obrigatório').min(1, 'Selecione um aluno'),
	codigo_Curso: yup.number().required('Curso é obrigatório').min(1, 'Selecione um curso'),
	data_Matricula: yup.string().required('Data de matrícula é obrigatória'),
	codigoStatus: yup.number().required('Status é obrigatório').min(1, 'Selecione um status'),
})

type AddMatriculaFormData = yup.InferType<typeof addMatriculaSchema>

export default function AddMatricula() {
	const navigate = useNavigate()
	const { user } = useAuth()
	const [searchAluno, setSearchAluno] = useState('')
	const [searchCurso, setSearchCurso] = useState('')
	const [debouncedSearchAluno, setDebouncedSearchAluno] = useState('')
	const [debouncedSearchCurso, setDebouncedSearchCurso] = useState('')
	const [showAlunoResults, setShowAlunoResults] = useState(false)
	const [showCursoResults, setShowCursoResults] = useState(false)
	const [selectedAlunoId, setSelectedAlunoId] = useState<number>(0)
	const [selectedCursoId, setSelectedCursoId] = useState<number>(0)
	const [isCreating, setIsCreating] = useState(false)

	const createMatricula = useCreateMatricula()

	// Debounce para evitar muitas requisições
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchAluno(searchAluno)
		}, 500) // Espera 500ms após parar de digitar

		return () => clearTimeout(timer)
	}, [searchAluno])

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchCurso(searchCurso)
		}, 500)

		return () => clearTimeout(timer)
	}, [searchCurso])

	// Buscar alunos e cursos usando a busca da API (com debounce)
	const { data: studentsData, isLoading: loadingStudents } = useStudents({
		page: 1,
		limit: 20,
		search: debouncedSearchAluno
	})
	const { data: coursesData, isLoading: loadingCourses } = useCourses({
		page: 1,
		limit: 20,
		search: debouncedSearchCurso
	})

	const searchResults = {
		students: studentsData?.data || [],
		courses: coursesData?.data || []
	}

	// Encontrar aluno e curso selecionados
	const selectedAluno = searchResults.students.find(s => s.codigo === selectedAlunoId)
	const selectedCurso = searchResults.courses.find(c => c.codigo === selectedCursoId)

	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting }
	} = useForm<AddMatriculaFormData>({
		resolver: yupResolver(addMatriculaSchema),
		mode: 'onChange',
		defaultValues: {
			codigo_Aluno: 0,
			codigo_Curso: 0,
			data_Matricula: new Date().toISOString().split('T')[0],
			codigoStatus: 1,
		}
	})

	// Handlers para seleção de aluno
	const handleSelectAluno = (aluno: typeof searchResults.students[0]) => {
		setSelectedAlunoId(aluno.codigo)
		setSearchAluno(aluno.nome)
		setShowAlunoResults(false)
		setValue('codigo_Aluno', aluno.codigo)
	}

	// Handlers para seleção de curso
	const handleSelectCurso = (curso: typeof searchResults.courses[0]) => {
		setSelectedCursoId(curso.codigo)
		setSearchCurso(curso.designacao)
		setShowCursoResults(false)
		setValue('codigo_Curso', curso.codigo)
	}

	const onSubmit: SubmitHandler<AddMatriculaFormData> = async (data) => {
		// Validar se aluno e curso foram selecionados
		if (!selectedAlunoId || selectedAlunoId === 0) {
			alert('Por favor, selecione um aluno da lista de resultados')
			return
		}
		if (!selectedCursoId || selectedCursoId === 0) {
			alert('Por favor, selecione um curso da lista de resultados')
			return
		}

		setIsCreating(true)

		try {
			const matriculaData: IMatriculaInput = {
				codigo_Aluno: selectedAlunoId,
				codigo_Curso: selectedCursoId,
				data_Matricula: new Date(data.data_Matricula).toISOString(),
				codigo_Utilizador: user?.id ? (typeof user.id === 'number' ? user.id : parseInt(user.id)) : 1,
				codigoStatus: data.codigoStatus,
			}

			await createMatricula.mutateAsync(matriculaData)
			navigate('/admin/student-management/enrolls')
		} catch (error) {
			console.error('Erro ao criar matrícula:', error)
		} finally {
			setIsCreating(false)
		}
	}

	return (
		<Container>
			<div className="space-y-8">
				{/* Header */}
				<div className="bg-white rounded-3xl border border-gray-100 p-8">
					<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
						<div className="flex items-center gap-6">
							<button
								onClick={() => navigate(-1)}
								className="p-3 bg-gray-50 text-gray-400 hover:text-[#3964d7] hover:bg-[#3964d7]/5 rounded-xl transition-all duration-300"
								type="button"
							>
								<ArrowLeft className="h-5 w-5" />
							</button>
							<div className="flex items-center gap-4">
								<div className="w-14 h-14 flex items-center justify-center bg-[#3964d7] rounded-2xl shadow-[0_8px_16px_-4px_rgba(57,100,215,0.4)]">
									<GraduationCap className="h-7 w-7 text-white" />
								</div>
								<div>
									<h1 className="text-2xl font-black text-[#1e293b] leading-tight">
										Nova Matrícula
									</h1>
									<div className="flex items-center gap-2 mt-1">
										<span className="text-[10px] text-[#3964d7] font-black uppercase tracking-widest">Inscrição Académica</span>
										<div className="w-1 h-1 bg-gray-300 rounded-full"></div>
										<span className="text-[10px] text-gray-400 font-bold">Registro de Matrícula</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
					{/* Informações da Matrícula */}
					<div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-8">
						<div>
							<div className="flex items-center gap-3 mb-1">
								<div className="w-1 h-4 bg-[#3964d7] rounded-full"></div>
								<h2 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Configuração da Matrícula</h2>
							</div>
							<p className="text-sm font-medium text-gray-500">Selecione o aluno e o curso para a matrícula</p>
						</div>

						{/* Seleção de Aluno */}
						<div className="space-y-4">
							<label className="block text-gray-600 text-[14px] font-bold tracking-tight">
								<User className="inline h-4 w-4 mr-1 text-[#3964d7]" />
								Aluno <span className="text-red-500">*</span>
							</label>

							{/* Campo de pesquisa de aluno com autocomplete */}
							<div className="relative group">
								<div className="relative">
									<Input
										type="text"
										placeholder="Digite para pesquisar aluno..."
										value={searchAluno}
										onChange={(e) => {
											const value = e.target.value
											setSearchAluno(value)
											setShowAlunoResults(value.length > 0)
											if (value.length === 0) {
												setSelectedAlunoId(0)
											}
										}}
										onFocus={() => searchAluno.length > 0 && setShowAlunoResults(true)}
										autoComplete="off"
										className="pr-12"
									/>

									{(loadingStudents || (searchAluno !== debouncedSearchAluno && searchAluno.length > 0)) && (
										<div className="absolute right-4 top-1/2 transform -translate-y-1/2">
											<div className="animate-spin h-5 w-5 border-2 border-[#3964d7] border-t-transparent rounded-full"></div>
										</div>
									)}
								</div>

								{/* Dropdown de resultados */}
								{showAlunoResults && searchAluno.length > 0 && (
									<div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-64 overflow-y-auto p-2 space-y-1 slide-in-bottom">
										{searchResults.students.length > 0 ? (
											<>
												<div className="px-4 py-2 text-[10px] text-gray-400 font-black uppercase tracking-wider border-b border-gray-50 mb-1">
													{searchResults.students.length} aluno(s) encontrado(s)
												</div>
												{searchResults.students.map((student) => (
													<button
														key={student.codigo}
														type="button"
														onClick={() => handleSelectAluno(student)}
														className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-all group/item"
													>
														<div className="font-bold text-[#1e293b] group-hover/item:text-[#3964d7]">{student.nome}</div>
														<div className="text-[11px] text-gray-400 font-medium flex items-center gap-3 mt-0.5">
															<span>{student.sexo}</span>
															<div className="w-1 h-1 bg-gray-300 rounded-full"></div>
															<span>{student.email || 'Sem email'}</span>
															<div className="w-1 h-1 bg-gray-300 rounded-full"></div>
															<span>{student.telefone || 'Sem telefone'}</span>
														</div>
													</button>
												))}
											</>
										) : !loadingStudents ? (
											<div className="px-4 py-8 text-center">
												<User className="h-8 w-8 text-gray-200 mx-auto mb-2" />
												<p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Nenhum aluno encontrado</p>
											</div>
										) : null}
									</div>
								)}
							</div>

							{!selectedAlunoId && searchAluno && (
								<p className="text-[12px] font-bold text-amber-600 flex items-center gap-1.5 px-1">
									<div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
									Selecione um aluno da lista de resultados
								</p>
							)}

							{/* Informações do aluno selecionado */}
							{selectedAluno && (
								<div className="mt-4 p-6 bg-[#3964d7]/5 rounded-3xl border border-[#3964d7]/10 flex items-center gap-6 animate-in fade-in zoom-in duration-300">
									<div className="h-16 w-16 rounded-2xl bg-[#3964d7] flex items-center justify-center text-white text-2xl font-black shadow-[0_8px_16px_-4px_rgba(57,100,215,0.4)]">
										{selectedAluno.nome.charAt(0).toUpperCase()}
									</div>
									<div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
										<div>
											<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Aluno Selecionado</p>
											<p className="text-sm font-bold text-[#1e293b] truncate">{selectedAluno.nome}</p>
										</div>
										<div>
											<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Género</p>
											<p className="text-sm font-bold text-[#1e293b]">{selectedAluno.sexo}</p>
										</div>
										<div className="md:col-span-2">
											<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contacto</p>
											<p className="text-sm font-bold text-[#1e293b] truncate">{selectedAluno.email || selectedAluno.telefone || 'N/A'}</p>
										</div>
									</div>
								</div>
							)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{/* Seleção de Curso */}
							<div className="space-y-4">
								<label className="block text-gray-600 text-[14px] font-bold tracking-tight">
									<BookOpen className="inline h-4 w-4 mr-1 text-[#3964d7]" />
									Curso <span className="text-red-500">*</span>
								</label>

								{/* Campo de pesquisa de curso com autocomplete */}
								<div className="relative group">
									<div className="relative">
										<Input
											type="text"
											placeholder="Digite para pesquisar curso..."
											value={searchCurso}
											onChange={(e) => {
												const value = e.target.value
												setSearchCurso(value)
												setShowCursoResults(value.length > 0)
												if (value.length === 0) {
													setSelectedCursoId(0)
												}
											}}
											onFocus={() => searchCurso.length > 0 && setShowCursoResults(true)}
											autoComplete="off"
										/>

										{(loadingCourses || (searchCurso !== debouncedSearchCurso && searchCurso.length > 0)) && (
											<div className="absolute right-4 top-1/2 transform -translate-y-1/2">
												<div className="animate-spin h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
											</div>
										)}
									</div>

									{/* Dropdown de resultados */}
									{showCursoResults && searchCurso.length > 0 && (
										<div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-64 overflow-y-auto p-2 space-y-1 slide-in-bottom">
											{searchResults.courses.length > 0 ? (
												<>
													<div className="px-4 py-2 text-[10px] text-gray-400 font-black uppercase tracking-wider border-b border-gray-50 mb-1">
														{searchResults.courses.length} curso(s) encontrado(s)
													</div>
													{searchResults.courses.map((course) => (
														<button
															key={course.codigo}
															type="button"
															onClick={() => handleSelectCurso(course)}
															className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-all group/item"
														>
															<div className="font-bold text-[#1e293b] group-hover/item:text-[#3964d7]">{course.designacao}</div>
														</button>
													))}
												</>
											) : !loadingCourses ? (
												<div className="px-4 py-8 text-center text-gray-400 text-sm font-bold uppercase tracking-widest">
													Nenhum curso encontrado
												</div>
											) : null}
										</div>
									)}
								</div>

								{!selectedCursoId && searchCurso && (
									<p className="text-[12px] font-bold text-amber-600 flex items-center gap-1.5 px-1">
										<div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
										Selecione um curso da lista de resultados
									</p>
								)}

								{/* Informações do curso selecionado */}
								{selectedCurso && (
									<div className="mt-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4 animate-in fade-in zoom-in duration-300">
										<div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
											<BookOpen className="h-5 w-5" />
										</div>
										<div>
											<p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-0.5">Curso Selecionado</p>
											<p className="text-sm font-bold text-emerald-700">{selectedCurso.designacao}</p>
										</div>
									</div>
								)}
							</div>

							<div className="grid grid-cols-1 gap-6">
								{/* Data de Matrícula */}
								<div className="space-y-4">
									<label className="block text-gray-600 text-[14px] font-bold tracking-tight">
										<Calendar className="inline h-4 w-4 mr-1 text-[#3964d7]" />
										Data de Matrícula <span className="text-red-500">*</span>
									</label>
									<Controller
										name="data_Matricula"
										control={control}
										render={({ field }) => (
											<input
												type="date"
												{...field}
												className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 focus:border-[#3964d7]/50 transition-all duration-300"
											/>
										)}
									/>
									{errors.data_Matricula && (
										<p className="text-red-500 text-[12px] font-bold mt-1.5">{errors.data_Matricula.message}</p>
									)}
								</div>

								{/* Status */}
								<div className="space-y-4">
									<label className="block text-gray-600 text-[14px] font-bold tracking-tight">Status da Matrícula</label>
									<Controller
										name="codigoStatus"
										control={control}
										render={({ field }) => (
											<select
												{...field}
												onChange={(e) => field.onChange(parseInt(e.target.value))}
												className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 focus:border-[#3964d7]/50 transition-all duration-300"
											>
												<option value="">Selecione o status</option>
												{mockStatus.map((status) => (
													<option key={status.codigo} value={status.codigo}>
														{status.designacao}
													</option>
												))}
											</select>
										)}
									/>
									{errors.codigoStatus && (
										<p className="text-red-500 text-[12px] font-bold mt-1.5">{errors.codigoStatus.message}</p>
									)}
								</div>
							</div>
						</div>

						{/* Informação Importante */}
						<div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100/50 flex items-start gap-4">
							<AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
							<div className="space-y-1">
								<h4 className="text-[11px] font-black text-amber-900 uppercase tracking-widest leading-none">Atenção Necessária</h4>
								<p className="text-xs text-amber-800 font-medium leading-relaxed">
									Após criar a matrícula, será necessário efectuar a <strong>confirmação do aluno</strong> em uma turma específica para completar o processo académico.
								</p>
							</div>
						</div>
					</div>

					{/* Botões de Ação */}
					<div className="flex items-center justify-end gap-4 pt-4">
						<Button
							type="button"
							variant="secondary"
							onClick={() => navigate(-1)}
							disabled={isSubmitting}
							className="px-10"
						>
							Descartar
						</Button>
						<Button
							type="submit"
							loading={isSubmitting || isCreating || createMatricula.isPending}
							disabled={isSubmitting || isCreating || createMatricula.isPending || !selectedAlunoId || !selectedCursoId}
							className="px-10 bg-[#3964d7] hover:bg-[#2d52b2] shadow-[0_8px_20px_-6px_rgba(57,100,215,0.4)]"
						>
							<Save className="h-4 w-4 mr-2" />
							Confirmar Matrícula
						</Button>
					</div>
				</form>
			</div>
		</Container>
	)
}
