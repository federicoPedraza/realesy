import React from "react"
import Image from "next/image"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Plus, Share2 } from "lucide-react"
import { Property, PropertyNote, SocialMediaStats } from "@/types/property"

interface PropertyDetailDialogProps {
  property: Property
  notes: PropertyNote[]
  socialStats: SocialMediaStats[]
  onAddImage?: () => void
  onAddNote?: () => void
  onSaveNote?: (content: string) => void
  onShareToSocial?: (platform: string) => void
}

export const PropertyDetailDialog: React.FC<PropertyDetailDialogProps> = ({
  property,
  notes,
  socialStats,
  onAddImage,
  onAddNote,
  onSaveNote,
  onShareToSocial,
}) => {
  const [noteContent, setNoteContent] = React.useState("")

  const handleSaveNote = () => {
    if (noteContent.trim()) {
      onSaveNote?.(noteContent)
      setNoteContent("")
    }
  }

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl">{property.title}</DialogTitle>
        <DialogDescription className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {property.location}
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Property Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span>{property.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-semibold">${property.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={property.status === "For Sale" ? "default" : "secondary"}>{property.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Area:</span>
                  <span>{property.area} sqft</span>
                </div>
                {property.bedrooms > 0 && (
                  <div className="flex justify-between">
                    <span>Bedrooms:</span>
                    <span>{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex justify-between">
                    <span>Bathrooms:</span>
                    <span>{property.bathrooms}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Performance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Views:</span>
                  <span>{property.views}</span>
                </div>
                <div className="flex justify-between">
                  <span>Likes:</span>
                  <span>{property.likes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shares:</span>
                  <span>{property.shares}</span>
                </div>
                <div className="flex justify-between">
                  <span>Notes:</span>
                  <span>{property.notes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date Added:</span>
                  <span>{property.dateAdded}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Property Images</h3>
            <Button size="sm" onClick={onAddImage}>
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {property.images.map((image, index) => (
              <div key={index} className="relative group">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${property.title} - Image ${index + 1}`}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button variant="secondary" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Property Notes</h3>
            <Button size="sm" onClick={onAddNote}>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id}>
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
          <Textarea
            placeholder="Add a new note..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
          <Button onClick={handleSaveNote}>Save Note</Button>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Social Media Management</h3>
            <Button size="sm" onClick={() => onShareToSocial?.("all")}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Now
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {socialStats.map((stat) => (
              <Card key={stat.platform}>
                <CardHeader>
                  <CardTitle className="text-sm">{stat.platform}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Last Posted:</span>
                      <span>{stat.lastPosted}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Engagement:</span>
                      <span>{stat.engagements} engagements</span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => onShareToSocial?.(stat.platform)}
                    >
                      Post to {stat.platform}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Post Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write your social media post..."
                value={`🏡 Beautiful ${property.title} now available ${property.status.toLowerCase()}!\n\n📍 Located in ${property.location}\n💰 ${property.status === "For Rent" ? "$" + property.price.toLocaleString() + "/month" : "$" + property.price.toLocaleString()}\n\n#RealEstate #Property #${property.type}`}
                readOnly
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
