import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Property } from "@/types/property"
import {
  mockProperties,
  sidebarItems,
  dashboardStats,
  performanceMetrics,
  socialMediaStats,
  propertyNotes,
  currentUser
} from "@/data/mockData"

export const useDashboard = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  // Get active view from URL pathname
  const getActiveViewFromPath = (path: string) => {
    if (path === "/") return "dashboard"
    return path.slice(1) // Remove leading slash
  }

  const activeView = getActiveViewFromPath(pathname)

  // Mock analytics data
  const analyticsData = {
    totalViews: 12596,
    viewsChange: "+15% from last month",
    socialEngagement: 1234,
    engagementChange: "+8% from last month",
    inquiries: 89,
    inquiriesChange: "+23% from last month",
    conversionRate: 3.2,
    conversionChange: "+0.5% from last month",
    topProperties: mockProperties,
    socialStats: socialMediaStats,
  }

  // Navigate to different views
  const setActiveView = (viewId: string) => {
    const path = viewId === "dashboard" ? "/" : `/${viewId}`
    router.push(path)
  }

  // Mock handlers - these would be replaced with real API calls
  const handleAddProperty = () => {
    console.log("Add property clicked")
    // TODO: Implement add property logic
  }

  const handleEditProperty = (property: Property) => {
    console.log("Edit property:", property)
    // TODO: Implement edit property logic
  }

  const handleViewPropertyDetails = (property: Property) => {
    console.log("View property details:", property)
    // TODO: Implement view details logic
  }

  const handleAddImage = () => {
    console.log("Add image clicked")
    // TODO: Implement add image logic
  }

  const handleAddNote = () => {
    console.log("Add note clicked")
    // TODO: Implement add note logic
  }

  const handleSaveNote = (content: string) => {
    console.log("Save note:", content)
    // TODO: Implement save note logic
  }

  const handleShareToSocial = (platform: string) => {
    console.log("Share to social:", platform)
    // TODO: Implement social sharing logic
  }

  return {
    // State
    activeView,
    selectedProperty,

    // Data
    properties: mockProperties,
    sidebarItems,
    dashboardStats,
    performanceMetrics,
    propertyNotes,
    socialMediaStats,
    currentUser,
    analyticsData,

    // Actions
    setActiveView,
    setSelectedProperty,
    handleAddProperty,
    handleEditProperty,
    handleViewPropertyDetails,
    handleAddImage,
    handleAddNote,
    handleSaveNote,
    handleShareToSocial,
  }
}
