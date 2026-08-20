import { Navigate, createBrowserRouter } from "react-router-dom"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { DashboardPlaceholderPage } from "@/features/dashboard/pages/DashboardPlaceholderPage"
import { ProtectedRoute } from "./ProtectedRoute"
export const router=createBrowserRouter([{path:"/login",element:<LoginPage/>},{element:<ProtectedRoute/>,children:[{path:"/dashboard",element:<DashboardPlaceholderPage/>}]},{path:"/",element:<Navigate to="/dashboard" replace/>},{path:"*",element:<Navigate to="/dashboard" replace/>}])