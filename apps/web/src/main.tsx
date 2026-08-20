import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { DirectionProvider } from "@/components/ui/direction"


import "@workspace/ui/globals.css"
import { App } from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <DirectionProvider direction="rtl">
        <App />
      </DirectionProvider>
    </ThemeProvider>
  </StrictMode>
)
