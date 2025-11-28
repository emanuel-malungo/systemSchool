import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { GraduationCap, ArrowLeft, Save, User, BookOpen, Calendar } from 'lucide-react'
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
      codigoStatus: 0,
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
                <GraduationCap className="h-8 w-8 text-blue-600" />
                Nova Matrícula
              </h1>
              <p className="text-gray-600">
                Registre uma nova matrícula de aluno em um curso
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações da Matrícula */}
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Informações da Matrícula
              </h2>
              <p className="text-sm text-gray-600">
                Selecione o aluno e o curso para a matrícula
              </p>
            </div>

            {/* Seleção de Aluno */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Aluno <span className="text-red-500">*</span>
              </label>
              
              {/* Campo de pesquisa de aluno com autocomplete */}
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
                />
                
                {(loadingStudents || (searchAluno !== debouncedSearchAluno && searchAluno.length > 0)) && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}

                {/* Dropdown de resultados */}
                {showAlunoResults && searchAluno.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.students.length > 0 ? (
                      <>
                        <div className="px-3 py-2 bg-gray-50 border-b text-xs text-gray-600 font-medium">
                          {searchResults.students.length} aluno(s) encontrado(s)
                        </div>
                        {searchResults.students.map((student) => (
                          <button
                            key={student.codigo}
                            type="button"
                            onClick={() => handleSelectAluno(student)}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="font-medium text-gray-900">{student.nome}</div>
                            <div className="text-xs text-gray-500">
                              {student.sexo} • {student.email || 'Sem email'} • {student.telefone || 'Sem telefone'}
                            </div>
                          </button>
                        ))}
                      </>
                    ) : !loadingStudents ? (
                      <div className="px-3 py-4 text-center text-gray-500 text-sm">
                        Nenhum aluno encontrado
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              
              {!selectedAlunoId && searchAluno && (
                <p className="text-sm text-amber-600 mt-1">Selecione um aluno da lista de resultados</p>
              )}

              {/* Informações do aluno selecionado */}
              {selectedAluno && (
                <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Informações do Aluno</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Nome:</span>
                      <p className="font-medium text-gray-900">{selectedAluno.nome}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Sexo:</span>
                      <p className="font-medium text-gray-900">{selectedAluno.sexo}</p>
                    </div>
                    {selectedAluno.email && (
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium text-gray-900">{selectedAluno.email}</p>
                      </div>
                    )}
                    {selectedAluno.telefone && (
                      <div>
                        <span className="text-gray-600">Telefone:</span>
                        <p className="font-medium text-gray-900">{selectedAluno.telefone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Seleção de Curso */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <BookOpen className="inline h-4 w-4 mr-1" />
                Curso <span className="text-red-500">*</span>
              </label>
              
              {/* Campo de pesquisa de curso com autocomplete */}
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
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
                  </div>
                )}

                {/* Dropdown de resultados */}
                {showCursoResults && searchCurso.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.courses.length > 0 ? (
                      <>
                        <div className="px-3 py-2 bg-gray-50 border-b text-xs text-gray-600 font-medium">
                          {searchResults.courses.length} curso(s) encontrado(s)
                        </div>
                        {searchResults.courses.map((course) => (
                          <button
                            key={course.codigo}
                            type="button"
                            onClick={() => handleSelectCurso(course)}
                            className="w-full text-left px-3 py-2 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="font-medium text-gray-900">{course.designacao}</div>
                          </button>
                        ))}
                      </>
                    ) : !loadingCourses ? (
                      <div className="px-3 py-4 text-center text-gray-500 text-sm">
                        Nenhum curso encontrado
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              
              {!selectedCursoId && searchCurso && (
                <p className="text-sm text-amber-600 mt-1">Selecione um curso da lista de resultados</p>
              )}

              {/* Informações do curso selecionado */}
              {selectedCurso && (
                <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">Informações do Curso</h3>
                  <div className="text-sm">
                    <span className="text-gray-600">Curso:</span>
                    <p className="font-medium text-gray-900">{selectedCurso.designacao}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Data de Matrícula */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data de Matrícula <span className="text-red-500">*</span>
              </label>
              <Controller
                name="data_Matricula"
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
              {errors.data_Matricula && (
                <p className="text-sm text-red-500 mt-1">{errors.data_Matricula.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2">Status da Matrícula</label>
              <Controller
                name="codigoStatus"
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
              {errors.codigoStatus && (
                <p className="text-sm text-red-500 mt-1">{errors.codigoStatus.message}</p>
              )}
            </div>

            {/* Informação Importante */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-900">
                <strong>Importante:</strong> Após criar a matrícula, você precisará fazer a confirmação do aluno em uma turma.
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
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
              disabled={isSubmitting || isCreating || createMatricula.isPending || !selectedAlunoId || !selectedCursoId}
            >
              {isSubmitting || isCreating || createMatricula.isPending ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2 inline-block"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Criar Matrícula
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  )
}
