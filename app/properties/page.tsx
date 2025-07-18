"use client"

import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { PropertiesView } from "@/components/PropertiesView"
import { DashboardLayout } from "@/components/DashboardLayout"
import { api } from "@/convex/_generated/api"
import { Property } from "@/types/property"

export default function PropertiesPage() {
  const router = useRouter()

  // Fetch properties from Convex
  const convexProperties = useQuery(api.properties.getProperties) || []

  // Convert Convex properties to the format expected by PropertiesView
  const properties = convexProperties.map(property => ({
    id: property._id, // Keep as string since Convex IDs are strings
    title: property.title,
    type: property.type,
    price: property.price,
    status: property.status,
    location: property.location,
    description: property.description,
    images: property.images,
    views: property.views || 0,
    likes: property.likes || 0,
    shares: property.shares || 0,
    notes: property.notes || 0,
    dateAdded: new Date(property._creationTime).toLocaleDateString(),
  }))

  const handleAddProperty = () => {
    router.push("/properties/add")
  }

  const handleEditProperty = (property: Property) => {
    // For now, just navigate to the property detail page
    router.push(`/properties/${property.id}`)
  }

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
