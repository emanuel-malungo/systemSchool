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
  Loader2,
  AlertCircle,
  MapPin,
  Info
} from 'lucide-react'
import { useStudent, useUpdateStudent } from '../../../hooks/useStudent'
import type { Student } from '../../../types/student.types'
import { useDocumentTypes } from '../../../hooks/useDocument'
import { useProfessions } from '../../../hooks/useProfession'
import Container from '../../../components/layout/Container'
import { usePageTitle } from '../../../hooks/usePageTitle'
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

export default function EditStudent() {
  usePageTitle('Editar Aluno')

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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#007C00] mx-auto mb-4" />
            <p className="text-sm text-gray-500">Carregando dados do aluno...</p>
          </div>
        </div>
      </Container>
    )
  }

  if (errorStudent || !studentData?.data) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Erro ao carregar dados</h2>
            <p className="text-sm text-gray-500 mb-5">Não foi possível carregar os dados do aluno.</p>
            <Button size="md" onClick={() => navigate('/admin/student-management')}>Voltar para lista</Button>
          </div>
        </div>
      </Container>
    )
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
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#007C00]/10 rounded-xl flex items-center justify-center shrink-0">
              <UserCog className="h-5 w-5 text-[#007C00]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Editar Aluno</h1>
              <p className="text-sm text-gray-500">Atualize os dados do aluno e do encarregado</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
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
                  <p className="text-sm text-gray-500">Dados básicos e de contato do estudante</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome Completo <span className="text-red-500">*</span></label>
                    <Controller name="nome" control={control} render={({ field }) => <Input {...field} placeholder="Digite o nome completo do aluno" error={errors.nome?.message} />} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Pai</label>
                    <Controller name="pai" control={control} render={({ field }) => <Input {...field} placeholder="Nome do pai" />} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome da Mãe</label>
                    <Controller name="mae" control={control} render={({ field }) => <Input {...field} placeholder="Nome da mãe" />} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Sexo <span className="text-red-500">*</span></label>
                    <Controller name="sexo" control={control} render={({ field }) => (
                      <select {...field} className={selectClass(false, !!errors.sexo)}>
                        <option value="">Selecione o sexo</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                      </select>
                    )} />
                    {errors.sexo && <p className="text-red-500 text-xs mt-1">{errors.sexo.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Data de Nascimento</label>
                    <Controller name="dataNascimento" control={control} render={({ field }) => (
                      <input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)} className={selectClass()} />
                    )} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <Controller name="email" control={control} render={({ field }) => <Input {...field} type="email" placeholder="exemplo@email.com" value={field.value || ''} />} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
                    <Controller name="telefone" control={control} render={({ field }) => <Input {...field} placeholder="923456789" />} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nacionalidade <span className="text-red-500">*</span></label>
                    <Controller name="codigo_Nacionalidade" control={control} render={({ field }) => (
                      <select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} disabled={loadingGeographic} className={selectClass(loadingGeographic, !!errors.codigo_Nacionalidade)}>
                        <option value="">{loadingGeographic ? 'Carregando...' : 'Selecione a nacionalidade'}</option>
                        {nacionalidades.map((n) => <option key={n.codigo} value={n.codigo}>{n.designacao}</option>)}
                      </select>
                    )} />
                    {errors.codigo_Nacionalidade && <p className="text-red-500 text-xs mt-1">{errors.codigo_Nacionalidade.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado Civil <span className="text-red-500">*</span></label>
                    <Controller name="codigo_Estado_Civil" control={control} render={({ field }) => (
                      <select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} disabled={loadingGeographic} className={selectClass(loadingGeographic, !!errors.codigo_Estado_Civil)}>
                        <option value="">{loadingGeographic ? 'Carregando...' : 'Selecione o estado civil'}</option>
                        {estadoCivil.map((e) => <option key={e.codigo} value={e.codigo}>{e.designacao}</option>)}
                      </select>
                    )} />
                    {errors.codigo_Estado_Civil && <p className="text-red-500 text-xs mt-1">{errors.codigo_Estado_Civil.message}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Endereço</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Província</label>
                      <Controller name="provincia" control={control} render={({ field }) => (
                        <select {...field} disabled={isLoadingProvincias} className={selectClass(isLoadingProvincias)}>
                          <option value="">{isLoadingProvincias ? 'Carregando...' : 'Selecione a província'}</option>
                          {provincias.map((p) => <option key={p.codigo} value={p.codigo}>{p.designacao}</option>)}
                        </select>
                      )} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Município</label>
                      <Controller name="municipio" control={control} render={({ field }) => (
                        <select {...field} disabled={!watchProvincia || isLoadingMunicipios} className={selectClass(!watchProvincia || isLoadingMunicipios)}>
                          <option value="">{isLoadingMunicipios ? 'Carregando...' : !watchProvincia ? 'Selecione primeiro a província' : 'Selecione o município'}</option>
                          {municipios.map((m) => <option key={m.codigo} value={m.codigo}>{m.designacao}</option>)}
                        </select>
                      )} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Comuna <span className="text-red-500">*</span></label>
                      <Controller name="codigo_Comuna" control={control} render={({ field }) => (
                        <select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} disabled={!watchMunicipio || isLoadingComunas} className={selectClass(!watchMunicipio || isLoadingComunas, !!errors.codigo_Comuna)}>
                          <option value="">{isLoadingComunas ? 'Carregando...' : !watchMunicipio ? 'Selecione primeiro o município' : 'Selecione a comuna'}</option>
                          {comunas.map((c) => <option key={c.codigo} value={c.codigo}>{c.designacao}</option>)}
                        </select>
                      )} />
                      {errors.codigo_Comuna && <p className="text-red-500 text-xs mt-1">{errors.codigo_Comuna.message}</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Morada Completa</label>
                  <Controller name="morada" control={control} render={({ field }) => <Input {...field} placeholder="Rua, número, bairro..." />} />
                </div>
              </div>
            )}

            {/* Tab Content: Documentação */}
            {activeTab === 'document' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-0.5">Documentação</h2>
                  <p className="text-sm text-gray-500">Informações sobre documentos de identificação</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Documento <span className="text-red-500">*</span></label>
                    <Controller name="codigoTipoDocumento" control={control} render={({ field }) => (
                      <select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} disabled={loadingDocTypes} className={selectClass(loadingDocTypes, !!errors.codigoTipoDocumento)}>
                        <option value="">{loadingDocTypes ? 'Carregando...' : 'Selecione o tipo'}</option>
                        {documentTypes.map((d) => <option key={d.codigo} value={d.codigo}>{d.designacao}</option>)}
                      </select>
                    )} />
                    {errors.codigoTipoDocumento && <p className="text-red-500 text-xs mt-1">{errors.codigoTipoDocumento.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Número do Documento <span className="text-red-500">*</span></label>
                    <Controller name="n_documento_identificacao" control={control} render={({ field }) => <Input {...field} placeholder="Ex: 007537847LA041" error={errors.n_documento_identificacao?.message} />} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status do Aluno</label>
                  <Controller name="codigo_Status" control={control} render={({ field }) => (
                    <select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} className={selectClass()}>
                      <option value="">Selecione o status</option>
                      {mockStatus.map((s) => <option key={s.codigo} value={s.codigo}>{s.designacao}</option>)}
                    </select>
                  )} />
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50/60 rounded-lg">
                  <Info className="h-4 w-4 text-[#007C00] mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700"><span className="font-medium text-gray-900">Importante:</span> O documento de identificação será usado para validação e histórico do aluno.</p>
                </div>
              </div>
            )}

            {/* Tab Content: Encarregado */}
            {activeTab === 'guardian' && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-0.5">Dados do Encarregado</h2>
                  <p className="text-sm text-gray-500">Informações do responsável pelo aluno</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome Completo <span className="text-red-500">*</span></label>
                    <Controller name="encarregado.nome" control={control} render={({ field }) => <Input {...field} placeholder="Nome completo" error={errors.encarregado?.nome?.message} />} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone <span className="text-red-500">*</span></label>
                    <Controller name="encarregado.telefone" control={control} render={({ field }) => <Input {...field} placeholder="923456789" error={errors.encarregado?.telefone?.message} />} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <Controller name="encarregado.email" control={control} render={({ field }) => <Input {...field} type="email" placeholder="email@exemplo.com" value={field.value || ''} />} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Profissão <span className="text-red-500">*</span></label>
                    <Controller name="encarregado.codigo_Profissao" control={control} render={({ field }) => (
                      <select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} disabled={loadingProfessions} className={selectClass(loadingProfessions, !!errors.encarregado?.codigo_Profissao)}>
                        <option value="">{loadingProfessions ? 'Carregando...' : 'Selecione a profissão'}</option>
                        {professions.map((p) => <option key={p.codigo} value={p.codigo}>{p.designacao}</option>)}
                      </select>
                    )} />
                    {errors.encarregado?.codigo_Profissao && <p className="text-red-500 text-xs mt-1">{errors.encarregado.codigo_Profissao.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Local de Trabalho <span className="text-red-500">*</span></label>
                    <Controller name="encarregado.local_Trabalho" control={control} render={({ field }) => <Input {...field} placeholder="Ex: Hospital Central" error={errors.encarregado?.local_Trabalho?.message} />} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <Controller name="encarregado.status" control={control} render={({ field }) => (
                    <select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} className={selectClass()}>
                      <option value="">Selecione o status</option>
                      {mockStatus.map((s) => <option key={s.codigo} value={s.codigo}>{s.designacao}</option>)}
                    </select>
                  )} />
                  <p className="text-xs text-gray-400 mt-1.5">Status do encarregado (padrão: NORMAL)</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" size="md" onClick={() => navigate(-1)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" size="md" disabled={isSubmitting || updateStudent.isPending}>
              {isSubmitting || updateStudent.isPending ? (
                <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />Salvando...</>
              ) : (
                <><Save className="mr-1.5 h-4 w-4" />Salvar Alterações</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  )
}
