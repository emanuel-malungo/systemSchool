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
  Loader2,
  MapPin,
  Info
} from 'lucide-react'
import { useCreateStudent } from '../../../hooks/useStudent'
import type { Student } from '../../../types/student.types'
import { useDocumentTypes } from '../../../hooks/useDocument'
import { useProfessions } from '../../../hooks/useProfession'
import Container from '../../../components/layout/Container'
import { usePageTitle } from '../../../hooks/usePageTitle'
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

// Estilo padrão dos selects (consistente com Input)
const selectClass = (disabled?: boolean, hasError?: boolean) => `
  w-full px-4 py-2.5 rounded-lg text-sm
  bg-gray-50 hover:bg-gray-100/75
  border border-transparent
  text-gray-700
  focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100
  transition-all duration-200
  appearance-none cursor-pointer
  ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
  ${hasError ? 'ring-2 ring-red-400/50 bg-red-50/30' : ''}
`.replace(/\s+/g, ' ').trim()

// Tabs data
const tabs = [
  { id: 'personal' as const, label: 'Dados Pessoais', icon: User },
  { id: 'document' as const, label: 'Documentação', icon: FileText },
  { id: 'guardian' as const, label: 'Encarregado', icon: Users },
]

export default function AddStudent() {
  usePageTitle('Adicionar Aluno')

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
            type="button"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#007C00]/10 rounded-xl flex items-center justify-center shrink-0">
              <UserPlus className="h-5 w-5 text-[#007C00]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Adicionar Novo Aluno
              </h1>
              <p className="text-sm text-gray-500">
                Preencha os dados do aluno e do encarregado
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex border-b border-gray-100">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all duration-200 relative
                      ${isActive
                        ? 'text-[#007C00]'
                        : 'text-gray-500 hover:text-gray-700'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007C00] rounded-t-full" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Tab Content: Dados Pessoais */}
            {activeTab === 'personal' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-0.5">Informações Pessoais do Aluno</h2>
                  <p className="text-sm text-gray-500">
                    Dados básicos e de contato do estudante
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="nome"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Digite o nome completo do aluno"
                          error={errors.nome?.message}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Pai</label>
                    <Controller
                      name="pai"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="Nome do pai" />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome da Mãe</label>
                    <Controller
                      name="mae"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="Nome da mãe" />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Sexo <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="sexo"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className={selectClass(false, !!errors.sexo)}
                        >
                          <option value="">Selecione o sexo</option>
                          <option value="M">Masculino</option>
                          <option value="F">Feminino</option>
                        </select>
                      )}
                    />
                    {errors.sexo && (
                      <p className="text-red-500 text-xs mt-1">{errors.sexo.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Data de Nascimento</label>
                    <Controller
                      name="dataNascimento"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          className={selectClass()}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} type="email" placeholder="exemplo@email.com" value={field.value || ''} />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
                    <Controller
                      name="telefone"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="923456789" />
                      )}
                    />
                  </div>
                </div>

                {/* Nacionalidade e Estado Civil */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nacionalidade <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="codigo_Nacionalidade"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          disabled={loadingGeographic}
                          className={selectClass(loadingGeographic, !!errors.codigo_Nacionalidade)}
                        >
                          <option value="">
                            {loadingGeographic ? 'Carregando...' : 'Selecione a nacionalidade'}
                          </option>
                          {nacionalidades.map((nacionalidade) => (
                            <option key={nacionalidade.codigo} value={nacionalidade.codigo}>
                              {nacionalidade.designacao}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.codigo_Nacionalidade && (
                      <p className="text-red-500 text-xs mt-1">{errors.codigo_Nacionalidade.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Estado Civil <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="codigo_Estado_Civil"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          disabled={loadingGeographic}
                          className={selectClass(loadingGeographic, !!errors.codigo_Estado_Civil)}
                        >
                          <option value="">
                            {loadingGeographic ? 'Carregando...' : 'Selecione o estado civil'}
                          </option>
                          {estadoCivil.map((estado) => (
                            <option key={estado.codigo} value={estado.codigo}>
                              {estado.designacao}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.codigo_Estado_Civil && (
                      <p className="text-red-500 text-xs mt-1">{errors.codigo_Estado_Civil.message}</p>
                    )}
                  </div>
                </div>

                {/* Endereço - Província, Município, Comuna */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Endereço</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Província</label>
                      <Controller
                        name="provincia"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            disabled={isLoadingProvincias}
                            className={selectClass(isLoadingProvincias)}
                          >
                            <option value="">
                              {isLoadingProvincias ? 'Carregando...' : 'Selecione a província'}
                            </option>
                            {provincias.map((provincia) => (
                              <option key={provincia.codigo} value={provincia.codigo}>
                                {provincia.designacao}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Município</label>
                      <Controller
                        name="municipio"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            disabled={!watchProvincia || isLoadingMunicipios}
                            className={selectClass(!watchProvincia || isLoadingMunicipios)}
                          >
                            <option value="">
                              {isLoadingMunicipios ? 'Carregando...' :
                                !watchProvincia ? 'Selecione primeiro a província' :
                                  'Selecione o município'}
                            </option>
                            {municipios.map((municipio) => (
                              <option key={municipio.codigo} value={municipio.codigo}>
                                {municipio.designacao}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Comuna <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="codigo_Comuna"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            disabled={!watchMunicipio || isLoadingComunas}
                            className={selectClass(!watchMunicipio || isLoadingComunas, !!errors.codigo_Comuna)}
                          >
                            <option value="">
                              {isLoadingComunas ? 'Carregando...' :
                                !watchMunicipio ? 'Selecione primeiro o município' :
                                  'Selecione a comuna'}
                            </option>
                            {comunas.map((comuna) => (
                              <option key={comuna.codigo} value={comuna.codigo}>
                                {comuna.designacao}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.codigo_Comuna && (
                        <p className="text-red-500 text-xs mt-1">{errors.codigo_Comuna.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Morada Completa</label>
                  <Controller
                    name="morada"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Rua, número, bairro..." />
                    )}
                  />
                </div>
              </div>
            )}

            {/* Tab Content: Documentação */}
            {activeTab === 'document' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-0.5">Documentação</h2>
                  <p className="text-sm text-gray-500">
                    Informações sobre documentos de identificação
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tipo de Documento <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="codigoTipoDocumento"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          disabled={loadingDocTypes}
                          className={selectClass(loadingDocTypes, !!errors.codigoTipoDocumento)}
                        >
                          <option value="">
                            {loadingDocTypes ? 'Carregando...' : 'Selecione o tipo'}
                          </option>
                          {documentTypes.map((docType) => (
                            <option key={docType.codigo} value={docType.codigo}>
                              {docType.designacao}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.codigoTipoDocumento && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.codigoTipoDocumento.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Número do Documento <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="n_documento_identificacao"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Ex: 007537847LA041"
                          error={errors.n_documento_identificacao?.message}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Informação Importante */}
                <div className="flex items-start gap-3 p-4 bg-green-50/60 rounded-lg">
                  <Info className="h-4 w-4 text-[#007C00] mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Importante:</span> O documento de identificação será usado para validação e histórico do aluno.
                  </p>
                </div>
              </div>
            )}

            {/* Tab Content: Encarregado */}
            {activeTab === 'guardian' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-0.5">Dados do Encarregado</h2>
                  <p className="text-sm text-gray-500">
                    Informações do responsável pelo aluno
                  </p>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50/60 rounded-lg">
                  <Info className="h-4 w-4 text-[#007C00] mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Novo:</span> O encarregado será criado automaticamente ao salvar o aluno.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="encarregado.nome"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Nome completo"
                          error={errors.encarregado?.nome?.message}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Telefone <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="encarregado.telefone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="923456789"
                          error={errors.encarregado?.telefone?.message}
                        />
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <Controller
                    name="encarregado.email"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="email" placeholder="email@exemplo.com" value={field.value || ''} />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Profissão <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="encarregado.codigo_Profissao"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          disabled={loadingProfessions}
                          className={selectClass(loadingProfessions, !!errors.encarregado?.codigo_Profissao)}
                        >
                          <option value="">
                            {loadingProfessions ? 'Carregando...' : 'Selecione a profissão'}
                          </option>
                          {professions.map((prof) => (
                            <option key={prof.codigo} value={prof.codigo}>
                              {prof.designacao}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.encarregado?.codigo_Profissao && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.encarregado.codigo_Profissao.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Local de Trabalho <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="encarregado.local_Trabalho"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Ex: Hospital Central"
                          error={errors.encarregado?.local_Trabalho?.message}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Status do Encarregado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <Controller
                    name="encarregado.status"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className={selectClass()}
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
                  <p className="text-xs text-gray-400 mt-1.5">
                    Status do encarregado (padrão: NORMAL)
                  </p>
                </div>

                {/* Informação sobre o encarregado */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Informação Importante</h4>
                  <ul className="text-sm space-y-1 text-gray-500">
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0" />
                      O encarregado será vinculado automaticamente ao usuário logado
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0" />
                      Todos os campos marcados com <span className="text-red-500">*</span> são obrigatórios
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0" />
                      O código do encarregado será gerado automaticamente
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0" />
                      Após salvar, o aluno ficará vinculado a este encarregado
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="md"
              disabled={isSubmitting || createStudent.isPending}
            >
              {isSubmitting || createStudent.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  Salvar Aluno
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  )
}
