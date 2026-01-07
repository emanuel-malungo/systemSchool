import { X, Edit2, User, Calendar, Phone, Mail, MapPin, FileText, GraduationCap, Building2 } from 'lucide-react'
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
          <div className="fixed inset-0 bg-black/20 transition-opacity" onClick={onClose} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007C00]"></div>
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/20 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header fixo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
            <h2 className="text-2xl font-bold text-gray-900">Detalhes do Estudante</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Conteúdo com scroll */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
            {/* Cabeçalho do Estudante */}
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <div className="h-16 w-16 rounded-full bg-[#007C00] flex items-center justify-center text-white text-2xl font-bold">
                {fullStudent.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{fullStudent.nome}</h3>
                {fullStudent.tb_matriculas && fullStudent.tb_matriculas.codigo && (
                  <p className="text-sm font-semibold text-[#007C00]">
                    ID Matrícula: #{fullStudent.tb_matriculas.codigo}
                  </p>
                )}
                {fullStudent.tb_status && (
                  <p className="text-sm text-gray-500">Status: {fullStudent.tb_status.designacao}</p>
                )}
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  fullStudent.sexo === 'Masculino' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-pink-100 text-pink-800'
                }`}>
                  {fullStudent.sexo}
                </span>
                {fullStudent.tb_nacionalidade && (
                  <p className="text-xs text-gray-500 mt-1">{fullStudent.tb_nacionalidade.designacao}</p>
                )}
              </div>
            </div>

            {/* Informações Pessoais */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nome do Pai</p>
                  <p className="text-base font-semibold text-gray-900">
                    {fullStudent.pai && fullStudent.pai !== '.' ? fullStudent.pai : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nome da Mãe</p>
                  <p className="text-base font-semibold text-gray-900">
                    {fullStudent.mae && fullStudent.mae !== '.' ? fullStudent.mae : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-[#007C00]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data de Nascimento</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(fullStudent.dataNascimento)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="text-base font-semibold text-gray-900">
                    {fullStudent.telefone && fullStudent.telefone !== '.' ? fullStudent.telefone : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-base font-semibold text-gray-900">
                    {fullStudent.email && fullStudent.email.trim() !== '' ? fullStudent.email : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Morada</p>
                  <p className="text-base font-semibold text-gray-900">
                    {fullStudent.morada || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Documentação */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#007C00]" />
                Documentação
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Nº Documento:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {fullStudent.n_documento_identificacao || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Localização */}
            {fullStudent.tb_comuna && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#007C00]" />
                  Localização
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Província:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {fullStudent.tb_comuna.tb_municipios?.tb_provincias?.designacao || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Município:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {fullStudent.tb_comuna.tb_municipios?.designacao || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Estado Civil:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {fullStudent.tb_estado_civil?.designacao || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Matrícula */}
            {fullStudent.tb_matriculas && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#007C00]" />
                  Informações de Matrícula
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Curso:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {fullStudent.tb_matriculas.tb_cursos?.designacao || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Data de Matrícula:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {formatDate(fullStudent.tb_matriculas.data_Matricula)}
                      </span>
                    </div>
                    {fullStudent.tb_matriculas.tb_utilizadores && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Matriculado por:</span>
                        <span className="ml-2 text-gray-900 font-medium">
                          {fullStudent.tb_matriculas.tb_utilizadores.nome}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Encarregado */}
            {fullStudent.tb_encarregados && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Encarregado de Educação</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nome:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {fullStudent.tb_encarregados.nome}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Telefone:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {fullStudent.tb_encarregados.telefone && fullStudent.tb_encarregados.telefone !== '.' ? fullStudent.tb_encarregados.telefone : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Footer com Ações */}
          <div className="flex gap-3 p-6 border-t border-gray-200 shrink-0">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Fechar
            </Button>
            <Button
              type="button"
              onClick={onEdit}
              variant="primary"
              className="flex-1 bg-[#007C00] hover:bg-[#005a00]"
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
