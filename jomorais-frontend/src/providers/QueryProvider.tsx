// src/providers/AppProvider.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // não recarrega ao mudar de aba
      retry: 1, // tenta refazer a request uma vez
      staleTime: 1000 * 5000, // cache válido por 1 min
    },
  },
});

export const QueryProvider = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);
