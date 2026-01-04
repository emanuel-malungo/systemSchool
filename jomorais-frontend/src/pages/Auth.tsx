import Button from "../components/common/Button"
import Input from "../components/common/Input"
import { legacyAuthSchema } from "../validations/auth.validations"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { User, Lock, GraduationCap, BookOpen, Users } from "lucide-react"
import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import type { LegacyLoginCredentials } from "../types/auth.types"

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LegacyLoginCredentials>({
    resolver: yupResolver(legacyAuthSchema),
    defaultValues: {
      user: "",
      passe: ""
    }
  })

  const onSubmit = async (data: LegacyLoginCredentials) => {
    try {
      await login(data)
      // Redirecionamento é feito automaticamente no contexto
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      // O erro já é tratado pelo authService com toast
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 min-h-[600px]">
          {/* Lado Esquerdo - Informações */}
          <div className="bg-linear-to-br from-[#007C00] to-[#005a00] p-12 flex flex-col justify-center text-white relative overflow-hidden">
            {/* Decoração de fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              {/* Logo/Ícone */}
              <div className="mb-8">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                  <GraduationCap size={40} className="text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-3">
                  Sistema de Gestão Escolar
                </h1>
                <p className="text-green-100 text-lg">
                  Educação de qualidade ao seu alcance
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 mt-12">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Gestão Acadêmica</h3>
                    <p className="text-green-100 text-sm">Controle completo do processo educacional</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Gestão de Alunos</h3>
                    <p className="text-green-100 text-sm">Acompanhamento individualizado</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Relatórios Detalhados</h3>
                    <p className="text-green-100 text-sm">Análises e métricas em tempo real</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito - Formulário */}
          <div className="p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Bem-vindo de volta!
                </h2>
                <p className="text-gray-600">
                  Entre com suas credenciais para acessar o sistema
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Campo de Usuário */}
                <Controller
                  name="user"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Usuário"
                      type="text"
                      placeholder="Digite seu usuário"
                      icon={User}
                      error={errors.user?.message}
                    />
                  )}
                />

                {/* Campo de Senha */}
                <Controller
                  name="passe"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Senha"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      icon={Lock}
                      error={errors.passe?.message}
                      showPasswordToggle
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                    />
                  )}
                />

                {/* Lembrar-me e Esqueci senha */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#007C00] border-gray-300 rounded focus:ring-[#007C00]"
                    />
                    <span className="text-sm text-gray-600">Lembrar-me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-[#007C00] hover:text-[#005a00] font-medium transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>

                {/* Botão de Login */}
                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="w-full bg-[#007C00] hover:bg-[#005a00] focus:ring-[#007C00]/40"
                >
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Ou</span>
                  </div>
                </div>

                {/* Botão Secundário */}
                <button
                  type="button"
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Solicitar Acesso
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  © 2025 Sistema de Gestão Escolar. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
