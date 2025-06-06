// contexts/dashboard-context.tsx
"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface DashboardContextType {
  content: ReactNode
  setContent: (content: ReactNode) => void
  breadcrumbPath: string[]
  setBreadcrumbPath: (path: string[]) => void
  pinVerified: boolean
  setPinVerified: (v: boolean) => void
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ReactNode>(null)
  const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>(["Главная"])
  const [pinVerified, setPinVerified] = useState(false)

  return (
    <DashboardContext.Provider value={{ content, setContent, breadcrumbPath, setBreadcrumbPath, pinVerified, setPinVerified }}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}