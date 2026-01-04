import { useAuth, usePermissions } from '../../hooks/useAuth'
import { Card } from '../common/Card'
import { Badge } from '../common/Badge'
import { CheckCircle, XCircle, User, Shield } from 'lucide-react'

export function UserPermissionsDebug() {
  const { user } = useAuth()
  const { permissions, userType, hasFullAccess } = usePermissions()

  if (!user) {
    return (
      <Card className="w-full max-w-2xl">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Usuário não autenticado</h3>
          </div>
        </div>
      </Card>
    )
  }

  const permissionItems = [
    { key: 'canAccessStudentManagement', label: 'Gestão de Alunos' },
    { key: 'canAccessAcademicManagement', label: 'Gestão Acadêmica' },
    { key: 'canAccessFinancial', label: 'Financeiro (Geral)' },
    { key: 'canAccessPayments', label: 'Pagamentos' },
    { key: 'canAccessInvoices', label: 'Faturas' },
    { key: 'canAccessFinancialReports', label: 'Relatórios Financeiros' },
    { key: 'canAccessSAFT', label: 'SAFT' },
    { key: 'canAccessReports', label: 'Relatórios' },
    { key: 'canAccessSettings', label: 'Configurações' },
  ]

  return (
    <Card className="w-full max-w-2xl">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Permissões do Usuário</h3>
        </div>

        {/* Informações do usuário */}
        <div className="p-4 bg-gray-50 rounded-lg mb-6">
          <h4 className="font-semibold mb-3">Informações do Usuário</h4>
          <div className="space-y-2 text-sm">
            {'nome' in user && <p><strong>Nome:</strong> {user.nome}</p>}
            {'name' in user && <p><strong>Nome:</strong> {user.name}</p>}
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Tipo:</strong> {user.tipo}</p>
            {'tipoDesignacao' in user && user.tipoDesignacao && (
              <p><strong>Designação:</strong> {user.tipoDesignacao}</p>
            )}
            {'estadoActual' in user && (
              <p><strong>Status:</strong> {user.estadoActual}</p>
            )}
          </div>
          <div className="mt-3">
            <Badge variant={hasFullAccess ? "default" : "secondary"}>
              {hasFullAccess ? "Acesso Total" : `Acesso Limitado (${userType})`}
            </Badge>
          </div>
        </div>

        {/* Lista de permissões */}
        <div>
          <h4 className="font-semibold mb-3">Permissões Detalhadas</h4>
          <div className="grid grid-cols-1 gap-2">
            {permissionItems.map(({ key, label }) => {
              const hasPermission = permissions[key as keyof typeof permissions]
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    hasPermission ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <span className="text-sm font-medium">{label}</span>
                  {hasPermission ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}