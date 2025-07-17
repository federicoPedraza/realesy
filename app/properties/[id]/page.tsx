"use client"

import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/DashboardLayout"
import { PropertyDetailView } from "@/components/PropertyDetailView"
import { useDashboard } from "@/hooks/useDashboard"
import { getPropertyById } from "@/data/mockData"

export default function PropertyDetailPage() {
  const params = useParams()
  const propertyId = parseInt(params.id as string)

  const { propertyNotes, handleAddNote, handleSaveNote } = useDashboard()

  const property = getPropertyById(propertyId)

  if (!property) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p>Property not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <PropertyDetailView
        property={property}
        notes={propertyNotes}
        onAddNote={handleAddNote}
        onSaveNote={handleSaveNote}
      />
    </DashboardLayout>
  )
}
