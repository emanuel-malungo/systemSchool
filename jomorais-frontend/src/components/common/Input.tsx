import { Eye, EyeOff } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	type?: string;
	placeholder?: string;
	icon?: React.ComponentType<{ className?: string }>;
	error?: string;
	showPasswordToggle?: boolean;
	onTogglePassword?: () => void;
	showPassword?: boolean;
}

const Input: React.FC<InputProps> = ({
	label,
	type = "text",
	placeholder,
	icon: Icon,
	error,
	showPasswordToggle = false,
	onTogglePassword,
	showPassword = false,
	className,
	...props
}) => {
	return (
		<div className="space-y-2.5">
			{/* Label */}
			{label && (
				<label className="block text-gray-600 text-[14px] font-bold tracking-tight">
					{label}
				</label>
			)}

			{/* Input com ícone e toggle */}
			<div className="relative group">
				{Icon && (
					<Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 group-focus-within:text-[#3964d7] transition-colors duration-300" />
				)}

				<input
					type={type}
					placeholder={placeholder}
					className={`
            w-full px-5 py-4 rounded-2xl
            ${Icon ? "pl-12" : "pl-5"}
            ${showPasswordToggle ? "pr-12" : "pr-5"}
            bg-gray-50 border border-gray-100
            text-gray-700 placeholder:text-gray-400 placeholder:font-medium
            focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#3964d7]/5 focus:border-[#3964d7]/50
            transition-all duration-300 ease-in-out
            shadow-xs hover:border-gray-300
            ${error ? "ring-4 ring-red-500/5 border-red-500/50" : ""}
            ${className || ""}
          `.replace(/\s+/g, ' ').trim()}
					{...props}
				/>

				{showPasswordToggle && (
					<button
						type="button"
						className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
						onClick={onTogglePassword}
					>
						{showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
					</button>
				)}
			</div>

			{/* Mensagem de erro */}
			{error && (
				<p className="text-red-500 text-[12px] font-bold mt-1.5 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
					<span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
					{error}
				</p>
			)}
		</div>
	);
};

export default Input;