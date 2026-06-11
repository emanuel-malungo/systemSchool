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
      <div className="flex-1 flex flex-col min-h-screen pl-64">
        {/* Header Fixo - No topo à direita */}
        <Header />
        
        {/* Conteúdo Principal */}
        <main className="flex-1 pt-16 flex flex-col justify-between">
          <div className="p-8 flex-1">
            {children}
          </div>
          
          {/* Rodapé Decorativo (Vetor Skyline em tons de Verde da plataforma) */}
          <div className="w-full shrink-0 select-none pointer-events-none mt-auto border-t border-gray-100 bg-white/80 backdrop-blur-xs">
            <svg
              className="w-full h-20"
              viewBox="0 0 1440 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              {/* Camada Traseira (Verde Claro / Menta) */}
              <path
                d="M0 80 V45 Q200 25 400 50 T800 40 Q1050 25 1200 50 T1440 45 V80 H0Z"
                fill="#a7f3d0"
                opacity="0.45"
              />

              {/* Camada Intermediária (Verde Médio / Esmeralda) */}
              <path
                d="M0 80 V55 Q300 35 600 60 T1200 50 Q1350 40 1440 60 V80 H0Z"
                fill="#10b981"
                opacity="0.5"
              />

              {/* Camada Frontal (Verde Principal da Plataforma) */}
              <path
                d="M0 80 V65 Q250 60 500 70 T1000 65 Q1250 60 1440 72 V80 H0Z"
                fill="#007C00"
                opacity="0.55"
              />
            </svg>
          </div>
        </main>
      </div>
    </div>
  )
}

