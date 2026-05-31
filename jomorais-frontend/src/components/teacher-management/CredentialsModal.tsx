import { useState } from 'react'
import { X, Check, Copy, User, Lock, AlertTriangle } from 'lucide-react'
import Button from '../common/Button'

interface CredentialsModalProps {
  isOpen: boolean
  onClose: () => void
  credentials: {
    username: string
    senhaTemporaria: string
  } | null
}

export default function CredentialsModal({
  isOpen,
  onClose,
  credentials,
}: CredentialsModalProps) {
  const [copiedUsername, setCopiedUsername] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)

  if (!isOpen || !credentials) return null

  const handleCopyUsername = async () => {
    try {
      await navigator.clipboard.writeText(credentials.username)
      setCopiedUsername(true)
      setTimeout(() => setCopiedUsername(false), 2000)
    } catch (err) {
      console.error('Falha ao copiar username:', err)
    }
  }

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(credentials.senhaTemporaria)
      setCopiedPassword(true)
      setTimeout(() => setCopiedPassword(false), 2000)
    } catch (err) {
      console.error('Falha ao copiar senha:', err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop com desfoque de vidro suave */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        {/* Container do Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 transform transition-all duration-300 scale-100">
          
          {/* Faixa decorativa superior com gradiente verde */}
          <div className="h-2 bg-gradient-to-r from-green-500 to-[#007C00]" />

          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border border-green-200 animate-bounce">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Cadastro Concluído!</h3>
                <p className="text-xs text-gray-500">Credenciais geradas automaticamente</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 pt-2 space-y-6">
            
            {/* Aviso Importante */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-900">Copie as credenciais agora!</h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Por razões de segurança, a senha temporária é exibida apenas uma vez. Certifique-se de salvá-la e compartilhá-la com o professor.
                </p>
              </div>
            </div>

            {/* Credenciais */}
            <div className="space-y-4">
              
              {/* Campo Usuário */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 block">Nome de Utilizador</label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3 focus-within:ring-2 focus-within:ring-[#007C00]/20 focus-within:border-[#007C00] transition-all">
                  <User className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-sm font-mono font-medium text-gray-800 flex-1 select-all">
                    {credentials.username}
                  </span>
                  <button
                    onClick={handleCopyUsername}
                    type="button"
                    className={`p-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      copiedUsername 
                        ? 'bg-green-100 text-green-700 font-medium text-xs px-2' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {copiedUsername ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Campo Senha Temporária */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 block">Senha Temporária</label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3 focus-within:ring-2 focus-within:ring-[#007C00]/20 focus-within:border-[#007C00] transition-all">
                  <Lock className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-sm font-mono font-bold text-gray-900 flex-1 select-all">
                    {credentials.senhaTemporaria}
                  </span>
                  <button
                    onClick={handleCopyPassword}
                    type="button"
                    className={`p-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      copiedPassword 
                        ? 'bg-green-100 text-green-700 font-medium text-xs px-2' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {copiedPassword ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
            <Button
              type="button"
              variant="primary"
              onClick={onClose}
              className="bg-[#007C00] hover:bg-[#005a00] w-full text-center flex justify-center py-2.5 rounded-xl font-medium"
            >
              Entendido
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}
