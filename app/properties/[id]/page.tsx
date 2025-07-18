"use client"

import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { PropertyDetailView } from "@/components/PropertyDetailView"
import { useDashboard } from "@/hooks/useDashboard"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

export default function PropertyDetailPage() {
  const params = useParams()
  const propertyId = params.id as string

  const { propertyNotes, handleAddNote, handleSaveNote } = useDashboard()

  // Fetch property from Convex
  const property = useQuery(api.properties.getProperty, { 
    propertyId: propertyId as Id<"properties"> 
  })

  if (property === undefined) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (property === null) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p>Property not found</p>
        </div>
      </DashboardLayout>
    )
  }

  // Convert Convex property to the format expected by PropertyDetailView
  const formattedProperty = {
    id: property._id,
    title: property.title,
    type: property.type,
    price: property.price,
    currency: property.currency,
    status: property.status,
    location: property.location,
    description: property.description,
    images: property.images,
    views: property.views || 0,
    likes: property.likes || 0,
    shares: property.shares || 0,
    notes: property.notes || 0,
    dateAdded: new Date(property._creationTime).toLocaleDateString(),
  }

  return (
    <DashboardLayout>
      <PropertyDetailView
        property={formattedProperty}
        notes={propertyNotes}
        onAddNote={handleAddNote}
        onSaveNote={handleSaveNote}
      />
    </DashboardLayout>
  )
}
