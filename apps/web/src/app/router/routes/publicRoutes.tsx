import { Navigate, type RouteObject } from "react-router-dom"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { AppErrorPage } from "../AppErrorPage"
import { RouteErrorPage } from "../RouteErrorPage"
export const publicRoutes: RouteObject[] = [
  { path: "/login", element: <LoginPage />, errorElement: <RouteErrorPage /> },
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "*", element: <AppErrorPage status={404} /> },
]
