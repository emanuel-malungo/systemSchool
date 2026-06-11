import { X, Edit2, User, Users, Calendar, Phone, Mail, MapPin, FileText, GraduationCap, Building2 } from 'lucide-react'
import { useStudent } from '../../hooks/useStudent'
import type { Student } from '../../types/student.types'
import Button from '../common/Button'

interface StudentViewModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student | null
  onEdit: () => void
}

export default function StudentViewModal({
  isOpen,
  onClose,
  student,
  onEdit,
}: StudentViewModalProps) {
  // Busca dados completos do estudante
  const { data: studentData, isLoading } = useStudent(student?.codigo || 0, isOpen && !!student)
  
  // Usa os dados completos se disponíveis, senão usa os dados básicos
  const fullStudent = studentData?.data || student
  
  if (!isOpen || !student) return null
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#007C00]"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!fullStudent) return null

  const formatDate = (date: string | Record<string, unknown>) => {
    try {
      if (typeof date === 'string') {
        return new Date(date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      }
      return 'Data inválida'
    } catch {
      return 'Data inválida'
    }
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col transform transition-all">
          {/* Header fixo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
            <h2 className="text-xl font-bold text-gray-900">Detalhes do Estudante</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Conteúdo com scroll */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="space-y-8">
              {/* Cabeçalho do Estudante */}
              <div className="flex items-center gap-5 p-5 bg-green-50/50 border border-green-100/50 rounded-xl">
                <div className="h-16 w-16 rounded-full bg-linear-to-br from-[#007C00] to-[#005a00] flex items-center justify-center text-white text-xl font-bold shadow-sm shrink-0">
                  {getInitials(fullStudent.nome)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 truncate">{fullStudent.nome}</h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {fullStudent.tb_matriculas?.codigo && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-green-100 text-[#007C00]">
                        ID: #{fullStudent.tb_matriculas.codigo}
                      </span>
                    )}
                    {fullStudent.tb_status && (
                      <span className="text-sm font-medium text-gray-500">
                        Status: {fullStudent.tb_status.designacao}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md ${
                    fullStudent.sexo === 'Masculino' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'bg-pink-50 text-pink-700'
                  }`}>
                    {fullStudent.sexo}
                  </span>
                  {fullStudent.tb_nacionalidade && (
                    <p className="text-xs font-medium text-gray-500 mt-2">{fullStudent.tb_nacionalidade.designacao}</p>
                  )}
                </div>
              </div>

              {/* Informações Pessoais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Nome do Pai</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {fullStudent.pai && fullStudent.pai !== '.' ? fullStudent.pai : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Nome da Mãe</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {fullStudent.mae && fullStudent.mae !== '.' ? fullStudent.mae : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100/50">
                    <Calendar className="h-4 w-4 text-[#007C00]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Data de Nascimento</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(fullStudent.dataNascimento)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Telefone</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {fullStudent.telefone && fullStudent.telefone !== '.' ? fullStudent.telefone : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100/50">
                    <Mail className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Email</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {fullStudent.email && fullStudent.email.trim() !== '' ? fullStudent.email : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100/50">
                    <MapPin className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Morada</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {fullStudent.morada || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documentação */}
              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#007C00]" />
                  Documentação
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100/50">
                    <span className="text-xs font-medium text-gray-500 block mb-1">Nº Documento</span>
                    <span className="text-sm text-gray-900 font-semibold">
                      {fullStudent.n_documento_identificacao || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Localização */}
              {fullStudent.tb_comuna && (
                <div className="pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#007C00]" />
                    Localização
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100/50">
                      <span className="text-xs font-medium text-gray-500 block mb-1">Província</span>
                      <span className="text-sm text-gray-900 font-semibold">
                        {fullStudent.tb_comuna.tb_municipios?.tb_provincias?.designacao || '—'}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100/50">
                      <span className="text-xs font-medium text-gray-500 block mb-1">Município</span>
                      <span className="text-sm text-gray-900 font-semibold">
                        {fullStudent.tb_comuna.tb_municipios?.designacao || '—'}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100/50">
                      <span className="text-xs font-medium text-gray-500 block mb-1">Estado Civil</span>
                      <span className="text-sm text-gray-900 font-semibold">
                        {fullStudent.tb_estado_civil?.designacao || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Matrícula */}
              {fullStudent.tb_matriculas && (
                <div className="pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#007C00]" />
                    Informações de Matrícula
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100/50">
                      <span className="text-xs font-medium text-gray-500 block mb-1">Curso</span>
                      <span className="text-sm text-gray-900 font-semibold">
                        {fullStudent.tb_matriculas.tb_cursos?.designacao || '—'}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100/50">
                      <span className="text-xs font-medium text-gray-500 block mb-1">Data de Matrícula</span>
                      <span className="text-sm text-gray-900 font-semibold">
                        {formatDate(fullStudent.tb_matriculas.data_Matricula)}
                      </span>
                    </div>
                    {fullStudent.tb_matriculas.tb_utilizadores && (
                      <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100/50 sm:col-span-2">
                        <span className="text-xs font-medium text-gray-500 block mb-1">Matriculado por</span>
                        <span className="text-sm text-gray-900 font-semibold">
                          {fullStudent.tb_matriculas.tb_utilizadores.nome}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Encarregado */}
              {fullStudent.tb_encarregados && (
                <div className="pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#007C00]" />
                    Encarregado de Educação
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100/50">
                      <span className="text-xs font-medium text-gray-500 block mb-1">Nome</span>
                      <span className="text-sm text-gray-900 font-semibold">
                        {fullStudent.tb_encarregados.nome}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100/50">
                      <span className="text-xs font-medium text-gray-500 block mb-1">Telefone</span>
                      <span className="text-sm text-gray-900 font-semibold">
                        {fullStudent.tb_encarregados.telefone && fullStudent.tb_encarregados.telefone !== '.' ? fullStudent.tb_encarregados.telefone : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer com Ações */}
          <div className="flex justify-end gap-3 px-6 py-5 border-t border-gray-100 shrink-0 bg-gray-50/50 rounded-b-xl">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              size="md"
            >
              Fechar
            </Button>
            <Button
              type="button"
              onClick={onEdit}
              variant="primary"
              size="md"
            >
              <Edit2 className="h-4 w-4" />
              Editar Estudante
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
