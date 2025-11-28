import { AuthProvider } from "./contexts/AuthContext"
import IndexRoutes from "./routes/index.routes.tsx"
import { TokenExpirationMonitor } from "./components/common/TokenExpirationMonitor"

export default function App() {
  return (
    <AuthProvider>
      <TokenExpirationMonitor />
      <IndexRoutes />
    </AuthProvider>
  )
}
