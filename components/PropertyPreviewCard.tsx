import React, { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Eye, Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react"
import { Property } from "@/types/property"

interface PropertyPreviewCardProps {
  property: Property
}

export const PropertyPreviewCard: React.FC<PropertyPreviewCardProps> = ({
  property,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Get current images from property.images array
  const currentImages = useMemo(() => property.images || [], [property.images])

  // Pre-load images for smoother navigation
  useEffect(() => {
    if (currentImages.length <= 1) return

    const preloadImages = () => {
      const imagesToPreload = []
      
      // Preload next image
      const nextIndex = (currentImageIndex + 1) % currentImages.length
      imagesToPreload.push(currentImages[nextIndex])
      
      // Preload previous image
      const prevIndex = currentImageIndex === 0 ? currentImages.length - 1 : currentImageIndex - 1
      imagesToPreload.push(currentImages[prevIndex])
      
      // Preload images
      imagesToPreload.forEach((src) => {
        if (src && src !== '/placeholder.svg') {
          const img = new window.Image()
          img.src = src
        }
      })
    }

    preloadImages()
  }, [currentImages, currentImageIndex])

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => 
      prev === currentImages.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => 
      prev === 0 ? currentImages.length - 1 : prev - 1
    )
  }

  const goToImage = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    setCurrentImageIndex(index)
  }

  const hasMultipleImages = currentImages.length > 1

  // Reset image index if current images change
  useEffect(() => {
    if (currentImageIndex >= currentImages.length) {
      setCurrentImageIndex(0)
    }
  }, [currentImages.length, currentImageIndex])

  return (
    <Card className="overflow-hidden pt-0">
      <div className="relative">
        {currentImages.length > 0 ? (
          <Image
            src={currentImages[currentImageIndex]}
            alt={`${property.title} - Image ${currentImageIndex + 1}`}
            width={300}
            height={200}
            className="h-64 w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
            priority={currentImageIndex === 0} // Prioritize first image
          />
        ) : (
          <div className="h-64 w-full bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>No images available</p>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <Badge
          className="absolute top-2.5 right-2.5 z-10"
          variant={property.status === "For Sale" ? "default" : "secondary"}
        >
          {property.status}
        </Badge>

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">
            {currentImageIndex + 1} / {currentImages.length}
          </div>
        )}

        {/* Dots Navigation */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 right-2 flex space-x-1 z-10">
            {currentImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToImage(e, index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{property.title}</CardTitle>
          <span className="text-lg font-bold text-primary">
            ${property.price.toLocaleString()}
            {property.status === "For Rent" && "/mo"}
          </span>
        </div>
        <CardDescription className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {property.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {property.views}
            </div>
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-1" />
              {property.likes}
            </div>
            <div className="flex items-center">
              <Share2 className="h-4 w-4 mr-1" />
              {property.shares}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 