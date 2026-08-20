import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@workspace/ui/globals.css"
import "./styles/globals.css"
import { App } from "./App"
import { AppProviders } from "@/app/providers/AppProviders"
document.documentElement.dir="rtl"; document.documentElement.lang="fa"
createRoot(document.getElementById("root")!).render(<StrictMode><AppProviders><App/></AppProviders></StrictMode>)