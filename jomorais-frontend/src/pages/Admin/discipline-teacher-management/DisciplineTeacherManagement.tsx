import { useState, useMemo } from 'react'
import { Plus, Search, BookOpen, GraduationCap, Users, Award } from 'lucide-react'
import { useDisciplineTeachersManager, useProfessoresComplete } from '../../../hooks/useDisciplineTeacher'
import { useDisciplinesComplete } from '../../../hooks/useDiscipline'
import type { AtribuicaoCompleta, IAtribuicaoCompletaInput } from '../../../types/disciplineTeacher.types'
import DisciplineTeacherTable from '../../../components/discipline-teacher-management/DisciplineTeacherTable'
import DisciplineTeacherFormModal from '../../../components/discipline-teacher-management/DisciplineTeacherFormModal'
import DeleteConfirmModal from '../../../components/discipline-teacher-management/DeleteConfirmModal'
import FilterModal from '../../../components/discipline-teacher-management/FilterModal'
import Container from '../../../components/layout/Container'
import { Filter } from 'lucide-react'

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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6 text-[#007C00]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Atribuições de Professores
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-100">
                  <div className="w-1.5 h-1.5 bg-[#007C00] rounded-full animate-pulse"></div>
                  <span className="text-xs text-[#007C00] font-medium">{stats.total} Atribuições</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Gerencie as atribuições de disciplinas e turmas para os professores
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm shadow-sm"
            >
              <Filter className="h-4 w-4" />
              Filtros Avançados
            </button>
            <button
              onClick={handleCreateDisciplineTeacher}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#007C00] text-white rounded-lg hover:bg-[#005a00] active:scale-[0.98] transition-all duration-200 font-medium text-sm shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Nova Atribuição
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Atribuições */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Atribuições</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-[#007C00] rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
          {/* Disciplinas Atribuídas */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Disciplinas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.disciplinas}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6" />
            </div>
          </div>
          {/* Turmas Atribuídas */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Turmas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.turmas}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>
          {/* Professores Ativos */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Professores Ativos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.professoresAtivos}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Pesquisa e Filtros Rápidos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barra de Pesquisa */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por professor, disciplina ou curso..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007C00] focus:border-[#007C00] transition-all text-sm"
              />
            </div>
          </div>

          {/* Contador de Resultados e Limpar Filtros Rápido */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Mostrando <span className="font-medium text-gray-900">{filteredAtribuicoes.length}</span> resultados
              {(professorFilter !== 'all' || disciplinaFilter !== 'all' || tipoFilter !== 'all') && (
                <span className="ml-1 text-[#007C00]">
                  (Filtros Avançados ativos)
                </span>
              )}
            </span>
            {(searchTerm || professorFilter !== 'all' || disciplinaFilter !== 'all' || tipoFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setProfessorFilter('all')
                  setDisciplinaFilter('all')
                  setTipoFilter('all')
                  setCurrentPage(1)
                }}
                className="text-sm text-[#007C00] hover:text-[#005a00] font-medium transition-colors"
              >
                Limpar tudo
              </button>
            )}
          </div>
        </div>

      {/* Tabela */}
      <DisciplineTeacherTable
          disciplineTeachers={paginatedAtribuicoes}
          isLoading={isLoading}
          onDelete={handleDeleteClick}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

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

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={{ professorFilter, disciplinaFilter, tipoFilter }}
        setFilters={(f) => {
          setProfessorFilter(f.professorFilter)
          setDisciplinaFilter(f.disciplinaFilter)
          setTipoFilter(f.tipoFilter)
          setCurrentPage(1)
        }}
        professoresList={professoresList}
        disciplinasList={disciplinasList}
        onClear={() => {
          setProfessorFilter('all')
          setDisciplinaFilter('all')
          setTipoFilter('all')
          setCurrentPage(1)
        }}
      />
      </div>
    </Container>
  )
}

