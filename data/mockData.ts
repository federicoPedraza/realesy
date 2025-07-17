import {
  Building2,
  Home,
  FileText,
  Share2,
  BarChart3,
} from "lucide-react"
import { Property, SidebarItem, DashboardStats, PerformanceMetric, SocialMediaStats, PropertyNote, User } from "@/types/property"

export const mockProperties: Property[] = [
  {
    id: 1,
    title: "Modern Family Home",
    type: "House",
    price: 450000,
    status: "For Sale",
    location: "Downtown District",
    bedrooms: 4,
    bathrooms: 3,
    area: 2500,
    description: "This stunning modern family home offers the perfect blend of contemporary design and comfortable living. Located in the heart of Downtown District, this 4-bedroom, 3-bathroom residence features an open-concept layout with high ceilings, large windows that flood the space with natural light, and premium finishes throughout. The gourmet kitchen boasts stainless steel appliances and granite countertops, while the master suite includes a walk-in closet and en-suite bathroom. The property also features a spacious backyard perfect for outdoor entertaining and a 2-car garage. This home is ideal for families seeking luxury, comfort, and convenience in a prime location.",
    images: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
    views: 1250,
    likes: 89,
    shares: 23,
    notes: 3,
    dateAdded: "2024-01-15",
  },
  {
    id: 2,
    title: "Luxury Apartment",
    type: "Apartment",
    price: 2800,
    status: "For Rent",
    location: "City Center",
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    description: "Experience urban luxury living in this beautifully appointed 2-bedroom, 2-bathroom apartment located in the vibrant City Center. This modern unit features floor-to-ceiling windows offering spectacular city views, hardwood floors throughout, and a designer kitchen with premium appliances. The open-concept living area is perfect for both relaxation and entertainment, while the spacious bedrooms provide comfortable retreats. Building amenities include a fitness center, rooftop terrace, 24/7 concierge service, and secure parking. Perfect for professionals or couples seeking a sophisticated lifestyle in the heart of the city with easy access to shopping, dining, and entertainment.",
    images: ["/placeholder.svg?height=200&width=300"],
    views: 890,
    likes: 45,
    shares: 12,
    notes: 1,
    dateAdded: "2024-01-20",
  },
  {
    id: 3,
    title: "Commercial Land",
    type: "Land",
    price: 750000,
    status: "For Sale",
    location: "Business District",
    bedrooms: 0,
    bathrooms: 0,
    area: 5000,
    description: "Prime commercial development opportunity in the thriving Business District. This 5,000 sqft parcel of land is perfectly positioned for commercial development with excellent visibility and accessibility. The property is zoned for commercial use and offers tremendous potential for retail, office, or mixed-use development. Located on a major thoroughfare with high traffic flow, this land parcel provides excellent exposure for any business venture. The site is fully serviced with utilities and ready for immediate development. This represents an exceptional investment opportunity for developers or investors looking to capitalize on the area's growing commercial market.",
    images: ["/placeholder.svg?height=200&width=300"],
    views: 456,
    likes: 12,
    shares: 5,
    notes: 2,
    dateAdded: "2024-01-10",
  },
]

export const sidebarItems: SidebarItem[] = [
  { title: "Dashboard", icon: Home, id: "dashboard" },
  { title: "Properties", icon: Building2, id: "properties" },
  { title: "Analytics", icon: BarChart3, id: "analytics" },
  { title: "Social Media", icon: Share2, id: "social" },
  { title: "Notes", icon: FileText, id: "notes" },
]

export const dashboardStats: DashboardStats = {
  totalProperties: 24,
  totalViews: 12596,
  activeListings: 18,
  revenue: 45231,
  propertiesChange: "+2 from last month",
  viewsChange: "+15% from last month",
  listingsChange: "3 pending approval",
  revenueChange: "+8% from last month",
}

export const performanceMetrics: PerformanceMetric[] = [
  { label: "Views this month", value: 2596, maxValue: 3500, percentage: 75 },
  { label: "Social engagement", value: 1234, maxValue: 2000, percentage: 60 },
  { label: "Inquiries", value: 89, maxValue: 200, percentage: 45 },
]

export const socialMediaStats: SocialMediaStats[] = [
  { platform: "Facebook", reach: 2456, engagements: 156, lastPosted: "3 days ago" },
  { platform: "Instagram", reach: 1890, engagements: 234, lastPosted: "1 week ago" },
  { platform: "Twitter", reach: 1234, engagements: 89, lastPosted: "2 days ago" },
]

export const propertyNotes: PropertyNote[] = [
  {
    id: "1",
    title: "Follow-up with client",
    content: "Client showed interest in the property. Schedule a viewing for next week.",
    date: "2 days ago",
  },
  {
    id: "2",
    title: "Price adjustment needed",
    content: "Market analysis suggests reducing price by 5% to attract more buyers.",
    date: "1 week ago",
  },
]

export const currentUser: User = {
  name: "John Doe",
  role: "Agent",
  avatar: "/placeholder.svg?height=32&width=32",
  initials: "JD",
}

// Utility functions for data manipulation
export const getPropertyById = (id: number): Property | undefined => {
  return mockProperties.find(property => property.id === id)
}

export const getPropertiesByType = (type: string): Property[] => {
  if (type === "all") return mockProperties
  return mockProperties.filter(property => property.type.toLowerCase() === type.toLowerCase())
}

export const getPropertiesByStatus = (status: string): Property[] => {
  if (status === "all") return mockProperties
  return mockProperties.filter(property => property.status.toLowerCase() === status.toLowerCase())
}

export const searchProperties = (query: string): Property[] => {
  const lowercaseQuery = query.toLowerCase()
  return mockProperties.filter(property =>
    property.title.toLowerCase().includes(lowercaseQuery) ||
    property.location.toLowerCase().includes(lowercaseQuery)
  )
}
