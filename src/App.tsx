import { Toaster } from "react-hot-toast"
import { ConfirmationProvider } from "./contexts/ConfirmationContext"
import AppRouter from "./routes/AppRouter"

function App() {
  return (
    <div>
      <ConfirmationProvider>
        <AppRouter />
        <Toaster />
      </ConfirmationProvider>
    </div>
  )
}

export default App