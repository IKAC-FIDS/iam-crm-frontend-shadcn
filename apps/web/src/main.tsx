import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@workspace/ui/globals.css"
import "./styles/globals.css"
import { App } from "./App"
import { AppProviders } from "@/app/providers/AppProviders"
import { installGlobalErrorCapture, reportWebVitals } from "@/lib/observability"
document.documentElement.dir = "rtl"
document.documentElement.lang = "fa"
installGlobalErrorCapture()
void reportWebVitals()
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
)
