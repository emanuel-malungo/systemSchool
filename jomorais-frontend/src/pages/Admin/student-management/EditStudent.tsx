import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { 
  UserCog, 
  ArrowLeft, 
  Save, 
  User, 
  FileText, 
  Users,
  Loader2,
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
  email: yup.string().email('Email inválido').max(45).default(''),
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
    email: yup.string().email('Email inválido').max(45).default(''),
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
    mode: 'onChange'
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
      
      // Converter sexo de texto completo para M/F
      let sexoValue: 'M' | 'F' | undefined
      if (student.sexo === 'Masculino') {
        sexoValue = 'M'
      } else if (student.sexo === 'Feminino') {
        sexoValue = 'F'
      }
      
      // Mapear dados do encarregado (vem como tb_encarregados da API)
      const encarregadoData = student.tb_encarregados || student.encarregado
      
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
        morada: student.morada || '...',
        codigoTipoDocumento: student.codigoTipoDocumento || 1,
        codigo_Status: student.codigo_Status || 1,
        provincia: provinciaId,
        municipio: municipioId,
        encarregado: {
          nome: encarregadoData?.nome || '',
          telefone: encarregadoData?.telefone || '',
          email: encarregadoData?.email || '',
          codigo_Profissao: encarregadoData?.codigo_Profissao || undefined,
          local_Trabalho: encarregadoData?.local_Trabalho || '',
          status: encarregadoData?.status || 1
        }
      })
    }
  }, [studentData, allComunas, allMunicipios, reset])

  const onSubmit: SubmitHandler<EditStudentFormData> = async (data) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { provincia, municipio, ...studentData } = data
      await updateStudent.mutateAsync({ id: studentId, studentData: studentData as unknown as Student })
      navigate('/admin/student-management')
    } catch (error) {
      console.error('Erro ao atualizar estudante:', error)
    }
  }

  if (loadingStudent) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando dados do aluno...</p>
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
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dados</h2>
            <p className="text-gray-600 mb-4">Não foi possível carregar os dados do aluno.</p>
            <Button onClick={() => navigate('/admin/student-management')}>Voltar para lista</Button>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white shadow-sm p-6 rounded-lg">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg" type="button">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
                <UserCog className="h-8 w-8 text-blue-600" />
                Editar Aluno
              </h1>
              <p className="text-gray-600">Atualize os dados do aluno e do encarregado</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-1">
              <button type="button" onClick={() => setActiveTab('personal')} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'personal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}>
                <User className="h-4 w-4" />Dados Pessoais
              </button>
              <button type="button" onClick={() => setActiveTab('document')} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'document' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}>
                <FileText className="h-4 w-4" />Documentação
              </button>
              <button type="button" onClick={() => setActiveTab('guardian')} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'guardian' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}>
                <Users className="h-4 w-4" />Encarregado
              </button>
            </div>
          </div>

          {activeTab === 'personal' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Informações Pessoais do Aluno</h2>
                <p className="text-sm text-gray-600">Dados básicos e de contato do estudante</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome Completo <span className="text-red-500">*</span></label>
                  <Controller name="nome" control={control} render={({ field }) => <Input {...field} placeholder="Digite o nome completo do aluno" error={errors.nome?.message} />} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome do Pai</label>
                  <Controller name="pai" control={control} render={({ field }) => <Input {...field} placeholder="Nome do pai" />} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Mãe</label>
                  <Controller name="mae" control={control} render={({ field }) => <Input {...field} placeholder="Nome da mãe" />} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Sexo <span className="text-red-500">*</span></label>
                  <Controller name="sexo" control={control} render={({ field }) => (
                    <select {...field} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Selecione o sexo</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                    </select>
                  )} />
                  {errors.sexo && <p className="text-sm text-red-500 mt-1">{errors.sexo.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data de Nascimento</label>
                  <Controller name="dataNascimento" control={control} render={({ field }) => (
                    <input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  )} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Controller name="email" control={control} render={({ field }) => <Input {...field} type="email" placeholder="exemplo@email.com" />} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefone</label>
                  <Controller name="telefone" control={control} render={({ field }) => <Input {...field} placeholder="923456789" />} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nacionalidade <span className="text-red-500">*</span></label>
                  <Controller name="codigo_Nacionalidade" control={control} render={({ field }) => (
                    <select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} disabled={loadingGeographic} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                      <option value="">{loadingGeographic ? 'Carregando...' : 'Selecione a nacionalidade'}</option>
                      {nacionalidades.map((n) => <option key={n.codigo} value={n.codigo}>{n.designacao}</option>)}
                    </select>
                  )} />
                  {errors.codigo_Nacionalidade && <p className="text-sm text-red-500 mt-1">{errors.codigo_Nacionalidade.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estado Civil <span className="text-red-500">*</span></label>
                  <Controller name="codigo_Estado_Civil" control={control} render={({ field }) => (
                    <select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} disabled={loadingGeographic} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                      <option value="">{loadingGeographic ? 'Carregando...' : 'Selecione o estado civil'}</option>
                      {estadoCivil.map((e) => <option key={e.codigo} value={e.codigo}>{e.designacao}</option>)}
                    </select>
                  )} />
                  {errors.codigo_Estado_Civil && <p className="text-sm text-red-500 mt-1">{errors.codigo_Estado_Civil.message}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Província</label>
                    <Controller name="provincia" control={control} render={({ field }) => (
                      <select {...field} disabled={isLoadingProvincias} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                        <option value="">{isLoadingProvincias ? 'Carregando...' : 'Selecione a província'}</option>
                        {provincias.map((p) => <option key={p.codigo} value={p.codigo}>{p.designacao}</option>)}
                      </select>
                    )} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Município</label>
                    <Controller name="municipio" control={control} render={({ field }) => (
                      <select {...field} disabled={!watchProvincia || isLoadingMunicipios} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                        <option value="">{isLoadingMunicipios ? 'Carregando...' : !watchProvincia ? 'Selecione primeiro a província' : 'Selecione o município'}</option>
                        {municipios.map((m) => <option key={m.codigo} value={m.codigo}>{m.designacao}</option>)}
                      </select>
                    )} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Comuna <span className="text-red-500">*</span></label>
                    <Controller name="codigo_Comuna" control={control} render={({ field }) => (
                      <select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} disabled={!watchMunicipio || isLoadingComunas} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                        <option value="">{isLoadingComunas ? 'Carregando...' : !watchMunicipio ? 'Selecione primeiro o município' : 'Selecione a comuna'}</option>
                        {comunas.map((c) => <option key={c.codigo} value={c.codigo}>{c.designacao}</option>)}
                      </select>
                    )} />
                    {errors.codigo_Comuna && <p className="text-sm text-red-500 mt-1">{errors.codigo_Comuna.message}</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Morada Completa</label>
                <Controller name="morada" control={control} render={({ field }) => <Input {...field} placeholder="Rua, número, bairro..." />} />
              </div>
            </div>
          )}

          {activeTab === 'document' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Documentação</h2>
                <p className="text-sm text-gray-600">Informações sobre documentos de identificação</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Documento <span className="text-red-500">*</span></label>
                  <Controller name="codigoTipoDocumento" control={control} render={({ field }) => (
                    <select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} disabled={loadingDocTypes} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                      <option value="">{loadingDocTypes ? 'Carregando...' : 'Selecione o tipo'}</option>
                      {documentTypes.map((d) => <option key={d.codigo} value={d.codigo}>{d.designacao}</option>)}
                    </select>
                  )} />
                  {errors.codigoTipoDocumento && <p className="text-sm text-red-500 mt-1">{errors.codigoTipoDocumento.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Número do Documento <span className="text-red-500">*</span></label>
                  <Controller name="n_documento_identificacao" control={control} render={({ field }) => <Input {...field} placeholder="Ex: 007537847LA041" error={errors.n_documento_identificacao?.message} />} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Saldo Atual</label>
                  <Controller name="saldo" control={control} render={({ field }) => <Input {...field} type="number" step="0.01" min="0" placeholder="0.00" onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />} />
                  <p className="text-xs text-gray-500 mt-1">Saldo atual do aluno</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status do Aluno</label>
                  <Controller name="codigo_Status" control={control} render={({ field }) => (
                    <select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Selecione o status</option>
                      {mockStatus.map((s) => <option key={s.codigo} value={s.codigo}>{s.designacao}</option>)}
                    </select>
                  )} />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900"><strong>Importante:</strong> O documento de identificação será usado para validação e histórico do aluno.</p>
              </div>
            </div>
          )}

          {activeTab === 'guardian' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Dados do Encarregado</h2>
                <p className="text-sm text-gray-600">Informações do responsável pelo aluno</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome Completo <span className="text-red-500">*</span></label>
                  <Controller name="encarregado.nome" control={control} render={({ field }) => <Input {...field} placeholder="Nome completo" error={errors.encarregado?.nome?.message} />} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefone <span className="text-red-500">*</span></label>
                  <Controller name="encarregado.telefone" control={control} render={({ field }) => <Input {...field} placeholder="923456789" error={errors.encarregado?.telefone?.message} />} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Controller name="encarregado.email" control={control} render={({ field }) => <Input {...field} type="email" placeholder="email@exemplo.com" />} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Profissão <span className="text-red-500">*</span></label>
                  <Controller name="encarregado.codigo_Profissao" control={control} render={({ field }) => (
                    <select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} disabled={loadingProfessions} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                      <option value="">{loadingProfessions ? 'Carregando...' : 'Selecione a profissão'}</option>
                      {professions.map((p) => <option key={p.codigo} value={p.codigo}>{p.designacao}</option>)}
                    </select>
                  )} />
                  {errors.encarregado?.codigo_Profissao && <p className="text-sm text-red-500 mt-1">{errors.encarregado.codigo_Profissao.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Local de Trabalho <span className="text-red-500">*</span></label>
                  <Controller name="encarregado.local_Trabalho" control={control} render={({ field }) => <Input {...field} placeholder="Ex: Hospital Central" error={errors.encarregado?.local_Trabalho?.message} />} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Controller name="encarregado.status" control={control} render={({ field }) => (
                  <select {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Selecione o status</option>
                    {mockStatus.map((s) => <option key={s.codigo} value={s.codigo}>{s.designacao}</option>)}
                  </select>
                )} />
                <p className="text-xs text-gray-500 mt-1">Status do encarregado (padrão: NORMAL)</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || updateStudent.isPending}>
              {isSubmitting || updateStudent.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Salvar Alterações</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  )
}
