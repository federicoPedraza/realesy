"use client"

import { AnalyticsView } from "@/components/AnalyticsView"
import { DashboardLayout } from "@/components/DashboardLayout"
import { useDashboard } from "@/hooks/useDashboard"

export default function AnalyticsPage() {
  const { analyticsData } = useDashboard()

  return (
    <DashboardLayout>
      <AnalyticsView {...analyticsData} />
    </DashboardLayout>
  )
}
