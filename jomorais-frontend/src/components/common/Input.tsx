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
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-gray-700 text-sm font-medium">
          {label}
        </label>
      )}

      {/* Input com ícone e toggle */}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}

        <input
          type={type}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 rounded-lg
            ${Icon ? "pl-11" : "pl-4"}
            ${showPasswordToggle ? "pr-11" : "pr-4"}
            bg-white
            border border-gray-300
            text-gray-700 placeholder:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1A4F7A]
            transition-all duration-200
            ${error ? "ring-2 ring-red-400 border-red-400" : ""}
            ${className || ""}
          `.replace(/\s+/g, ' ').trim()}
          {...props}
        />

        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            onClick={onTogglePassword}
          >
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-600 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;