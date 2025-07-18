import React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Eye, Heart, Share2 } from "lucide-react"
import { Property } from "@/types/property"

interface PropertyCardProps {
  property: Property
  onEdit?: (property: Property) => void
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onEdit,
}) => {
  const router = useRouter()

  const handleViewDetails = () => {
    router.push(`/properties/${property.id}`)
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <Image
          src={property.images[0] || "/placeholder.svg"}
          alt={property.title}
          width={300}
          height={200}
          className="h-48 w-full object-cover"
        />
        <Badge
          className="absolute top-2 right-2"
          variant={property.status === "For Sale" ? "default" : "secondary"}
        >
          {property.status}
        </Badge>
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
        <div className="flex items-center justify-between text-sm mb-4">
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
          <Badge variant="outline">{property.notes} notes</Badge>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onEdit?.(property)}
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
