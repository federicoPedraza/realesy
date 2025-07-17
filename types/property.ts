export interface Property {
  id: number
  title: string
  type: PropertyType
  price: number
  status: PropertyStatus
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  description: string
  images: string[]
  views: number
  likes: number
  shares: number
  notes: number
  dateAdded: string
}

export type PropertyType = 'House' | 'Apartment' | 'Land' | 'Commercial'
export type PropertyStatus = 'For Sale' | 'For Rent' | 'Sold'

export interface SidebarItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  id: string
}

export interface DashboardStats {
  totalProperties: number
  totalViews: number
  activeListings: number
  revenue: number
  propertiesChange: string
  viewsChange: string
  listingsChange: string
  revenueChange: string
}

export interface PerformanceMetric {
  label: string
  value: number
  maxValue: number
  percentage: number
}

export interface SocialMediaStats {
  platform: string
  reach: number
  engagements: number
  lastPosted: string
}

export interface PropertyNote {
  id: string
  title: string
  content: string
  date: string
}

export interface User {
  name: string
  role: string
  avatar: string
  initials: string
}
