import type { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

interface ContainerProps {
  children: ReactNode
}

export default function Container({ children }: ContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Fixo - Ocupa 100vh */}
      <Sidebar />
      
      {/* Header Fixo - No topo à direita */}
      <Header />
      
      {/* Conteúdo Principal */}
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
