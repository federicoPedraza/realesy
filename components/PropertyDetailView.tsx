import React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Plus, ArrowLeft, ArrowRight, X, Flame, Waves, Car, Wifi, Tv, AirVent, Home, Pencil, Star, Calendar, Ruler, Users, Clock, Coffee, Camera, Music, Gamepad2, Utensils, Bed, Bath, Zap, Sun, Moon, Lock, Key, Dumbbell, Shield, TreePine, Building, ChevronUp } from "lucide-react"
import { Property } from "@/types/property"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Contact } from "./Contact"

// Rich Text Renderer Component
const RichTextRenderer: React.FC<{ content: string }> = ({ content }) => {
  const formatText = (text: string) => {
    // Convert markdown-style formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/__(.*?)__/g, '<u>$1</u>') // Underline
      .replace(/\n/g, '<br />') // Line breaks
  }

  return (
    <div 
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: formatText(content) }}
    />
  )
}

interface PropertyDetailViewProps {
  property: Property | null
}

// Comprehensive skeleton for the entire page
const PropertyDetailSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Navigation buttons are always visible */}
    <div className="flex items-center gap-4 mb-4">
      <Button variant="outline" disabled>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Properties
      </Button>
      <Button variant="outline" size="sm" disabled>
        <Pencil className="h-4 w-4 mr-2" />
        Edit Property
      </Button>
    </div>

    {/* Main Content Grid */}
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left Column - Image Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative">
          <Skeleton className="w-full h-126 rounded-lg" />
        </div>
        
        {/* Thumbnail Row */}
        <div className="flex gap-2 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="w-20 h-15 rounded flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Right Column - Property Details */}
      <div className="space-y-6">
        {/* Property Header */}
        <div>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <div className="flex items-center mb-4">
            <Skeleton className="h-4 w-4 mr-1" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-6 w-20 mb-4" />
        </div>

        {/* Property Details Grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Property Type */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            
            {/* Custom Fields Skeletons */}
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Description Section */}
    <div className="space-y-6">
      {/* Description Text */}
      <div className="prose max-w-none">
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-18 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      {/* Amenities Section */}
      <div className="flex justify-center">
        <div className="bg-muted/50 rounded-lg p-6 w-full">
          <div className="flex flex-wrap justify-center gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center gap-2 text-center w-24 md:w-28 lg:w-32">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({
  property,
}) => {
  const router = useRouter()
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0)
  const [isFullScreen, setIsFullScreen] = React.useState(false)
  const [showAllCustomFields, setShowAllCustomFields] = React.useState(false)
  const thumbnailRefs = React.useRef<(HTMLDivElement | null)[]>([])

  // Load real property data from database
  const propertyId = property?.id as Id<"properties">
  const customFields = useQuery(api.properties.getPropertyCustomFields, 
    propertyId ? { propertyId } : "skip"
  )
  const propertyAmenities = useQuery(api.properties.getPropertyAmenities, 
    propertyId ? { propertyId } : "skip"
  )
  const multimedia = useQuery(api.properties.getPropertyMultimedia, 
    propertyId ? { propertyId } : "skip"
  )

  // Check loading states
  const isLoadingMultimedia = multimedia === undefined
  const isLoadingCustomFields = customFields === undefined
  const isLoadingAmenities = propertyAmenities === undefined

  // Show skeleton if any data is still loading
  const isLoading = isLoadingMultimedia || isLoadingCustomFields || isLoadingAmenities

  // Responsive custom field visibility
  const getVisibleCustomFieldCount = () => {
    // Use window width to determine how many fields to show initially
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width < 640) return 6 // mobile: 2 fields
      if (width < 1024) return 12 // tablet: 3 fields
      return 14 // desktop: 4 fields
    }
    return 14 // default for SSR
  }

  const [visibleFieldCount, setVisibleFieldCount] = React.useState(getVisibleCustomFieldCount())

  // Update visible field count on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setVisibleFieldCount(getVisibleCustomFieldCount())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Get visible custom fields
  const visibleCustomFields = customFields?.slice(0, showAllCustomFields ? customFields.length : visibleFieldCount) || []
  const hiddenFieldsCount = (customFields?.length || 0) - visibleFieldCount

  const handleBack = () => {
    router.push("/properties")
  }

  const handleEdit = () => {
    router.push(`/properties/add?id=${property?.id}`)
  }

  const getCurrentImages = React.useCallback(() => {
    const images = multimedia?.filter(m => m.type === 'image') || []
    return images.length > 0 ? images.map(img => img.url) : (property?.images || [])
  }, [multimedia, property?.images])

  const nextImage = React.useCallback(() => {
    const images = getCurrentImages()
    setSelectedImageIndex((prev) => (prev + 1) % images.length)
  }, [getCurrentImages])

  const prevImage = React.useCallback(() => {
    const images = getCurrentImages()
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [getCurrentImages])

  const openFullScreen = () => setIsFullScreen(true)
  const closeFullScreen = () => setIsFullScreen(false)

  // Scroll thumbnail into view when selected image changes
  React.useEffect(() => {
    const currentThumbnail = thumbnailRefs.current[selectedImageIndex]
    if (currentThumbnail) {
      currentThumbnail.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }, [selectedImageIndex])

  // Keyboard navigation for image carousel
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const images = getCurrentImages()
      if (images.length <= 1) return

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          prevImage()
          break
        case 'ArrowRight':
          event.preventDefault()
          nextImage()
          break
      }
    }

    // Add event listener when component is mounted
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [getCurrentImages, nextImage, prevImage])

  // Icon mapping function
  const getIconComponent = (iconName?: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      Flame, Waves, Car, Wifi, Tv, AirVent, Home, Star, MapPin, Plus, 
      Shield, TreePine, Building, Calendar, Ruler, Users, Clock, Coffee, 
      Camera, Music, Gamepad2, Utensils, Bed, Bath, Zap, Sun, Moon, Lock, 
      Key, Dumbbell
    }
    return iconMap[iconName || 'Star'] || Star
  }

  // Get available amenities from real data
  const amenities = propertyAmenities?.filter(pa => pa.isAvailable).map(pa => {
    const IconComponent = getIconComponent(pa.amenity.icon)
    return {
      name: pa.amenity.name,
      icon: IconComponent,
      available: pa.isAvailable,
      color: pa.amenity.color || "text-gray-600",
      notes: pa.notes
    }
  }) || []

  // Show skeleton if property is null (still loading) or if any data is loading
  if (!property || isLoading) {
    return <PropertyDetailSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Back Button and Actions - Always visible */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
        <Button variant="outline" size="sm" onClick={handleEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit Property
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative">
            {getCurrentImages().length > 0 ? (
              <div
                tabIndex={0}
                className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                onKeyDown={(e) => {
                  const images = getCurrentImages()
                  if (images.length <= 1) return

                  switch (e.key) {
                    case 'ArrowLeft':
                      e.preventDefault()
                      prevImage()
                      break
                    case 'ArrowRight':
                      e.preventDefault()
                      nextImage()
                      break
                    case 'Enter':
                    case ' ':
                      e.preventDefault()
                      openFullScreen()
                      break
                  }
                }}
              >
                <Image
                  src={getCurrentImages()[selectedImageIndex]}
                  alt={`${property.title} - Image ${selectedImageIndex + 1}`}
                  width={600}
                  height={400}
                  className="w-full h-124 object-cover rounded-lg cursor-pointer"
                  onClick={openFullScreen}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Camera className="h-12 w-12 mx-auto mb-2" />
                  <p>No images available</p>
                </div>
              </div>
            )}
            {getCurrentImages().length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2"
                  onClick={prevImage}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={nextImage}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnail Preview */}
          {getCurrentImages().length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {getCurrentImages().map((image, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    thumbnailRefs.current[index] = el;
                  }}
                  className="flex-shrink-0"
                >
                  <Image
                    src={image}
                    alt={`${property.title} - Thumbnail ${index + 1}`}
                    width={80}
                    height={60}
                    className={`w-20 h-15 object-cover rounded cursor-pointer transition-opacity ${
                      index === selectedImageIndex ? 'opacity-100' : 'opacity-50'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overview Data */}
        <div className="relative h-full min-h-0">
          {/* Property Header and Details - Fixed at top */}
          <div className="flex-shrink-0">
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location}
              </div>
              <div className="text-2xl font-bold text-primary mb-4">
                {(() => {
                  const currency = property.currency || 'USD'
                  const currencySymbol = currency === 'USD' ? '$' : 
                                       currency === 'EUR' ? '€' : 
                                       currency === 'GBP' ? '£' : 
                                       currency === 'JPY' ? '¥' : 
                                       currency === 'CAD' ? 'C$' : 
                                       currency === 'AUD' ? 'A$' : 
                                       currency === 'CHF' ? 'Fr' : 
                                       currency === 'CNY' ? '¥' : '$'
                  return `${currencySymbol}${property.price.toLocaleString()} ${currency}`
                })()}
                {property.status === "For Rent" && "/mo"}
              </div>
              <Badge variant={property.status === "For Sale" ? "default" : "secondary"} className="mb-4">
                {property.status}
              </Badge>
            </div>

            {/* Property Details - Scrollable if needed */}
            <div className="flex-shrink-0 space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>Type:</span>
                  <span className="font-medium">{property.type}</span>
                </div>
                
                {/* Display custom fields as property details */}
                {visibleCustomFields.map((field) => {
                  const IconComponent = getIconComponent(field.icon)
                  
                  // Check if field value is empty
                  const isEmpty = field.value === null || field.value === undefined || field.value === '' || 
                                 (typeof field.value === 'string' && field.value.trim() === '') ||
                                 (typeof field.value === 'number' && field.value === 0 && field.fieldType !== 'metric')
                  
                  // Get the display value
                  const getDisplayValue = () => {
                    if (isEmpty) return 'Not provided'
                    if (field.fieldType === 'boolean') return field.value ? 'Yes' : 'No'
                    if (field.fieldType === 'currency') return `$${field.value}`
                    if (field.fieldType === 'percentage') return `${field.value}%`
                    if (field.fieldType === 'metric') return `${field.value}${field.unit ? ` ${field.unit}` : ''}`
                    return String(field.value)
                  }
                  
                  const displayValue = getDisplayValue()
                  
                  return (
                    <div key={field._id} className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="flex-shrink-0">{field.name}:</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span 
                              className={`font-medium truncate ${isEmpty ? 'text-muted-foreground italic' : ''}`}
                              title={displayValue}
                            >
                              {displayValue}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{displayValue}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )
                })}
              </div>

              {/* Show More/Less Custom Field Style */}
              {hiddenFieldsCount > 0 && !showAllCustomFields && (
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:font-bold hover:underline transition-all duration-200"
                  onClick={() => setShowAllCustomFields(true)}
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{hiddenFieldsCount} more fields</span>
                </div>
              )}

              {showAllCustomFields && customFields && customFields.length > visibleFieldCount && (
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:font-bold hover:underline transition-all duration-200"
                  onClick={() => setShowAllCustomFields(false)}
                >
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Show less</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Component - Fixed at bottom, expands upward */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <Contact />
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-6">
        <div className="prose max-w-none">
          <div className="text-lg leading-relaxed">
            <RichTextRenderer content={property.description} />
          </div>
        </div>

        {/* Amenities integrated into description */}
        <div className="flex justify-center">
          <div className="rounded-lg p-6 w-full">
            <div className="flex flex-wrap justify-center gap-4">
              {amenities.map((amenity, index) => (
                <div key={`${amenity.name}-${index}`} className="flex flex-col items-center gap-2 text-center w-24 md:w-28 lg:w-32">
                  <amenity.icon className={`h-5 w-5 ${amenity.color}`} />
                  <span className="text-sm font-medium">{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Full Screen Image Modal */}
      {isFullScreen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onKeyDown={(e) => {
            const images = getCurrentImages()
            if (images.length <= 1) return

            switch (e.key) {
              case 'ArrowLeft':
                e.preventDefault()
                prevImage()
                break
              case 'ArrowRight':
                e.preventDefault()
                nextImage()
                break
              case 'Escape':
                e.preventDefault()
                closeFullScreen()
                break
            }
          }}
          tabIndex={0}
        >
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 z-10"
              onClick={closeFullScreen}
            >
              <X className="h-4 w-4" />
            </Button>
            <Image
              src={getCurrentImages()[selectedImageIndex]}
              alt={`${property.title} - Full Screen ${selectedImageIndex + 1}`}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
            {getCurrentImages().length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  onClick={prevImage}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onClick={nextImage}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}