import { useState, useEffect } from 'react'
import { User, Mail, Phone, Award, Shield, Key, Loader2, UserCheck } from 'lucide-react'
import Container from '../../components/layout/Container'
import { ProfessorService, type IProfessorPerfil } from '../../services/professor.service'
import { toast } from 'react-toastify'
import { usePageTitle } from '../../hooks/usePageTitle'

export default function ProfessorPerfil() {
  usePageTitle('Perfil do Docente')
  const [profile, setProfile] = useState<IProfessorPerfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingPassword, setSavingPassword] = useState(false)

  // Form de alteração de senha
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await ProfessorService.getPerfil()
      setProfile(data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao carregar perfil do professor')
    } finally {
      setLoading(false)
    }
  }

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast.warning('Preencha todos os campos para alterar a senha')
      return
    }

    if (novaSenha !== confirmarSenha) {
      toast.error('A nova senha e a confirmação não coincidem')
      return
    }

    if (novaSenha.length < 4) {
      toast.warning('A nova senha deve ter no mínimo 4 caracteres')
      return
    }

    try {
      setSavingPassword(true)
      await ProfessorService.alterarSenha(senhaAtual, novaSenha)
      toast.success('Senha alterada com sucesso!')
      
      // Limpar form
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao alterar senha. Verifique a senha atual.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <Container>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Header com gradiente premium */}
        <div className="bg-gradient-to-r from-[#007C00] to-[#005a00] rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30 shadow-inner">
              <User size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{profile?.Nome || 'Carregando docente...'}</h1>
              <p className="text-green-100 mt-1 font-medium">Docente • {profile?.NumeroFuncionario || 'S/N'}</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-sm">
            <UserCheck size={14} /> Ativo no Sistema
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#007C00] mb-4" size={48} />
            <p className="text-gray-500 font-medium animate-pulse">Obtendo dados do perfil...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informações Pessoais e Acadêmicas */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6 flex items-center gap-2">
                  <Shield size={22} className="text-[#007C00]" /> Dados do Docente
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome Completo */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-50 rounded-xl text-[#007C00]">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">Nome Completo</p>
                      <p className="text-base font-semibold text-gray-700 mt-1">{profile?.Nome}</p>
                    </div>
                  </div>

                  {/* Número de Funcionário */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-50 rounded-xl text-[#007C00]">
                      <Award size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">Número do Funcionário</p>
                      <p className="text-base font-semibold text-gray-700 mt-1">{profile?.NumeroFuncionario || 'Não atribuído'}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-50 rounded-xl text-[#007C00]">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">Endereço de E-mail</p>
                      <p className="text-base font-semibold text-gray-700 mt-1">{profile?.Email || 'Não informado'}</p>
                    </div>
                  </div>

                  {/* Telefone */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-50 rounded-xl text-[#007C00]">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">Telefone</p>
                      <p className="text-base font-semibold text-gray-700 mt-1">{profile?.Telefone || 'Não informado'}</p>
                    </div>
                  </div>

                  {/* Especialidade */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-50 rounded-xl text-[#007C00]">
                      <Award size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">Especialidade</p>
                      <p className="text-base font-semibold text-gray-700 mt-1">{profile?.Especialidade || 'Geral'}</p>
                    </div>
                  </div>

                  {/* Grau Acadêmico */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-50 rounded-xl text-[#007C00]">
                      <Award size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">Grau Acadêmico</p>
                      <p className="text-base font-semibold text-gray-700 mt-1">{profile?.GrauAcademico || 'Licenciatura'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações da Conta */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6 flex items-center gap-2">
                  <Shield size={22} className="text-[#007C00]" /> Acesso ao Sistema
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">Nome de Utilizador</p>
                    <p className="text-base font-semibold text-gray-700 mt-1">{profile?.utilizador?.user}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">Tipo de Conta</p>
                    <p className="text-base font-semibold text-gray-700 mt-1">Professor (Legado)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário de Alteração de Senha */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6 flex items-center gap-2">
                <Key size={22} className="text-[#007C00]" /> Alterar Senha
              </h2>

              <form onSubmit={handleAlterarSenha} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-600">Senha Atual</label>
                  <input
                    type="password"
                    required
                    value={senhaAtual}
                    onChange={e => setSenhaAtual(e.target.value)}
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] transition-all"
                    placeholder="Digite sua senha atual"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600">Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] transition-all"
                    placeholder="Mínimo de 4 caracteres"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:border-[#007C00] transition-all"
                    placeholder="Repita a nova senha"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="mt-4 w-full bg-[#007C00] hover:bg-[#005a00] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-green-600/10 hover:shadow-green-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Atualizando...</span>
                    </>
                  ) : (
                    <>
                      <Key size={18} />
                      <span>Salvar Nova Senha</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}
