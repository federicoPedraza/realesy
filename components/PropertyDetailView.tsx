import React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Plus, ArrowLeft, ArrowRight, X, Flame, Waves, Car, Wifi, Tv, AirVent, Home, Pencil, Star, Calendar, Ruler, Users, Clock, Coffee, Camera, Music, Gamepad2, Utensils, Bed, Bath, Zap, Sun, Moon, Lock, Key, Dumbbell, Shield, TreePine, Building } from "lucide-react"
import { Property } from "@/types/property"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

interface PropertyDetailViewProps {
  property: Property
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({
  property,
}) => {
  const router = useRouter()
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0)
  const [isFullScreen, setIsFullScreen] = React.useState(false)
  const thumbnailRefs = React.useRef<(HTMLDivElement | null)[]>([])

  // Load real property data from database
  const propertyId = property.id as Id<"properties">
  const customFields = useQuery(api.properties.getPropertyCustomFields, { propertyId })
  const propertyAmenities = useQuery(api.properties.getPropertyAmenities, { propertyId })
  const multimedia = useQuery(api.properties.getPropertyMultimedia, { propertyId })

  const handleBack = () => {
    router.push("/properties")
  }

  const handleEdit = () => {
    router.push(`/properties/add?id=${property.id}`)
  }

  const getCurrentImages = () => {
    const images = multimedia?.filter(m => m.type === 'image') || []
    return images.length > 0 ? images.map(img => img.url) : (property.images || [])
  }

  const nextImage = () => {
    const images = getCurrentImages()
    setSelectedImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    const images = getCurrentImages()
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

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
  }, []) // Empty dependency array since we're using functions defined in component scope

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

  return (
    <div className="space-y-6">
      {/* Back Button and Actions */}
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
        <div className="space-y-6">
          <div>
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

          {/* Property Details - No Card Container */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span>Type:</span>
                <span className="font-medium">{property.type}</span>
              </div>
              
              {/* Display custom fields as property details */}
              {customFields?.map((field) => {
                const IconComponent = getIconComponent(field.icon)
                return (
                  <div key={field._id} className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <span>{field.name}:</span>
                    <span className="font-medium">
                      {field.fieldType === 'boolean' 
                        ? (field.value ? 'Yes' : 'No')
                        : field.fieldType === 'currency'
                        ? `$${field.value}`
                        : field.fieldType === 'percentage'
                        ? `${field.value}%`
                        : field.fieldType === 'metric'
                        ? `${field.value}${field.unit ? ` ${field.unit}` : ''}`
                        : String(field.value)
                      }
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-6">
        <div className="prose max-w-none">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {property.description}
          </p>
        </div>

        {/* Amenities integrated into description */}
        <div className="flex justify-center">
          <div className="bg-muted/50 rounded-lg p-6 w-full">
            <div className="flex flex-wrap justify-center gap-4">
              {amenities.map((amenity) => (
                <div key={amenity.name} className="flex flex-col items-center gap-2 text-center w-24 md:w-28 lg:w-32">
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
