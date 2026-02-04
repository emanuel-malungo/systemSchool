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
			"bg-[#3964d7] hover:bg-[#2d52b1] focus:ring-4 focus:ring-[#3964d7]/20 focus:outline-none text-white shadow-[0_10px_20px_-10px_rgba(57,100,215,0.4)]",
		secondary:
			"bg-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 focus:outline-none text-gray-700 border-gray-200 shadow-sm",
		ghost:
			"bg-transparent hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 focus:outline-none text-gray-600 border-transparent",
		danger:
			"bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-100 focus:outline-none text-white shadow-[0_10px_20px_-10px_rgba(239,68,68,0.4)]",
	};

	const sizes: Record<ButtonSize, string> = {
		sm: "px-4 py-2 text-xs h-9",
		md: "px-5 py-2.5 text-sm h-11",
		lg: "px-8 py-4 text-base h-14",
	};

	// Base classes with modern feel
	const baseClasses = `
    rounded-2xl font-bold
    transform transition-all duration-300 ease-out
    hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100
    flex items-center justify-center gap-2
    text-center border
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
				<div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
			) : (
				<span className="flex items-center justify-center gap-2 w-full">{children}</span>
			)}
		</button>
	);
};

export default Button;