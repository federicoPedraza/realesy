export interface Property {
  id: number | string
  title: string
  type: PropertyType
  price: number
  currency?: string
  status: PropertyStatus
  location: string
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

// New interfaces for the expanded property system
export interface MultimediaFile {
  _id: string
  propertyId: string
  type: 'image' | 'video' | 'document'
  filename: string
  fileSize?: number
  mimeType?: string
  url: string
  order?: number
  description?: string
  priority?: number
  _creationTime: number
}

export interface CustomField {
  _id: string
  propertyId: string
  name: string
  value: string | number | boolean
  fieldType: 'text' | 'number' | 'boolean' | 'metric' | 'currency' | 'percentage'
  unit?: string
  order?: number
  _creationTime: number
}

export interface Amenity {
  _id: string
  name: string
  icon?: string
  color?: string
  isDefault: boolean
  category?: string
  _creationTime: number
}

export interface PropertyAmenity {
  _id: string
  propertyId: string
  amenityId: string
  isAvailable: boolean
  notes?: string
  amenity: Amenity
  _creationTime: number
}

// Form interfaces for creating properties
export interface PropertyFormData {
  title: string
  description: string
  price: number
  currency?: string
  location: string
  type: PropertyType
  status: PropertyStatus
}

export interface CustomFieldFormData {
  name: string
  value: string | number | boolean
  fieldType: 'text' | 'number' | 'boolean' | 'metric' | 'currency' | 'percentage'
  unit?: string
  icon?: string
}

export interface AmenityFormData {
  name: string
  icon?: string
  color?: string
  category?: string
}

export interface PropertyAmenityFormData {
  amenityId: string
  isAvailable: boolean
  notes?: string
  customAmenity?: {
    name: string
    icon: string
    color: string
  }
  editedAmenity?: {
    name: string
    icon: string
    color: string
  }
}

// File upload interface
export interface FileUpload {
  file: File
  preview: string
  type: 'image' | 'video' | 'document'
  description?: string
}

// Existing interfaces
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

// Default amenities constants
export const DEFAULT_AMENITIES = [
  { name: "Grill", icon: "Flame", category: "recreation" },
  { name: "Pool", icon: "Waves", category: "recreation" },
  { name: "Garage", icon: "Car", category: "parking" },
  { name: "WiFi", icon: "Wifi", category: "utilities" },
  { name: "TV", icon: "Tv", category: "entertainment" },
  { name: "AC", icon: "AirVent", category: "utilities" },
  { name: "Gym", icon: "Dumbbell", category: "recreation" },
  { name: "Security", icon: "Shield", category: "security" },
  { name: "Garden", icon: "TreePine", category: "outdoor" },
  { name: "Balcony", icon: "Building", category: "outdoor" },
] as const;

// Field type options
export const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'metric', label: 'Metric (with unit)' },
  { value: 'currency', label: 'Currency' },
  { value: 'percentage', label: 'Percentage' },
] as const;

// Common units for metric fields
export const METRIC_UNITS = [
  'm', 'ft', 'cm', 'inches', 'kg', 'lbs', 'sqft', 'sqm', 'years', 'months', 'days'
] as const;

// Currency options
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
] as const;

// Types for Convex query results
export interface ConvexProperty {
  _id: string
  _creationTime: number
  title: string
  description: string
  price: number
  currency?: string
  location: string
  type: PropertyType
  status: PropertyStatus
  images: string[]
  views?: number
  likes?: number
  shares?: number
  notes?: number
}

export interface ConvexCustomField {
  _id: string
  _creationTime: number
  propertyId: string
  name: string
  value: string | number | boolean
  fieldType: 'text' | 'number' | 'boolean' | 'metric' | 'currency' | 'percentage'
  unit?: string
  icon?: string
  order?: number
}

export interface ConvexPropertyAmenity {
  _id: string
  _creationTime: number
  propertyId: string
  amenityId: string
  isAvailable: boolean
  notes?: string
  amenity: Amenity
}

export interface ConvexMultimedia {
  _id: string
  _creationTime: number
  propertyId: string
  type: 'image' | 'video' | 'document'
  filename: string
  fileSize?: number
  mimeType?: string
  url: string
  order?: number
  description?: string
  priority?: number
}
