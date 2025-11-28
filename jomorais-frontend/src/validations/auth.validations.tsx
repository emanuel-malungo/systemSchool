import * as yup from "yup";

// Schema para sistema legado (user + passe)
export const legacyAuthSchema = yup.object().shape({
  user: yup.string()
	.required("Username é obrigatório"),
  passe: yup
	.string()
	.required("Senha é obrigatória")
});

// Schema para sistema moderno (email + senha)  
export const authSchema = yup.object().shape({
  email: yup.string()
	.email("Email inválido")
	.required("Email é obrigatório"),
  password: yup
	.string()
	.required("Senha é obrigatória")
	.min(6, "Senha deve ter pelo menos 6 caracteres"),
});
