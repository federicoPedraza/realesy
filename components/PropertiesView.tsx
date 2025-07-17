import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { Property } from "@/types/property"
import { PropertyCard } from "./PropertyCard"

interface PropertiesViewProps {
  properties: Property[]
  onAddProperty?: () => void
  onEditProperty?: (property: Property) => void
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  properties,
  onAddProperty,
  onEditProperty,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [propertyType, setPropertyType] = React.useState("all")
  const [propertyStatus, setPropertyStatus] = React.useState("all")

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = propertyType === "all" || property.type.toLowerCase() === propertyType.toLowerCase()
    const matchesStatus = propertyStatus === "all" || property.status.toLowerCase() === propertyStatus.toLowerCase()

    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Properties</h1>
        <Button onClick={onAddProperty}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search properties..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="land">Land</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
        <Select value={propertyStatus} onValueChange={setPropertyStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="for sale">For Sale</SelectItem>
            <SelectItem value="for rent">For Rent</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onEdit={onEditProperty}
          />
        ))}
      </div>
    </div>
  )
}
