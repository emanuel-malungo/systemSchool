import Button from "../components/common/Button"
import Input from "../components/common/Input"
import { legacyAuthSchema } from "../validations/auth.validations"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { User, Lock, GraduationCap } from "lucide-react"
import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import type { LegacyLoginCredentials } from "../types/auth.types"
import icon from "../assets/images/iconEmalungo.png"

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
		} catch (error) {
			console.error("Erro ao fazer login:", error)
		}
	}

	return (
		<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden font-sans">
			{/* Decorative background elements */}
			<div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#3964d7]/5 blur-3xl animate-pulse"></div>
			<div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#3964d7]/5 blur-3xl animate-pulse delay-700"></div>

			<div className="w-full max-w-sm sm:max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
				<div className="bg-white rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(57,100,215,0.12)] border border-gray-100 overflow-hidden">
					<div className="p-8 sm:p-12">
						{/* Logo and Header */}
						<div className="flex flex-col items-center mb-10 text-center">
							<div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 p-4 sm:p-5 rounded-[2rem] mb-6 shadow-inner flex items-center justify-center transform hover:rotate-6 transition-transform duration-500">
								{icon ? (
									<img src={icon} alt="Logo" className="w-full h-full object-contain" />
								) : (
									<GraduationCap size={44} className="text-[#3964d7]" />
								)}
							</div>
							<h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight mb-2">
								Sistema Escolar
							</h1>
							<p className="text-gray-400 text-sm sm:text-[15px] font-medium leading-relaxed max-w-[260px]">
								Acesse sua conta para gerenciar sua jornada acadêmica
							</p>
						</div>

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							{/* Username Field */}
							<Controller
								name="user"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										type="text"
										placeholder="Seu nome de usuário"
										icon={User}
										error={errors.user?.message}
									/>
								)}
							/>

							{/* Password Field */}
							<Controller
								name="passe"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										type={showPassword ? "text" : "password"}
										placeholder="Sua senha de acesso"
										icon={Lock}
										error={errors.passe?.message}
										showPasswordToggle
										showPassword={showPassword}
										onTogglePassword={() => setShowPassword(!showPassword)}
									/>
								)}
							/>

							{/* Submit Button */}
							<div className="pt-2">
								<Button
									type="submit"
									loading={isSubmitting}
									className="w-full"
								>
									{isSubmitting ? "Autenticando..." : "Entrar no Sistema"}
								</Button>
							</div>

							{/* Support Link */}
							<div className="pt-2 flex flex-col items-center gap-6">
								<div className="flex items-center w-full gap-4">
									<div className="h-[1px] bg-gray-100 flex-1"></div>
									<span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Suporte Técnico</span>
									<div className="h-[1px] bg-gray-100 flex-1"></div>
								</div>

								<button
									type="button"
									className="group text-sm text-gray-400 hover:text-gray-900 font-semibold flex items-center gap-2 transition-all"
								>
									<div className="w-1.5 h-1.5 rounded-full bg-[#3964d7]/40 ring-4 ring-[#3964d7]/5 group-hover:bg-[#3964d7] transition-all"></div>
									Precisa de ajuda com o acesso?
								</button>
							</div>
						</form>
					</div>
				</div>

				{/* Legal Footer */}
				<div className="mt-10 text-center">
					<p className="text-[12px] text-gray-400 font-medium leading-loose">
						© 2025 <span className="text-gray-600 font-bold">Sistema de Gestão Escolar</span> <br />
						<span className="text-gray-400/60 uppercase tracking-widest text-[9px]">Excelência em Educação</span>
					</p>
				</div>
			</div>
		</div>
	)
}
