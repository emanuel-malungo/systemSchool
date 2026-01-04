import { UserPermissionsDebug } from '../../components/debug/UserPermissionsDebug'

export default function DebugPermissions() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Debug de Permissões
        </h1>
        <p className="text-gray-600">
          Visualize as permissões do usuário atual e informações do sistema de acesso.
        </p>
      </div>
      
      <div className="flex justify-center">
        <UserPermissionsDebug />
      </div>
    </div>
  )
}