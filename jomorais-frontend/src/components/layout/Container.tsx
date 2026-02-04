import type { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

interface ContainerProps {
	children: ReactNode
}

export default function Container({ children }: ContainerProps) {
	return (
		<div className="min-h-screen bg-[#f8fafc] flex">
			{/* Sidebar Fixo - Ocupa 100vh */}
			<Sidebar />

			{/* Área de Conteúdo à Direita */}
			<div className="flex-1 flex flex-col min-h-screen ml-68 transition-all duration-300 min-w-0">
				{/* Header Fixo - No topo à direita */}
				<Header />

				{/* Conteúdo Principal */}
				<main className="flex-1 pt-24 px-4 sm:px-6 lg:px-8 pb-10">
					<div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
						{children}
					</div>
				</main>
			</div>
		</div>
	)
}
