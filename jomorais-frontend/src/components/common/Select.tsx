import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  error?: string;
  options: SelectOption[];
}

const Select: React.FC<SelectProps> = ({
  label,
  placeholder,
  icon: Icon,
  error,
  options,
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

      {/* Select com ícone */}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        )}

        <select
          className={`
            w-full px-4 py-3 rounded-lg
            ${Icon ? "pl-11" : "pl-4"}
            pr-10
            bg-white
            border border-gray-300
            text-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1A4F7A]
            transition-all duration-200
            appearance-none
            cursor-pointer
            ${error ? "ring-2 ring-red-400 border-red-400" : ""}
            ${className || ""}
          `.replace(/\s+/g, ' ').trim()}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Ícone de seta */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
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

export default Select;
