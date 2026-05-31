import { useState, useMemo } from 'react'
import { Plus, Search, BookOpen, GraduationCap, Users, Award } from 'lucide-react'
import { useDisciplineTeachersManager, useProfessoresComplete } from '../../../hooks/useDisciplineTeacher'
import { useDisciplinesComplete } from '../../../hooks/useDiscipline'
import type { AtribuicaoCompleta, IAtribuicaoCompletaInput } from '../../../types/disciplineTeacher.types'
import DisciplineTeacherTable from '../../../components/discipline-teacher-management/DisciplineTeacherTable'
import DisciplineTeacherFormModal from '../../../components/discipline-teacher-management/DisciplineTeacherFormModal'
import DeleteConfirmModal from '../../../components/discipline-teacher-management/DeleteConfirmModal'
import Container from '../../../components/layout/Container'

export default function DisciplineTeacherManagement() {
  // Estados
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [professorFilter, setProfessorFilter] = useState('all')
  const [disciplinaFilter, setDisciplinaFilter] = useState('all')
  const [tipoFilter, setTipoFilter] = useState('all')
  
  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [disciplineTeacherToDelete, setDisciplineTeacherToDelete] = useState<AtribuicaoCompleta | null>(null)

  // Hook de gerenciamento
  const {
    disciplineTeachers,
    isLoading,
    isCreating,
    isDeleting,
    createDisciplineTeacherAsync,
    deleteProfessorDisciplinaAsync,
    deleteProfessorTurmaAsync,
  } = useDisciplineTeachersManager()

  const { data: professoresData } = useProfessoresComplete()
  const { data: disciplinasData } = useDisciplinesComplete()

  const professoresList = useMemo(() => professoresData?.data || [], [professoresData])
  const disciplinasList = useMemo(() => disciplinasData?.data || [], [disciplinasData])

  // Filtrar atribuições
  const filteredAtribuicoes = useMemo(() => {
    return disciplineTeachers.filter(atribuicao => {
      const matchesSearch = 
        atribuicao.professor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atribuicao.disciplina.designacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atribuicao.curso.designacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (atribuicao.turma && atribuicao.turma.designacao.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesProfessor = professorFilter === 'all' || atribuicao.professor.codigo.toString() === professorFilter;
      const matchesDisciplina = disciplinaFilter === 'all' || atribuicao.disciplina.codigo.toString() === disciplinaFilter;
      const matchesTipo = tipoFilter === 'all' || atribuicao.tipo === tipoFilter;
      
      return matchesSearch && matchesProfessor && matchesDisciplina && matchesTipo;
    });
  }, [disciplineTeachers, searchTerm, professorFilter, disciplinaFilter, tipoFilter]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = disciplineTeachers.length;
    const disciplinasCount = disciplineTeachers.filter(a => a.tipo === 'disciplina').length;
    const turmasCount = disciplineTeachers.filter(a => a.tipo === 'turma').length;
    const professoresAtivos = professoresList.filter((p: any) => p.status === 'Activo').length;
    
    return {
      total,
      disciplinas: disciplinasCount,
      turmas: turmasCount,
      professoresAtivos
    };
  }, [disciplineTeachers, professoresList]);

  // Paginação
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredAtribuicoes.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAtribuicoes = useMemo(() => {
    return filteredAtribuicoes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAtribuicoes, startIndex]);

  // Handlers
  const handleCreateDisciplineTeacher = () => {
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = async (data: IAtribuicaoCompletaInput) => {
    try {
      await createDisciplineTeacherAsync(data)
      setIsFormModalOpen(false)
    } catch (error) {
      console.error('Erro ao salvar associação:', error)
    }
  }

  const handleDeleteClick = (atribuicao: AtribuicaoCompleta) => {
    setDisciplineTeacherToDelete(atribuicao)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (disciplineTeacherToDelete) {
      try {
        if (disciplineTeacherToDelete.tipo === 'disciplina') {
          await deleteProfessorDisciplinaAsync(disciplineTeacherToDelete.codigo)
        } else {
          await deleteProfessorTurmaAsync(disciplineTeacherToDelete.codigo)
        }
        setIsDeleteModalOpen(false)
        setDisciplineTeacherToDelete(null)
      } catch (error) {
        console.error('Erro ao deletar associação:', error)
      }
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <Container>
      {/* Header */}
      <div className="mb-8 bg-linear-to-br from-purple-50 via-white to-purple-50 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/30 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100/30 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Atribuições de Professores
                </h1>
                <p className="text-gray-600 text-lg">
                  Gerencie as atribuições de disciplinas e turmas para os professores
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreateDisciplineTeacher}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-purple-800 text-white rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              Nova Atribuição
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Atribuições */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-4 transition-all hover:shadow-lg">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Atribuições</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        {/* Disciplinas Atribuídas */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-4 transition-all hover:shadow-lg">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Disciplinas</p>
            <p className="text-2xl font-bold text-gray-900">{stats.disciplinas}</p>
          </div>
        </div>
        {/* Turmas Atribuídas */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-4 transition-all hover:shadow-lg">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Turmas</p>
            <p className="text-2xl font-bold text-gray-900">{stats.turmas}</p>
          </div>
        </div>
        {/* Professores Ativos */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-4 transition-all hover:shadow-lg">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Professores Ativos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.professoresAtivos}</p>
          </div>
        </div>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Barra de Pesquisa */}
          <div className="relative md:col-span-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por professor, disciplina ou curso..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all bg-gray-50/30"
            />
          </div>

          {/* Professor Select */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Professor</label>
            <select
              value={professorFilter}
              onChange={(e) => {
                setProfessorFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-3 border border-gray-300 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all font-medium text-gray-700"
            >
              <option value="all">Todos os Professores</option>
              {professoresList.map((prof: any) => (
                <option key={prof.codigo} value={prof.codigo}>
                  {prof.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Disciplina Select */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Disciplina</label>
            <select
              value={disciplinaFilter}
              onChange={(e) => {
                setDisciplinaFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-3 border border-gray-300 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all font-medium text-gray-700"
            >
              <option value="all">Todas as Disciplinas</option>
              {disciplinasList.map((disc: any) => (
                <option key={disc.codigo} value={disc.codigo}>
                  {disc.designacao}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo Select */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Tipo</label>
            <select
              value={tipoFilter}
              onChange={(e) => {
                setTipoFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-3 border border-gray-300 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all font-medium text-gray-700"
            >
              <option value="all">Todos os Tipos</option>
              <option value="disciplina">Apenas Disciplinas</option>
              <option value="turma">Apenas Turmas</option>
            </select>
          </div>

          {/* Limpar Filtros */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setProfessorFilter('all')
                setDisciplinaFilter('all')
                setTipoFilter('all')
                setCurrentPage(1)
              }}
              className="w-full py-3 px-4 border border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all font-semibold text-sm active:scale-95 cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <DisciplineTeacherTable
          disciplineTeachers={paginatedAtribuicoes}
          isLoading={isLoading}
          onDelete={handleDeleteClick}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modais */}
      <DisciplineTeacherFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
        }}
        onSubmit={handleFormSubmit}
        isLoading={isCreating}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDisciplineTeacherToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        disciplineTeacherInfo={
          disciplineTeacherToDelete
            ? `${disciplineTeacherToDelete.disciplina.designacao} - ${disciplineTeacherToDelete.professor.nome}`
            : ''
        }
        isLoading={isDeleting}
      />
    </Container>
  )
}

