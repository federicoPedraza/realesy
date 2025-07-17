import React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Sidebar } from "./Sidebar"
import { DashboardView } from "./DashboardView"
import { PropertiesView } from "./PropertiesView"
import { AnalyticsView } from "./AnalyticsView"
import { useDashboard } from "@/hooks/useDashboard"

export const RealEstateDashboard: React.FC = () => {
  const {
    activeView,
    sidebarItems,
    currentUser,
    dashboardStats,
    performanceMetrics,
    properties,
    analyticsData,
    setActiveView,
    handleAddProperty,
    handleEditProperty,
  } = useDashboard()

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <DashboardView
            stats={dashboardStats}
            recentProperties={properties.slice(0, 3)}
            performance={performanceMetrics}
            onAddProperty={handleAddProperty}
          />
        )
      case "properties":
        return (
          <PropertiesView
            properties={properties}
            onAddProperty={handleAddProperty}
            onEditProperty={handleEditProperty}
          />
        )
      case "analytics":
        return <AnalyticsView {...analyticsData} />
      case "social":
        return (
          <div className="text-center py-12">
            <p>Social Media Management - Coming Soon</p>
          </div>
        )
      case "notes":
        return (
          <div className="text-center py-12">
            <p>Notes Management - Coming Soon</p>
          </div>
        )
      default:
        return (
          <DashboardView
            stats={dashboardStats}
            recentProperties={properties.slice(0, 3)}
            performance={performanceMetrics}
            onAddProperty={handleAddProperty}
          />
        )
    }
  }

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
          {renderActiveView()}
        </main>
      </div>
    </SidebarProvider>
  )
}
