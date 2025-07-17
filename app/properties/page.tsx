"use client"

import { PropertiesView } from "@/components/PropertiesView"
import { DashboardLayout } from "@/components/DashboardLayout"
import { useDashboard } from "@/hooks/useDashboard"

export default function PropertiesPage() {
  const {
    properties,
    handleAddProperty,
    handleEditProperty,
  } = useDashboard()

  return (
    <DashboardLayout>
      <PropertiesView
        properties={properties}
        onAddProperty={handleAddProperty}
        onEditProperty={handleEditProperty}
      />
    </DashboardLayout>
  )
}
