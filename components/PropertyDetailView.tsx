import React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Plus, ArrowLeft, ArrowRight, X, Flame, Waves, Car, Wifi, Tv, AirVent, Home, Calendar, Ruler, Users, Eye, EyeOff, Eye as EyeIcon, Heart, Share2, FileText, Calendar as CalendarIcon } from "lucide-react"
import { Property, PropertyNote } from "@/types/property"

interface PropertyDetailViewProps {
  property: Property
  notes: PropertyNote[]
  onAddNote?: () => void
  onSaveNote?: (content: string) => void
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({
  property,
  notes,
  onAddNote,
  onSaveNote,
}) => {
  const router = useRouter()
  const [noteContent, setNoteContent] = React.useState("")
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0)
  const [isFullScreen, setIsFullScreen] = React.useState(false)
  const [showHiddenElements, setShowHiddenElements] = React.useState(false)

  const handleBack = () => {
    router.push("/properties")
  }

  const handleSaveNote = () => {
    if (noteContent.trim()) {
      onSaveNote?.(noteContent)
      setNoteContent("")
    }
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % property.images.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  const openFullScreen = () => setIsFullScreen(true)
  const closeFullScreen = () => setIsFullScreen(false)

  // Mock amenities data - in real app this would come from property data
  const allAmenities = [
    { name: "Grill", icon: Flame, available: true, color: "text-orange-500" },
    { name: "Pool", icon: Waves, available: true, color: "text-blue-500" },
    { name: "Garage", icon: Car, available: false, color: "text-gray-500" },
    { name: "WiFi", icon: Wifi, available: true, color: "text-purple-500" },
    { name: "TV", icon: Tv, available: true, color: "text-red-500" },
    { name: "AC", icon: AirVent, available: true, color: "text-cyan-500" },
  ]

  // Filter out unavailable amenities
  const amenities = allAmenities.filter(amenity => amenity.available)

  // Mock additional property data - in real app this would come from property data
  const propertyDetails = {
    age: "5 years",
    height: "2.8m",
    carCapacity: "0 cars", // Changed to 0 to test hiding
    maxOccupancy: "6 people",
    parkingSpaces: "0", // Changed to 0 to test hiding
    floorLevel: "Ground floor",
  }

  return (
    <div className="space-y-6">
      {/* Back Button and Toggle */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
                <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHiddenElements(!showHiddenElements)}
          className={showHiddenElements ? "" : "text-red-500 border-red-500 hover:bg-red-50"}
        >
          {showHiddenElements ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative">
            <Image
              src={property.images[selectedImageIndex] || "/placeholder.svg"}
              alt={`${property.title} - Image ${selectedImageIndex + 1}`}
              width={600}
              height={400}
              className="w-full h-96 object-cover rounded-lg cursor-pointer"
              onClick={openFullScreen}
            />
            {property.images.length > 1 && (
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
          {property.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {property.images.map((image, index) => (
                <Image
                  key={index}
                  src={image || "/placeholder.svg"}
                  alt={`${property.title} - Thumbnail ${index + 1}`}
                  width={80}
                  height={60}
                  className={`w-20 h-15 object-cover rounded cursor-pointer transition-opacity ${
                    index === selectedImageIndex ? 'opacity-100' : 'opacity-50'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                />
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
              ${property.price.toLocaleString()}
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
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span>Area:</span>
                <span className="font-medium">{property.area} sqft</span>
              </div>
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Bedrooms:</span>
                  <span className="font-medium">{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Bathrooms:</span>
                  <span className="font-medium">{property.bathrooms}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Age:</span>
                <span className="font-medium">{propertyDetails.age}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span>Height:</span>
                <span className="font-medium">{propertyDetails.height}</span>
              </div>
              {showHiddenElements || !propertyDetails.carCapacity.startsWith("0") ? (
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span>Car Capacity:</span>
                  <span className="font-medium">{propertyDetails.carCapacity}</span>
                </div>
              ) : null}
              {showHiddenElements || !propertyDetails.maxOccupancy.startsWith("0") ? (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Max Occupancy:</span>
                  <span className="font-medium">{propertyDetails.maxOccupancy}</span>
                </div>
              ) : null}
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
          <div className="bg-muted/50 rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-center">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {amenities.map((amenity) => (
                  <div key={amenity.name} className="flex items-center gap-2">
                    <amenity.icon className={`h-5 w-5 ${amenity.color}`} />
                    <span className="text-sm font-medium">{amenity.name}</span>
                  </div>
                ))}
                {/* Show unavailable amenities only when toggle is on */}
                {showHiddenElements && allAmenities
                  .filter(amenity => !amenity.available)
                  .map((amenity) => (
                    <div key={amenity.name} className="flex items-center gap-2 opacity-50">
                      <amenity.icon className={`h-5 w-5 ${amenity.color}`} />
                      <span className="text-sm font-medium">{amenity.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Section */}
      {showHiddenElements && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <EyeIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Views:</span>
              <span className="font-bold text-lg">{property.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm">Likes:</span>
              <span className="font-bold text-lg">{property.likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Share2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">Shares:</span>
              <span className="font-bold text-lg">{property.shares.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <FileText className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Notes:</span>
              <span className="font-bold text-lg">{property.notes.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <CalendarIcon className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Added:</span>
              <span className="font-bold text-lg">{property.dateAdded}</span>
            </div>
          </div>
        </div>
      )}

      {/* Notes Section */}
      {showHiddenElements && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Property Notes</CardTitle>
              <Button size="sm" onClick={onAddNote}>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notes.map((note) => (
                <Card key={note.id} className="bg-muted/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{note.title}</CardTitle>
                      <span className="text-xs text-muted-foreground">{note.date}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{note.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <Textarea
                placeholder="Add a new note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
              <Button onClick={handleSaveNote}>Save Note</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Screen Image Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
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
              src={property.images[selectedImageIndex] || "/placeholder.svg"}
              alt={`${property.title} - Full Screen ${selectedImageIndex + 1}`}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />
            {property.images.length > 1 && (
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
