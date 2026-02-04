import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'react-toastify'
import {
	UserCog,
	ArrowLeft,
	Save,
	User,
	FileText,
	Users,
	AlertCircle
} from 'lucide-react'
import { useStudent, useUpdateStudent } from '../../../hooks/useStudent'
import type { Student } from '../../../types/student.types'
import { useDocumentTypes } from '../../../hooks/useDocument'
import { useProfessions } from '../../../hooks/useProfession'
import Container from '../../../components/layout/Container'
import Input from '../../../components/common/Input'
import Button from '../../../components/common/Button'
import {
	useGeographicFormData,
	useEnderecoCompleto,
	useComunas,
	useMunicipios
} from '../../../hooks/useGeographic'
import { mockStatus } from '../../../mocks/status.mock'

// Validation Schema - Mesmo do AddStudent
const editStudentSchema = yup.object().shape({
	nome: yup.string().required('Nome completo é obrigatório').max(200),
	pai: yup.string().max(200).default(''),
	mae: yup.string().max(200).default(''),
	sexo: yup.string().oneOf(['M', 'F']).required('Sexo é obrigatório'),
	dataNascimento: yup.date().nullable().default(null),
	email: yup.string().email('Email inválido').max(45).nullable().transform((value) => value || null).default(''),
	telefone: yup.string().max(45).default(''),
	codigo_Nacionalidade: yup.number().required('Nacionalidade é obrigatória'),
	codigo_Estado_Civil: yup.number().required('Estado civil é obrigatório'),
	codigo_Comuna: yup.number().required('Comuna é obrigatória'),
	codigoTipoDocumento: yup.number().required('Tipo de documento é obrigatório'),
	n_documento_identificacao: yup.string().max(45).default(''),
	morada: yup.string().max(60).default('...'),
	saldo: yup.number().min(0).default(0),
	codigo_Status: yup.number().default(1),
	provincia: yup.string().default(''),
	municipio: yup.string().default(''),
	encarregado: yup.object().shape({
		nome: yup.string().required('Nome do encarregado é obrigatório').max(250),
		telefone: yup.string().required('Telefone do encarregado é obrigatório').max(45),
		email: yup.string().email('Email inválido').max(45).nullable().transform((value) => value || null).default(''),
		codigo_Profissao: yup.number().required('Profissão é obrigatória'),
		local_Trabalho: yup.string().required('Local de trabalho é obrigatório').max(45),
		status: yup.number().default(1),
	}).required()
})

type EditStudentFormData = yup.InferType<typeof editStudentSchema>

export default function EditStudent() {
	const navigate = useNavigate()
	const { id } = useParams<{ id: string }>()
	const studentId = id ? parseInt(id) : 0

	const [activeTab, setActiveTab] = useState<'personal' | 'document' | 'guardian'>('personal')

	const { data: studentData, isLoading: loadingStudent, isError: errorStudent } = useStudent(studentId)
	const updateStudent = useUpdateStudent()

	const { nacionalidades, estadoCivil, isLoading: loadingGeographic } = useGeographicFormData()
	const { data: documentTypes = [], isLoading: loadingDocTypes } = useDocumentTypes()
	const { data: professions = [], isLoading: loadingProfessions } = useProfessions()

	// Buscar todas as comunas e municípios para encontrar província e município
	const { data: allComunas = [] } = useComunas()
	const { data: allMunicipios = [] } = useMunicipios()

	const { control, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<EditStudentFormData>({
		resolver: yupResolver(editStudentSchema),
		mode: 'onChange',
		defaultValues: {
			nome: '',
			pai: '',
			mae: '',
			sexo: undefined,
			dataNascimento: undefined,
			email: '',
			telefone: '',
			codigo_Nacionalidade: undefined,
			codigo_Estado_Civil: 1,
			codigo_Comuna: undefined,
			codigoTipoDocumento: 1,
			n_documento_identificacao: '',
			morada: '...',
			saldo: 0,
			codigo_Status: 1,
			provincia: '',
			municipio: '',
			encarregado: {
				nome: '',
				telefone: '',
				email: '',
				codigo_Profissao: undefined,
				local_Trabalho: '',
				status: 1
			}
		}
	})

	const watchProvincia = watch('provincia')
	const watchMunicipio = watch('municipio')

	const { provincias, municipios, comunas, isLoadingProvincias, isLoadingMunicipios, isLoadingComunas } = useEnderecoCompleto(
		watchProvincia ? parseInt(watchProvincia) : undefined,
		watchMunicipio ? parseInt(watchMunicipio) : undefined
	)

	useEffect(() => {
		if (studentData?.data && allComunas.length > 0 && allMunicipios.length > 0) {
			const student = studentData.data

			// Encontrar província e município a partir da comuna
			let provinciaId = ''
			let municipioId = ''

			if (student.codigo_Comuna) {
				const comuna = allComunas.find(c => c.codigo === student.codigo_Comuna)
				if (comuna) {
					municipioId = comuna.codigo_Municipio?.toString() || ''
					const municipio = allMunicipios.find(m => m.codigo === comuna.codigo_Municipio)
					if (municipio) {
						provinciaId = municipio.codigo_Provincia?.toString() || ''
					}
				}
			}

			// Converter sexo - pode vir como 'M', 'F', 'Masculino' ou 'Feminino'
			let sexoValue: 'M' | 'F' | undefined
			if (student.sexo === 'Masculino' || student.sexo === 'M') {
				sexoValue = 'M'
			} else if (student.sexo === 'Feminino' || student.sexo === 'F') {
				sexoValue = 'F'
			} else if (student.sexo) {
				// Se tiver valor mas não for reconhecido, tentar usar como está
				sexoValue = student.sexo as 'M' | 'F'
			}

			// Mapear dados do encarregado (vem como tb_encarregados da API)
			const encarregadoData = student.tb_encarregados || student.encarregado as any

			// Converter dataNascimento (pode vir como string ou objeto)
			let dataNascimentoValue: Date | undefined
			if (student.dataNascimento) {
				if (typeof student.dataNascimento === 'string') {
					dataNascimentoValue = new Date(student.dataNascimento)
				} else if (typeof student.dataNascimento === 'object') {
					// Se vier como objeto, tentar extrair valor
					const dateObj = student.dataNascimento as Record<string, unknown>
					if (dateObj.value && typeof dateObj.value === 'string') {
						dataNascimentoValue = new Date(dateObj.value)
					}
				}
			}

			reset({
				nome: student.nome || '',
				pai: student.pai || '',
				mae: student.mae || '',
				codigo_Nacionalidade: student.codigo_Nacionalidade,
				codigo_Estado_Civil: student.codigo_Estado_Civil || 1,
				dataNascimento: dataNascimentoValue,
				email: student.email || '',
				telefone: student.telefone || '',
				codigo_Comuna: student.codigo_Comuna,
				sexo: sexoValue,
				n_documento_identificacao: student.n_documento_identificacao || '',
				saldo: student.saldo || 0,
				morada: student.morada || '',
				codigoTipoDocumento: student.codigoTipoDocumento || 1,
				codigo_Status: student.codigo_Status || 1,
				provincia: provinciaId,
				municipio: municipioId,
				encarregado: {
					nome: encarregadoData?.nome || '',
					telefone: encarregadoData?.telefone || '',
					email: encarregadoData?.email || '',
					codigo_Profissao: encarregadoData?.codigo_Profissao || encarregadoData?.profissao?.codigo || undefined,
					local_Trabalho: encarregadoData?.local_Trabalho || encarregadoData?.localTrabalho || '',
					status: encarregadoData?.status || encarregadoData?.codigo_Status || 1
				}
			})
		}
	}, [studentData, allComunas, allMunicipios, reset])

	const onSubmit: SubmitHandler<EditStudentFormData> = async (data) => {
		try {
			// Remover provincia, municipio e preparar dados
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { provincia, municipio, encarregado, ...alunoData } = data

			// Função para remover campos vazios
			const removeEmptyFields = (obj: Record<string, any>) => {
				return Object.entries(obj).reduce((acc, [key, value]) => {
					if (value !== '' && value !== null && value !== undefined) {
						acc[key] = value
					}
					return acc
				}, {} as Record<string, any>)
			}

			// Preparar dados do aluno (remover campos vazios)
			const cleanedAlunoData = removeEmptyFields(alunoData)

			// Preparar dados do encarregado (remover campos vazios)
			const cleanedEncarregado = encarregado ? removeEmptyFields(encarregado) : undefined

			// Montar objeto final
			const studentData: any = {
				...cleanedAlunoData
			}

			// Adicionar encarregado apenas se tiver dados válidos
			if (cleanedEncarregado && Object.keys(cleanedEncarregado).length > 0) {
				studentData.encarregado = cleanedEncarregado
			}

			await updateStudent.mutateAsync({ id: studentId, studentData: studentData as unknown as Student })
			toast.success('Aluno atualizado com sucesso!')
			navigate('/admin/student-management')
		} catch (error: any) {
			toast.error(error?.message || 'Erro ao atualizar aluno')
		}
	}

	// Handler para capturar erros de validação do Yup
	const handleFormSubmit = handleSubmit(
		onSubmit,
		(errors) => {
			// Verificar erros em Dados Pessoais
			if (errors.nome || errors.sexo || errors.codigo_Nacionalidade || errors.codigo_Estado_Civil || errors.codigo_Comuna || errors.email) {
				const errorMsg = errors.nome?.message || errors.sexo?.message || errors.codigo_Nacionalidade?.message ||
					errors.codigo_Estado_Civil?.message || errors.codigo_Comuna?.message || errors.email?.message
				toast.error(errorMsg || 'Preencha os campos obrigatórios em Dados Pessoais')
				setActiveTab('personal')
			}
			// Verificar erros em Documentação
			else if (errors.codigoTipoDocumento || errors.n_documento_identificacao) {
				const errorMsg = errors.codigoTipoDocumento?.message || errors.n_documento_identificacao?.message
				toast.error(errorMsg || 'Preencha os campos obrigatórios em Documentação')
				setActiveTab('document')
			}
			// Verificar erros em Encarregado
			else if (errors.encarregado) {
				const errorMsg = errors.encarregado.nome?.message || errors.encarregado.telefone?.message ||
					errors.encarregado.email?.message || errors.encarregado.codigo_Profissao?.message ||
					errors.encarregado.local_Trabalho?.message
				toast.error(errorMsg || 'Preencha os campos obrigatórios do Encarregado')
				setActiveTab('guardian')
			}
		}
	)

	if (loadingStudent) {
		return (
			<Container>
				<div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-3xl border border-gray-100 p-20">
					<div className="relative w-16 h-16">
						<div className="absolute inset-0 border-4 border-[#3964d7]/10 rounded-full"></div>
						<div className="absolute inset-0 border-4 border-[#3964d7] border-t-transparent rounded-full animate-spin"></div>
					</div>
					<p className="mt-6 text-sm font-bold text-[#1e293b] animate-pulse uppercase tracking-[0.2em]">Obtendo registro...</p>
				</div>
			</Container>
		)
	}

	if (errorStudent || !studentData?.data) {
		return (
			<Container>
				<div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-3xl border border-gray-100 p-20">
					<div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
						<AlertCircle className="h-8 w-8 text-rose-500" />
					</div>
					<h2 className="text-xl font-black text-[#1e293b] mb-2 uppercase tracking-tight">Falha na Sincronização</h2>
					<p className="text-gray-500 font-medium mb-8 text-center max-w-sm">Não foi possível carregar os dados deste registro no momento.</p>
					<Button variant="secondary" onClick={() => navigate('/admin/student-management')}>
						<ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Listagem
					</Button>
				</div>
			</Container>
		)
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
									<UserCog className="h-7 w-7 text-white" />
								</div>
								<div>
									<h1 className="text-2xl font-black text-[#1e293b] leading-tight">
										Editar Perfil do Aluno
									</h1>
									<div className="flex items-center gap-2 mt-1">
										<span className="text-[10px] text-[#3964d7] font-black uppercase tracking-widest">Acesso Autorizado</span>
										<div className="w-1 h-1 bg-gray-300 rounded-full"></div>
										<span className="text-[10px] text-gray-400 font-bold">ID: #{studentId}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<form onSubmit={handleFormSubmit} className="space-y-8">
					{/* Tabs Navigation */}
					<div className="bg-white rounded-2xl border border-gray-100 p-2 flex overflow-x-auto no-scrollbar gap-2">
						<button
							type="button"
							onClick={() => setActiveTab('personal')}
							className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'personal'
								? 'bg-[#3964d7] text-white shadow-[0_8px_16px_-4px_rgba(57,100,215,0.4)]'
								: 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
								}`}
						>
							<User className="h-4 w-4" /> Dados Pessoais
						</button>
						<button
							type="button"
							onClick={() => setActiveTab('document')}
							className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'document'
								? 'bg-[#3964d7] text-white shadow-[0_8px_16px_-4px_rgba(57,100,215,0.4)]'
								: 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
								}`}
						>
							<FileText className="h-4 w-4" /> Documentação
						</button>
						<button
							type="button"
							onClick={() => setActiveTab('guardian')}
							className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'guardian'
								? 'bg-[#3964d7] text-white shadow-[0_8px_16px_-4px_rgba(57,100,215,0.4)]'
								: 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
								}`}
						>
							<Users className="h-4 w-4" /> Encarregado
						</button>
					</div>

					{activeTab === 'personal' && (
						<div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-8">
							<div>
								<div className="flex items-center gap-3 mb-1">
									<div className="w-1 h-4 bg-[#3964d7] rounded-full"></div>
									<h2 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Registro Civil</h2>
								</div>
								<p className="text-sm font-medium text-gray-500">Dados fundamentais do registro do estudante</p>
							</div>

							<div className="grid grid-cols-1 gap-6">
								<Controller
									name="nome"
									control={control}
									render={({ field }) => (
										<Input
											{...field}
											label="Nome Completo"
											placeholder="Identificação nominal total"
											error={errors.nome?.message}
										/>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Controller
									name="pai"
									control={control}
									render={({ field }) => (
										<Input
											{...field}
											label="Nome do Pai"
											placeholder="Filiação paterna"
										/>
									)}
								/>
								<Controller
									name="mae"
									control={control}
									render={({ field }) => (
										<Input
											{...field}
											label="Nome da Mãe"
											placeholder="Filiação materna"
										/>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-gray-600 text-[14px] font-bold tracking-tight mb-2.5">Género</label>
									<Controller name="sexo" control={control} render={({ field }) => (
										<select {...field} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 focus:border-[#3964d7]/50 transition-all duration-300">
											<option value="">Definir género</option>
											<option value="M">Masculino</option>
											<option value="F">Feminino</option>
										</select>
									)} />
									{errors.sexo && <p className="text-red-500 text-[12px] font-bold mt-1.5">{errors.sexo.message}</p>}
								</div>
								<div>
									<label className="block text-gray-600 text-[14px] font-bold tracking-tight mb-2.5">Data de Nascimento</label>
									<Controller name="dataNascimento" control={control} render={({ field }) => (
										<input
											type="date"
											{...field}
											value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
											onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
											className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 focus:border-[#3964d7]/50 transition-all duration-300"
										/>
									)} />
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Controller
									name="email"
									control={control}
									render={({ field }) => (
										<Input
											{...field}
											value={field.value || ''}
											label="Email de Contacto"
											type="email"
											placeholder="exemplo@dominio.com"
											error={errors.email?.message}
										/>
									)}
								/>
								<Controller
									name="telefone"
									control={control}
									render={({ field }) => (
										<Input
											{...field}
											label="Terminal Telefónico"
											placeholder="Contacto direto"
										/>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-gray-600 text-[14px] font-bold tracking-tight mb-2.5">Nacionalidade</label>
									<Controller name="codigo_Nacionalidade" control={control} render={({ field }) => (
										<select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} disabled={loadingGeographic} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 focus:border-[#3964d7]/50 transition-all duration-300 disabled:opacity-50">
											<option value="">{loadingGeographic ? 'Sincronizando...' : 'Seleccionar país'}</option>
											{nacionalidades.map((n) => <option key={n.codigo} value={n.codigo}>{n.designacao}</option>)}
										</select>
									)} />
									{errors.codigo_Nacionalidade && <p className="text-red-500 text-[12px] font-bold mt-1.5">{errors.codigo_Nacionalidade.message}</p>}
								</div>
								<div>
									<label className="block text-gray-600 text-[14px] font-bold tracking-tight mb-2.5">Estado Civil</label>
									<Controller name="codigo_Estado_Civil" control={control} render={({ field }) => (
										<select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} disabled={loadingGeographic} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 focus:border-[#3964d7]/50 transition-all duration-300 disabled:opacity-50">
											<option value="">{loadingGeographic ? 'Sincronizando...' : 'Seleccionar estado'}</option>
											{estadoCivil.map((e) => <option key={e.codigo} value={e.codigo}>{e.designacao}</option>)}
										</select>
									)} />
									{errors.codigo_Estado_Civil && <p className="text-red-500 text-[12px] font-bold mt-1.5">{errors.codigo_Estado_Civil.message}</p>}
								</div>
							</div>

							<div className="pt-6 border-t border-gray-100 space-y-6">
								<div>
									<div className="flex items-center gap-3 mb-1">
										<div className="w-1 h-4 bg-[#3964d7] rounded-full"></div>
										<h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Localização & Morada</h3>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div>
										<label className="block text-gray-600 text-[14px] font-bold tracking-tight mb-2.5">Província</label>
										<Controller name="provincia" control={control} render={({ field }) => (
											<select {...field} disabled={isLoadingProvincias} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 focus:border-[#3964d7]/50 transition-all duration-300 disabled:opacity-50">
												<option value="">{isLoadingProvincias ? 'Buscando...' : 'Seleccionar'}</option>
												{provincias.map((p) => <option key={p.codigo} value={p.codigo}>{p.designacao}</option>)}
											</select>
										)} />
									</div>
									<div>
										<label className="block text-gray-600 text-[14px] font-bold tracking-tight mb-2.5">Município</label>
										<Controller name="municipio" control={control} render={({ field }) => (
											<select {...field} disabled={!watchProvincia || isLoadingMunicipios} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 focus:border-[#3964d7]/50 transition-all duration-300 disabled:opacity-50">
												<option value="">{isLoadingMunicipios ? 'Buscando...' : !watchProvincia ? 'Aguardando Província' : 'Seleccionar'}</option>
												{municipios.map((m) => <option key={m.codigo} value={m.codigo}>{m.designacao}</option>)}
											</select>
										)} />
									</div>
									<div>
										<label className="block text-gray-600 text-[14px] font-bold tracking-tight mb-2.5">Comuna</label>
										<Controller name="codigo_Comuna" control={control} render={({ field }) => (
											<select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} disabled={!watchMunicipio || isLoadingComunas} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 focus:border-[#3964d7]/50 transition-all duration-300 disabled:opacity-50">
												<option value="">{isLoadingComunas ? 'Buscando...' : !watchMunicipio ? 'Aguardando Município' : 'Seleccionar Comuna'}</option>
												{comunas.map((c) => <option key={c.codigo} value={c.codigo}>{c.designacao}</option>)}
											</select>
										)} />
										{errors.codigo_Comuna && <p className="text-red-500 text-[12px] font-bold mt-1.5">{errors.codigo_Comuna.message}</p>}
									</div>
								</div>

								<Controller
									name="morada"
									control={control}
									render={({ field }) => (
										<Input
											{...field}
											label="Endereço Detalhado"
											placeholder="Rua, Bairro, Nº da casa..."
										/>
									)}
								/>
							</div>
						</div>
					)}

					{activeTab === 'document' && (
						<div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-8">
							<div>
								<div className="flex items-center gap-3 mb-1">
									<div className="w-1 h-4 bg-[#3964d7] rounded-full"></div>
									<h2 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Identificação Oficial</h2>
								</div>
								<p className="text-sm font-medium text-gray-500">Documentos e status do registro</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-gray-600 text-[14px] font-bold tracking-tight mb-2.5">Tipo de Documento</label>
									<Controller name="codigoTipoDocumento" control={control} render={({ field }) => (
										<select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} disabled={loadingDocTypes} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 focus:border-[#3964d7]/50 transition-all duration-300 disabled:opacity-50">
											<option value="">{loadingDocTypes ? 'Sincronizando...' : 'Seleccionar tipo'}</option>
											{documentTypes.map((d) => <option key={d.codigo} value={d.codigo}>{d.designacao}</option>)}
										</select>
									)} />
									{errors.codigoTipoDocumento && <p className="text-red-500 text-[12px] font-bold mt-1.5">{errors.codigoTipoDocumento.message}</p>}
								</div>
								<Controller
									name="n_documento_identificacao"
									control={control}
									render={({ field }) => (
										<Input
											{...field}
											label="Nº do Documento"
											placeholder="Ex: 007537847LA041"
											error={errors.n_documento_identificacao?.message}
										/>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-gray-600 text-[14px] font-bold tracking-tight mb-2.5">Estado do Registro</label>
									<Controller name="codigo_Status" control={control} render={({ field }) => (
										<select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 focus:border-[#3964d7]/50 transition-all duration-300">
											<option value="">Seleccionar status</option>
											{mockStatus.map((s) => <option key={s.codigo} value={s.codigo}>{s.designacao}</option>)}
										</select>
									)} />
								</div>
							</div>

							<div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-4">
								<AlertCircle className="h-5 w-5 text-[#3964d7] shrink-0 mt-0.5" />
								<p className="text-xs text-blue-700 font-medium leading-relaxed">
									<strong>Nota Normativa:</strong> A integridade dos dados de identificação é crucial para a emissão de relatórios oficiais e certificados. Certifique-se de que o número do documento coincide exatamente com a via física apresentada.
								</p>
							</div>
						</div>
					)}

					{activeTab === 'guardian' && (
						<div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-8">
							<div>
								<div className="flex items-center gap-3 mb-1">
									<div className="w-1 h-4 bg-[#3964d7] rounded-full"></div>
									<h2 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Responsabilidade Parental</h2>
								</div>
								<p className="text-sm font-medium text-gray-500">Dados do encarregado de educação</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Controller
									name="encarregado.nome"
									control={control}
									render={({ field }) => (
										<Input
											{...field}
											label="Nome do Encarregado"
											placeholder="Identificação completa"
											error={errors.encarregado?.nome?.message}
										/>
									)}
								/>
								<Controller
									name="encarregado.telefone"
									control={control}
									render={({ field }) => (
										<Input
											{...field}
											label="Telemóvel do Encarregado"
											placeholder="Contacto prioritário"
											error={errors.encarregado?.telefone?.message}
										/>
									)}
								/>
							</div>

							<Controller
								name="encarregado.email"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										value={field.value || ''}
										label="Email do Encarregado"
										type="email"
										placeholder="email@dominio.pt"
									/>
								)}
							/>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-gray-600 text-[14px] font-bold tracking-tight mb-2.5">Ocupação / Profissão</label>
									<Controller name="encarregado.codigo_Profissao" control={control} render={({ field }) => (
										<select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} disabled={loadingProfessions} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 focus:border-[#3964d7]/50 transition-all duration-300 disabled:opacity-50">
											<option value="">{loadingProfessions ? 'Sincronizando...' : 'Seleccionar profissão'}</option>
											{professions.map((p) => <option key={p.codigo} value={p.codigo}>{p.designacao}</option>)}
										</select>
									)} />
									{errors.encarregado?.codigo_Profissao && <p className="text-red-500 text-[12px] font-bold mt-1.5">{errors.encarregado.codigo_Profissao.message}</p>}
								</div>
								<Controller
									name="encarregado.local_Trabalho"
									control={control}
									render={({ field }) => (
										<Input
											{...field}
											label="Entidade Empregadora"
											placeholder="Local de prestação de serviço"
											error={errors.encarregado?.local_Trabalho?.message}
										/>
									)}
								/>
							</div>

							<div>
								<label className="block text-gray-600 text-[14px] font-bold tracking-tight mb-2.5">Status do Encarregado</label>
								<Controller name="encarregado.status" control={control} render={({ field }) => (
									<select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 focus:border-[#3964d7]/50 transition-all duration-300">
										<option value="">Seleccionar status</option>
										{mockStatus.map((s) => <option key={s.codigo} value={s.codigo}>{s.designacao}</option>)}
									</select>
								)} />
								<p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-2 px-1">Normalmente definido como: NORMAL</p>
							</div>
						</div>
					)}

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
							loading={isSubmitting || updateStudent.isPending}
							disabled={isSubmitting || updateStudent.isPending}
							className="px-10"
						>
							<Save className="h-4 w-4 mr-2" /> Actualizar Registro
						</Button>
					</div>
				</form>
			</div>
		</Container>
	)
}
