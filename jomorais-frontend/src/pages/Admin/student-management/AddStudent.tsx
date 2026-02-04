import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
	UserPlus,
	ArrowLeft,
	Save,
	User,
	FileText,
	Users,
	AlertCircle
} from 'lucide-react'
import { useCreateStudent } from '../../../hooks/useStudent'
import type { Student } from '../../../types/student.types'
import { useDocumentTypes } from '../../../hooks/useDocument'
import { useProfessions } from '../../../hooks/useProfession'
import Container from '../../../components/layout/Container'
import Input from '../../../components/common/Input'
import Button from '../../../components/common/Button'
import {
	useGeographicFormData,
	useEnderecoCompleto
} from '../../../hooks/useGeographic'
import { mockStatus } from '../../../mocks/status.mock'

// Validation Schema
const addStudentSchema = yup.object().shape({
	nome: yup.string().required('Nome completo é obrigatório').max(200, 'Nome deve ter no máximo 200 caracteres'),
	pai: yup.string().max(200, 'Nome do pai deve ter no máximo 200 caracteres').default(''),
	mae: yup.string().max(200, 'Nome da mãe deve ter no máximo 200 caracteres').default(''),
	sexo: yup.string().oneOf(['M', 'F'], 'Selecione o sexo').required('Sexo é obrigatório'),
	dataNascimento: yup.date().nullable().default(null),
	email: yup.string().email('Email inválido').max(45, 'Email deve ter no máximo 45 caracteres').nullable().transform((value) => value || null).default(''),
	telefone: yup.string().max(45, 'Telefone deve ter no máximo 45 caracteres').default(''),
	codigo_Nacionalidade: yup.number().required('Nacionalidade é obrigatória'),
	codigo_Estado_Civil: yup.number().required('Estado civil é obrigatório').default(1),
	codigo_Comuna: yup.number().required('Comuna é obrigatória'),
	codigoTipoDocumento: yup.number().required('Tipo de documento é obrigatório').default(1),
	n_documento_identificacao: yup.string().max(45, 'Número do documento deve ter no máximo 45 caracteres').default(''),
	morada: yup.string().max(60, 'Morada deve ter no máximo 60 caracteres').default('...'),
	saldo: yup.number().min(0, 'Saldo não pode ser negativo').default(0),
	codigo_Status: yup.number().default(1),

	// Campos auxiliares para navegação geográfica (não enviados ao backend)
	provincia: yup.string().default(''),
	municipio: yup.string().default(''),

	encarregado: yup.object().shape({
		nome: yup.string().required('Nome do encarregado é obrigatório').max(250, 'Nome deve ter no máximo 250 caracteres'),
		telefone: yup.string().required('Telefone do encarregado é obrigatório').max(45, 'Telefone deve ter no máximo 45 caracteres'),
		email: yup.string().email('Email inválido').max(45, 'Email deve ter no máximo 45 caracteres').nullable().transform((value) => value || null).default(''),
		codigo_Profissao: yup.number().required('Profissão é obrigatória'),
		local_Trabalho: yup.string().required('Local de trabalho é obrigatório').max(45, 'Local de trabalho deve ter no máximo 45 caracteres'),
		status: yup.number().default(1),
	}).required('Encarregado é obrigatório')
})

type AddStudentFormData = yup.InferType<typeof addStudentSchema>

export default function AddStudent() {
	const navigate = useNavigate()
	const [activeTab, setActiveTab] = useState<'personal' | 'document' | 'guardian'>('personal')

	const createStudent = useCreateStudent()

	// Hooks para dados geográficos e formulário
	const {
		nacionalidades,
		estadoCivil,
		isLoading: loadingGeographic
	} = useGeographicFormData()

	// Hooks individuais para tipos de documento e profissões
	const { data: documentTypes = [], isLoading: loadingDocTypes } = useDocumentTypes()
	const { data: professions = [], isLoading: loadingProfessions } = useProfessions()

	const {
		control,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting }
	} = useForm<AddStudentFormData>({
		resolver: yupResolver(addStudentSchema),
		mode: 'onChange',
		defaultValues: {
			nome: '',
			pai: '',
			mae: '',
			codigo_Nacionalidade: undefined,
			codigo_Estado_Civil: 1,
			dataNascimento: undefined,
			email: '',
			telefone: '',
			codigo_Comuna: undefined,
			sexo: undefined,
			n_documento_identificacao: '',
			saldo: 0,
			morada: '...',
			codigoTipoDocumento: 1,
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

	// Watch para mudanças geográficas (cascading dropdowns)
	const watchProvincia = watch('provincia')
	const watchMunicipio = watch('municipio')

	// Hooks para endereço completo (província -> município -> comuna)
	const {
		provincias,
		municipios,
		comunas,
		isLoadingProvincias,
		isLoadingMunicipios,
		isLoadingComunas
	} = useEnderecoCompleto(
		watchProvincia ? parseInt(watchProvincia) : undefined,
		watchMunicipio ? parseInt(watchMunicipio) : undefined
	)

	// Função para enviar o formulário
	const onSubmit: SubmitHandler<AddStudentFormData> = async (data) => {
		try {
			// Remover campos auxiliares antes de enviar (provincia e municipio são apenas para navegação)
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { provincia, municipio, ...studentData } = data
			// Enviar dados sem os campos auxiliares (o backend preencherá os campos faltantes)
			await createStudent.mutateAsync(studentData as unknown as Student)
			navigate('/admin/student-management')
		} catch (error) {
			console.error('Erro ao criar estudante:', error)
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
									<UserPlus className="h-7 w-7 text-white" />
								</div>
								<div>
									<h1 className="text-2xl font-black text-[#1e293b] leading-tight">
										Novo Cadastro de Aluno
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

					{/* Tab Content: Dados Pessoais */}
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
											{documentTypes.map((docType) => (
												<option key={docType.codigo} value={docType.codigo}>{docType.designacao}</option>
											))}
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
										error={errors.encarregado?.email?.message}
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

							<div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-start gap-4">
								<Users className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
								<div className="space-y-1">
									<h4 className="text-[11px] font-black text-gray-600 uppercase tracking-widest leading-none">Vínculo Automático</h4>
									<p className="text-[11px] text-gray-400 font-medium leading-relaxed">
										O sistema vinculará este encarregado diretamente ao perfil do aluno. Certifique-se de que os contactos estão correctos para comunicações institucionais.
									</p>
								</div>
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
							loading={isSubmitting || createStudent.isPending}
							disabled={isSubmitting || createStudent.isPending}
							className="px-10"
						>
							<Save className="h-4 w-4 mr-2" /> Confirmar Matrícula
						</Button>
					</div>
				</form>
			</div>
		</Container>
	)
}
