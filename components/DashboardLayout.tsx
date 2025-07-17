import React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Sidebar } from "./Sidebar"
import { useDashboard } from "@/hooks/useDashboard"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { sidebarItems, activeView, setActiveView, currentUser } = useDashboard()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar
          items={sidebarItems}
          activeId={activeView}
          onItemClick={setActiveView}
          user={currentUser}
        />
        <main className="flex-1 p-6">
          <div className="flex items-center mb-6">
            <SidebarTrigger className="mr-4" />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
