import type { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

interface ContainerProps {
  children: ReactNode
}

export default function Container({ children }: ContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Fixo - Ocupa 100vh */}
      <Sidebar />
      
      {/* Conteúdo à direita */}
      <div className="flex-1 flex flex-col min-h-screen pl-64 min-w-0">
        {/* Header Fixo - No topo à direita */}
        <Header />
        
        {/* Conteúdo Principal */}
        <main className="flex-1 pt-16 flex flex-col justify-between">
          <div className="p-8 flex-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

