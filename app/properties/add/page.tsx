"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "convex/react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { AddPropertyForm } from "@/components/AddPropertyForm"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

function AddPropertyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editPropertyId = searchParams?.get('id') as Id<"properties"> | null
  
  const isEditMode = !!editPropertyId

  // Fetch existing property data when in edit mode
  const property = useQuery(
    api.properties.getProperty, 
    editPropertyId ? { propertyId: editPropertyId } : "skip"
  )
  
  const customFields = useQuery(
    api.properties.getPropertyCustomFields,
    editPropertyId ? { propertyId: editPropertyId } : "skip"
  )
  
  const amenities = useQuery(
    api.properties.getPropertyAmenities,
    editPropertyId ? { propertyId: editPropertyId } : "skip"
  )
  
  const multimedia = useQuery(
    api.properties.getPropertyMultimedia,
    editPropertyId ? { propertyId: editPropertyId } : "skip"
  )

  const handleBack = () => {
    router.push("/properties")
  }

  const handlePropertyCreated = (propertyId: string) => {
    router.push(`/properties/${propertyId}`)
  }

  // Show loading state when in edit mode and data is still loading
  if (isEditMode && (property === undefined || customFields === undefined || amenities === undefined || multimedia === undefined)) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  // Show error if property not found in edit mode
  if (isEditMode && property === null) {
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
      <AddPropertyForm
        onBack={handleBack}
        onPropertyCreated={handlePropertyCreated}
        isEditMode={isEditMode}
        propertyId={editPropertyId}
        existingProperty={property}
        existingCustomFields={customFields}
        existingAmenities={amenities}
        existingMultimedia={multimedia}
      />
    </DashboardLayout>
  )
}

export default function AddPropertyPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="text-center py-12">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    }>
      <AddPropertyContent />
    </Suspense>
  )
}