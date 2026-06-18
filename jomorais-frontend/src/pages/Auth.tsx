import { legacyAuthSchema } from "../validations/auth.validations"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import type { LegacyLoginCredentials } from "../types/auth.types"
import { usePageTitle } from "../hooks/usePageTitle"

export default function AuthPage() {
  usePageTitle("Autenticação")
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
    } catch (error) {
      console.error("Erro ao fazer login:", error)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Logotipo/Branding no Canto Superior Esquerdo */}
      <div className="absolute top-8 left-8 flex items-center gap-3 select-none z-20">
        <div className="w-10 h-10 bg-[#007C00] rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-sm">
          J
        </div>
        <span className="text-gray-700 font-bold text-xl tracking-wider">JOMORAIS</span>
      </div>

      {/* Área Central do Formulário */}
      <div className="flex-1 flex items-center justify-center px-4 pt-24 pb-12 z-10">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-gray-700 tracking-wider uppercase">
              BEM-VINDO DE VOLTA!
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Campo Usuário */}
            <div className="space-y-1">
              <Controller
                name="user"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="usuário"
                    className={`
                      w-full px-4 py-3.5 rounded-lg
                      bg-gray-50 hover:bg-gray-100/75
                      text-gray-700 placeholder:text-gray-400 text-center placeholder:text-center
                      border border-transparent
                      focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100
                      transition-all duration-200
                      ${errors.user ? "ring-2 ring-red-400" : ""}
                    `}
                  />
                )}
              />
              {errors.user?.message && (
                <p className="text-red-500 text-xs text-center mt-1">
                  {errors.user.message}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-1 relative">
              <Controller
                name="passe"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="senha"
                      className={`
                        w-full px-4 py-3.5 rounded-lg
                        bg-gray-50 hover:bg-gray-100/75
                        text-gray-700 placeholder:text-gray-400 text-center placeholder:text-center
                        border border-transparent
                        focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100
                        transition-all duration-200
                        ${errors.passe ? "ring-2 ring-red-400" : ""}
                      `}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                )}
              />
              {errors.passe?.message && (
                <p className="text-red-500 text-xs text-center mt-1">
                  {errors.passe.message}
                </p>
              )}
            </div>

            {/* Botão de Entrar */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#007C00] hover:bg-[#005a00] active:scale-[0.98] text-white font-bold rounded-lg tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#007C00]/40 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>

            {/* Link Esqueci a Senha */}
            <div className="text-center pt-2">
              <button
                type="button"
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-normal lowercase"
              >
                esqueceu a senha?
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Ilustração do Rodapé (Vetor Skyline em tons de Verde da plataforma) */}
      <div className="w-full shrink-0 select-none pointer-events-none relative z-0">
        <svg
          className="w-full h-40 md:h-52 lg:h-60"
          viewBox="0 0 1440 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* Sol / Detalhes de Fundo */}
          <circle cx="1080" cy="70" r="10" fill="#fbbf24" opacity="0.6" />
          <path d="M1065 65 L1069 68 L1065 71 L1061 68 Z" fill="#fbbf24" opacity="0.8" />
          <path d="M1095 55 L1097 57 L1095 59 L1093 57 Z" fill="#fbbf24" opacity="0.8" />

          {/* Avião voando no céu */}
          <g transform="translate(680, 45) scale(1.2)">
            <path
              d="M0 10 L15 12 L25 8 L22 13 L35 15 L22 17 L25 22 L15 18 L0 20 L5 15 Z"
              fill="#d1d5db"
              opacity="0.8"
            />
          </g>

          {/* Camada Traseira (Verde Claro / Menta) */}
          <path
            d="M0 200 V120 Q200 80 400 130 T800 110 Q1050 75 1200 130 T1440 115 V200 H0Z"
            fill="#a7f3d0"
            opacity="0.65"
          />

          {/* Camada Intermediária (Verde Médio / Esmeralda) */}
          {/* Silhueta de Prédio ao Fundo */}
          <rect x="220" y="80" width="45" height="120" rx="3" fill="#047857" />
          <polygon points="220,80 242.5,55 265,80" fill="#065f46" />
          
          <rect x="1120" y="70" width="70" height="130" rx="30" fill="#059669" />
          {/* Cruz no topo do Domo */}
          <rect x="1152" y="35" width="6" height="20" fill="#ffffff" />
          <rect x="1145" y="42" width="20" height="6" fill="#ffffff" />

          <path
            d="M0 200 V140 Q300 95 600 160 T1200 135 Q1350 110 1440 150 V200 H0Z"
            fill="#10b981"
            opacity="0.8"
          />

          {/* Camada Frontal (Verde Principal da Plataforma) */}
          {/* Escola / Castelo com bandeira */}
          <rect x="420" y="75" width="75" height="125" fill="#007C00" />
          <polygon points="420,75 457.5,35 495,75" fill="#005a00" />
          <line x1="457.5" y1="35" x2="457.5" y2="10" stroke="#9ca3af" strokeWidth="2" />
          <polygon points="457.5,10 478,17 457.5,24" fill="#fbbf24" />

          {/* Prédios modernos */}
          <rect x="700" y="95" width="60" height="105" fill="#007C00" />
          <rect x="745" y="115" width="50" height="85" fill="#005a00" />
          <rect x="780" y="130" width="65" height="70" fill="#007C00" />

          {/* Janelas amarelas brilhando */}
          <rect x="720" y="115" width="8" height="12" rx="1" fill="#fef08a" opacity="0.9" />
          <rect x="720" y="140" width="8" height="12" rx="1" fill="#fef08a" opacity="0.9" />
          <rect x="760" y="135" width="8" height="12" rx="1" fill="#fef08a" opacity="0.9" />
          <rect x="760" y="160" width="8" height="12" rx="1" fill="#fef08a" opacity="0.9" />

          {/* Pinheiros (árvores geométricas) */}
          <g transform="translate(120, 125)">
            <polygon points="15,0 0,30 30,30" fill="#004d00" />
            <polygon points="15,-15 5,15 25,15" fill="#005a00" />
            <rect x="12" y="30" width="6" height="15" fill="#78350f" />
          </g>
          <g transform="translate(155, 135)">
            <polygon points="12,0 0,22 24,22" fill="#004d00" />
            <polygon points="12,-12 4,10 20,10" fill="#005a00" />
            <rect x="10" y="22" width="4" height="12" fill="#78350f" />
          </g>
          <g transform="translate(920, 130)">
            <polygon points="15,0 0,30 30,30" fill="#004d00" />
            <polygon points="15,-15 5,15 25,15" fill="#005a00" />
            <rect x="12" y="30" width="6" height="15" fill="#78350f" />
          </g>

          {/* Terreno base e estrada */}
          <path
            d="M0 200 V165 Q250 155 500 175 T1000 165 Q1250 155 1440 180 V200 H0Z"
            fill="#005a00"
          />

          {/* Ônibus escolar amarelo passando */}
          <g transform="translate(860, 157)">
            <circle cx="10" cy="16" r="4.5" fill="#1f2937" />
            <circle cx="40" cy="16" r="4.5" fill="#1f2937" />
            <rect x="0" y="2" width="50" height="11" rx="1.5" fill="#fbbf24" />
            <rect x="45" y="4" width="5" height="5" fill="#1f2937" />
            <rect x="7" y="4" width="6" height="4" rx="0.5" fill="#ffffff" />
            <rect x="16" y="4" width="6" height="4" rx="0.5" fill="#ffffff" />
            <rect x="25" y="4" width="6" height="4" rx="0.5" fill="#ffffff" />
            <rect x="34" y="4" width="6" height="4" rx="0.5" fill="#ffffff" />
          </g>
        </svg>
      </div>
    </div>
  )
}

