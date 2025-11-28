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
  Loader2
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
  email: yup.string().email('Email inválido').max(45, 'Email deve ter no máximo 45 caracteres').default(''),
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
    email: yup.string().email('Email inválido').max(45, 'Email deve ter no máximo 45 caracteres').default(''),
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white shadow-sm p-6 rounded-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              type="button"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
                <UserPlus className="h-8 w-8 text-blue-600" />
                Adicionar Novo Aluno
              </h1>
              <p className="text-gray-600">
                Preencha os dados do aluno e do encarregado
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'personal'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <User className="h-4 w-4" />
                Dados Pessoais
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('document')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'document'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <FileText className="h-4 w-4" />
                Documentação
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('guardian')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'guardian'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Users className="h-4 w-4" />
                Encarregado
              </button>
            </div>
          </div>

          {/* Tab Content: Dados Pessoais */}
          {activeTab === 'personal' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Informações Pessoais do Aluno</h2>
                <p className="text-sm text-gray-600">
                  Dados básicos e de contato do estudante
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
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
                  <label className="block text-sm font-medium mb-2">Nome do Pai</label>
                  <Controller
                    name="pai"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Nome do pai" />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Mãe</label>
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
                  <label className="block text-sm font-medium mb-2">
                    Sexo <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="sexo"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione o sexo</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                      </select>
                    )}
                  />
                  {errors.sexo && (
                    <p className="text-sm text-red-500 mt-1">{errors.sexo.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Data de Nascimento</label>
                  <Controller
                    name="dataNascimento"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="date"
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} type="email" placeholder="exemplo@email.com" />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Telefone</label>
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
                  <label className="block text-sm font-medium mb-2">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    <p className="text-sm text-red-500 mt-1">{errors.codigo_Nacionalidade.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    <p className="text-sm text-red-500 mt-1">{errors.codigo_Estado_Civil.message}</p>
                  )}
                </div>
              </div>

              {/* Endereço - Província, Município, Comuna */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">Endereço</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Província</label>
                    <Controller
                      name="provincia"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          disabled={isLoadingProvincias}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    <label className="block text-sm font-medium mb-2">Município</label>
                    <Controller
                      name="municipio"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          disabled={!watchProvincia || isLoadingMunicipios}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    <label className="block text-sm font-medium mb-2">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      <p className="text-sm text-red-500 mt-1">{errors.codigo_Comuna.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Morada Completa</label>
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
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Documentação</h2>
                <p className="text-sm text-gray-600">
                  Informações sobre documentos de identificação
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    <p className="text-sm text-red-500 mt-1">
                      {errors.codigoTipoDocumento.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Saldo Inicial</label>
                  <Controller
                    name="saldo"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Valor inicial do saldo do aluno (padrão: 0.00)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Código do Utilizador</label>
                  <Input
                    value="Será preenchido automaticamente"
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este campo será preenchido com o usuário logado
                  </p>
                </div>
              </div>

              {/* Informação Importante */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Importante:</strong> O documento de identificação será usado para validação e histórico do aluno.
                </p>
              </div>
            </div>
          )}

          {/* Tab Content: Encarregado */}
          {activeTab === 'guardian' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Dados do Encarregado</h2>
                <p className="text-sm text-gray-600">
                  Informações do responsável pelo aluno
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Novo:</strong> O encarregado será criado automaticamente ao salvar o aluno.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
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
                  <label className="block text-sm font-medium mb-2">
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
                <label className="block text-sm font-medium mb-2">Email</label>
                <Controller
                  name="encarregado.email"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="email" placeholder="email@exemplo.com" />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    <p className="text-sm text-red-500 mt-1">
                      {errors.encarregado.codigo_Profissao.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
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
                <label className="block text-sm font-medium mb-2">Status</label>
                <Controller
                  name="encarregado.status"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <p className="text-xs text-gray-500 mt-1">
                  Status do encarregado (padrão: NORMAL)
                </p>
              </div>

              {/* Informação sobre o encarregado */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium mb-2 text-gray-900">Informação Importante</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• O encarregado será vinculado automaticamente ao usuário logado</li>
                  <li>• Todos os campos marcados com <span className="text-red-500">*</span> são obrigatórios</li>
                  <li>• O código do encarregado será gerado automaticamente</li>
                  <li>• Após salvar, o aluno ficará vinculado a este encarregado</li>
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createStudent.isPending}
            >
              {isSubmitting || createStudent.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
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
