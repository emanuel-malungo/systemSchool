import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  className?: string;
}

// Utility function to merge classes, allowing overrides
const mergeClasses = (...classes: (string | undefined)[]): string => {
  return classes.filter(Boolean).join(' ').trim();
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "lg",
  loading = false,
  className = "",
  ...props
}) => {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[#0f355c] hover:bg-[#0f355c] focus:ring-2 focus:ring-[#113F6A]/40 focus:outline-none text-white cursor-pointer",
    secondary:
      "bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:outline-none text-gray-700 border-gray-300 cursor-pointer",
    ghost: "bg-transparent hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 focus:outline-none text-gray-700 border-transparent cursor-pointer",
    danger: "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500/40 focus:outline-none text-white cursor-pointer",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "px-3 py-2 text-xs h-8",
    md: "px-4 py-2.5 text-sm h-10",
    lg: "px-6 py-3 text-base h-12",
  };

  // Base classes without variant/size specific styles
  const baseClasses = `
    rounded-lg font-medium
    shadow-sm hover:shadow-md
    transform hover:scale-[1.01] active:scale-[0.99]
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:transform-none
    flex items-center justify-center gap-2
    text-center
    leading-tight
    border
    focus:outline-none
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      className={mergeClasses(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
      ) : (
        <span className="flex items-center justify-center gap-2 w-full">{children}</span>
      )}
    </button>
  );
};

export default Button;