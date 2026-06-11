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
    <div className="space-y-1.5">
      {/* Label */}
      {label && (
        <label className="block text-gray-700 text-sm font-medium">
          {label}
        </label>
      )}

      {/* Input com ícone e toggle */}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}

        <input
          type={type}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 rounded-lg
            ${Icon ? "pl-10" : "pl-4"}
            ${showPasswordToggle ? "pr-11" : "pr-4"}
            bg-gray-50 hover:bg-gray-100/75
            border border-transparent
            text-sm text-gray-700 placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-[#007C00]/20 focus:bg-gray-100
            transition-all duration-200
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? "ring-2 ring-red-400/50 bg-red-50/30" : ""}
            ${className || ""}
          `.replace(/\s+/g, ' ').trim()}
          {...props}
        />

        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            onClick={onTogglePassword}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;