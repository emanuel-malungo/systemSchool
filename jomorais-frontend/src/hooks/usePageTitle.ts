import { useEffect } from 'react';

/**
 * Hook para alterar dinamicamente o título da página
 * @param title O título da página atual
 * @param prefix Opcional: Prefixo padrão. Por padrão é 'Jomorais'
 */
export function usePageTitle(title: string, prefix: string = 'Jomorais') {
  useEffect(() => {
    const previousTitle = document.title;
    
    // Define o novo título
    document.title = title ? `${title} | ${prefix}` : prefix;

    // Retorna ao título anterior quando o componente é desmontado (opcional, útil para modais ou rotas aninhadas)
    return () => {
      document.title = previousTitle;
    };
  }, [title, prefix]);
}
