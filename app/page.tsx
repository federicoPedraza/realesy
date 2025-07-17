"use client"

import { DashboardView } from "@/components/DashboardView"
import { DashboardLayout } from "@/components/DashboardLayout"
import { useDashboard } from "@/hooks/useDashboard"

export default function Home() {
  const { dashboardStats, performanceMetrics, properties, handleAddProperty } = useDashboard()

  return (
    <DashboardLayout>
      <DashboardView
        stats={dashboardStats}
        recentProperties={properties.slice(0, 3)}
        performance={performanceMetrics}
        onAddProperty={handleAddProperty}
      />
    </DashboardLayout>
  )
}
