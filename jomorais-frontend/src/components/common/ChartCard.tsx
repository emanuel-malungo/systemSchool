import type { ComponentType, ReactNode } from 'react'
import type { LucideProps } from 'lucide-react'

interface ChartCardProps {
	title: string
	subtitle?: string
	icon?: ComponentType<LucideProps>
	children: ReactNode
	loading?: boolean
	actions?: ReactNode
	className?: string
}

export default function ChartCard({
	title,
	subtitle,
	icon: Icon,
	children,
	loading = false,
	actions,
	className = '',
}: ChartCardProps) {
	if (loading) {
		return (
			<div className={`bg-white rounded-2xl border border-gray-100 p-6 ${className}`}>
				<div className="animate-pulse">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
							<div>
								<div className="h-5 bg-gray-100 rounded w-32 mb-2"></div>
								<div className="h-3 bg-gray-100 rounded w-24"></div>
							</div>
						</div>
					</div>
					<div className="h-64 bg-gray-100 rounded-xl"></div>
				</div>
			</div>
		)
	}

	return (
		<div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden ${className}`}>
			<div className="p-6">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-4">
						{Icon && (
							<div className="w-10 h-10 flex items-center justify-center bg-[#3964d7]/10 rounded-xl">
								<Icon size={20} className="text-[#3964d7]" />
							</div>
						)}
						<div>
							<h3 className="text-sm font-black text-[#1e293b] leading-tight">{title}</h3>
							{subtitle && (
								<p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
							)}
						</div>
					</div>
					{actions && <div>{actions}</div>}
				</div>
				<div>{children}</div>
			</div>
		</div>
	)
}
