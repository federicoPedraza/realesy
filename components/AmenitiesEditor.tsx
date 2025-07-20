import React, { useState, useEffect, useRef } from "react"
import { useQuery, useMutation } from "convex/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Flame, Waves, Car, Wifi, Tv, AirVent, Dumbbell, Shield, TreePine, Building,
  Plus, X, Star, Home, MapPin, Clock, Coffee, Camera, Music, Gamepad2,
  Utensils, Bed, Bath, Zap, Sun, Moon, Heart, Lock, Key, Users, Edit
} from "lucide-react"
import { PropertyAmenityFormData, AmenityFormData } from "@/types/property"
import { api } from "@/convex/_generated/api"

interface AmenitiesEditorProps {
  amenities: PropertyAmenityFormData[]
  onAmenitiesChange: (amenities: PropertyAmenityFormData[]) => void
  isEditMode?: boolean
}

const COLOR_OPTIONS = [
  "text-red-500", "text-blue-500", "text-green-500", "text-yellow-500",
  "text-purple-500", "text-pink-500", "text-indigo-500", "text-orange-500",
  "text-cyan-500", "text-teal-500", "text-lime-500", "text-amber-500"
]

const ICON_OPTIONS = [
  { name: "Star", icon: Star },
  { name: "Flame", icon: Flame },
  { name: "Waves", icon: Waves },
  { name: "Car", icon: Car },
  { name: "Wifi", icon: Wifi },
  { name: "TV", icon: Tv },
  { name: "AirVent", icon: AirVent },
  { name: "Dumbbell", icon: Dumbbell },
  { name: "Shield", icon: Shield },
  { name: "TreePine", icon: TreePine },
  { name: "Building", icon: Building },
  { name: "Home", icon: Home },
  { name: "MapPin", icon: MapPin },
  { name: "Clock", icon: Clock },
  { name: "Coffee", icon: Coffee },
  { name: "Camera", icon: Camera },
  { name: "Music", icon: Music },
  { name: "Gamepad2", icon: Gamepad2 },
  { name: "Utensils", icon: Utensils },
  { name: "Bed", icon: Bed },
  { name: "Bath", icon: Bath },
  { name: "Zap", icon: Zap },
  { name: "Sun", icon: Sun },
  { name: "Moon", icon: Moon },
  { name: "Heart", icon: Heart },
  { name: "Lock", icon: Lock },
  { name: "Key", icon: Key },
  { name: "Users", icon: Users },
]

export const AmenitiesEditor: React.FC<AmenitiesEditorProps> = ({
  amenities,
  onAmenitiesChange,
  isEditMode = false
}) => {
  const [customAmenities, setCustomAmenities] = useState<{ [key: string]: AmenityFormData }>({})
  const [editingAmenity, setEditingAmenity] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [editingIcon, setEditingIcon] = useState("Star")
  const [editingColor, setEditingColor] = useState("text-gray-600")
  const [showIconSelector, setShowIconSelector] = useState(false)
  const [showColorSelector, setShowColorSelector] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [editingExistingAmenity, setEditingExistingAmenity] = useState<string | null>(null)
  const [limitHitAmenityIds, setLimitHitAmenityIds] = useState<Set<string>>(new Set())
  const panelRef = useRef<HTMLDivElement>(null)

  // Load amenities from database
  const allAmenities = useQuery(api.properties.getAllAmenities)
  const initializeDefaultAmenities = useMutation(api.properties.initializeDefaultAmenities)

  // Initialize default amenities in database if needed
  useEffect(() => {
    if (allAmenities && allAmenities.length === 0) {
      initializeDefaultAmenities({})
    }
  }, [allAmenities, initializeDefaultAmenities])

  // Initialize with available amenities if the list is empty
  useEffect(() => {
    if (!initialized && amenities.length === 0 && allAmenities && allAmenities.length > 0) {
      const defaultAmenities: PropertyAmenityFormData[] = allAmenities.map(amenity => ({
        amenityId: amenity._id,
        isAvailable: false,
        notes: ""
      }))
      onAmenitiesChange(defaultAmenities)
      setInitialized(true)
    } else if (amenities.length > 0) {
      setInitialized(true)
    }
  }, [amenities, onAmenitiesChange, initialized, allAmenities])

  // Click away to close panels
  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowIconSelector(false)
        setShowColorSelector(false)
      }
    }

    if (showIconSelector || showColorSelector) {
      document.addEventListener('mousedown', handleClickAway)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickAway)
    }
  }, [showIconSelector, showColorSelector])

  const toggleAmenity = (amenityId: string) => {
    const existingIndex = amenities.findIndex(a => a.amenityId === amenityId)
    
    if (existingIndex >= 0) {
      // Toggle isAvailable state
      const currentAmenity = amenities[existingIndex]
      const newIsAvailable = !currentAmenity.isAvailable
      
      // Check if we're trying to enable an amenity and we've reached the active limit
      if (newIsAvailable) {
        const activeCount = amenities.filter(a => a.isAvailable).length
        if (activeCount >= 18) {
          // Trigger pulsing animation for this specific amenity
          setLimitHitAmenityIds(prev => new Set([...prev, amenityId]))
          setTimeout(() => {
            setLimitHitAmenityIds(prev => {
              const newSet = new Set(prev)
              newSet.delete(amenityId)
              return newSet
            })
          }, 600) // Clear this specific amenity after animation
          return // Don't allow enabling more than 18 active amenities
        }
      }
      
      const newAmenities = amenities.map((amenity, index) =>
        index === existingIndex 
          ? { ...amenity, isAvailable: newIsAvailable }
          : amenity
      )
      onAmenitiesChange(newAmenities)
    } else {
      // Check if we've reached the total amenities limit (40)
      if (amenities.length >= 40) {
        return // Don't allow adding more than 40 total amenities
      }
      
      // Check if we're trying to add as active and we've reached the active limit
      const activeCount = amenities.filter(a => a.isAvailable).length
      if (activeCount >= 18) {
        return // Don't allow adding as active if we've reached the limit
      }
      
      // Add if not in list
      const newAmenity: PropertyAmenityFormData = {
        amenityId,
        isAvailable: true,
        notes: ""
      }
      onAmenitiesChange([...amenities, newAmenity])
    }
  }

  const removeAmenity = (amenityId: string) => {
    const newAmenities = amenities.filter(a => a.amenityId !== amenityId)
    onAmenitiesChange(newAmenities)
    
    // Remove from custom amenities if it exists (custom or overridden default)
    if (customAmenities[amenityId]) {
      const newCustomAmenities = { ...customAmenities }
      delete newCustomAmenities[amenityId]
      setCustomAmenities(newCustomAmenities)
    }
  }

  const createPlaceholderAmenity = () => {
    const customId = `custom-${Date.now()}`
    setEditingAmenity(customId)
    setEditingName("")
    setEditingIcon("Star")
    setEditingColor("text-gray-600")
  }

  const startEditingAmenity = (amenityId: string) => {
    const amenityInfo = getAmenityInfo(amenityId)
    setEditingAmenity(amenityId)
    setEditingName(amenityInfo.name || "")
    setEditingIcon(ICON_OPTIONS.find(io => io.icon === amenityInfo.icon)?.name || "Star")
    setEditingColor(amenityInfo.color || "text-gray-600")
    setShowIconSelector(false)
    setShowColorSelector(false)
  }

  const saveCustomAmenity = () => {
    if (!editingName || !editingAmenity) return

    const isEditingExisting = amenities.find(a => a.amenityId === editingAmenity)

    if (isEditingExisting) {
      // Update existing amenity
      if (editingAmenity.startsWith('custom-')) {
        // Update custom amenity info
        setCustomAmenities(prev => ({
          ...prev,
          [editingAmenity]: {
            name: editingName,
            icon: editingIcon,
            color: editingColor,
            category: "custom"
          }
        }))
      } else {
        // For default amenities being edited, store as custom override
        setCustomAmenities(prev => ({
          ...prev,
          [editingAmenity]: {
            name: editingName,
            icon: editingIcon,
            color: editingColor,
            category: "default-override"
          }
        }))
      }
    } else {
      // Check if we've reached the total amenities limit (40)
      if (amenities.length >= 40) {
        return // Don't allow adding more than 40 total amenities
      }
      
      // Create new custom amenity
      setCustomAmenities(prev => ({
        ...prev,
        [editingAmenity]: {
          name: editingName,
          icon: editingIcon,
          color: editingColor,
          category: "custom"
        }
      }))
      
      // Check if we can add as active or need to add as inactive
      const activeCount = amenities.filter(a => a.isAvailable).length
      const canAddAsActive = activeCount < 18
      
      // Add to amenities list with custom amenity details
      const newPropertyAmenity: PropertyAmenityFormData = {
        amenityId: editingAmenity,
        isAvailable: canAddAsActive, // Only set as active if under the limit
        notes: "",
        customAmenity: {
          name: editingName,
          icon: editingIcon,
          color: editingColor
        }
      }

      onAmenitiesChange([...amenities, newPropertyAmenity])
    }

    // Reset editing state
    setEditingAmenity(null)
    setEditingName("")
    setEditingIcon("Star")
    setEditingColor("text-gray-600")
    setShowIconSelector(false)
    setShowColorSelector(false)
  }

  const cancelEditing = () => {
    setEditingAmenity(null)
    setEditingExistingAmenity(null)
    setEditingName("")
    setEditingIcon("Star")
    setEditingColor("text-gray-600")
    setShowIconSelector(false)
    setShowColorSelector(false)
  }

  const startEditingExistingAmenity = (amenityId: string) => {
    if (!isEditMode) return
    
    const amenityToEdit = amenities.find(a => a.amenityId === amenityId)
    if (!amenityToEdit) return

    const amenityInfo = getAmenityInfo(amenityId)
    
    // Find the icon name by matching the icon component
    const iconName = amenityToEdit.editedAmenity?.icon || 
                    ICON_OPTIONS.find(io => io.icon === amenityInfo.icon)?.name || 
                    "Star"
    
    setEditingExistingAmenity(amenityId)
    setEditingName(amenityToEdit.editedAmenity?.name || amenityInfo.name || 'Amenity')
    setEditingIcon(iconName)
    setEditingColor(amenityToEdit.editedAmenity?.color || amenityInfo.color || "text-gray-600")
    setShowIconSelector(false)
    setShowColorSelector(false)
  }

  const saveExistingAmenityEdit = () => {
    if (!editingExistingAmenity || !editingName) return

    const updatedAmenities = amenities.map(amenity => {
      if (amenity.amenityId === editingExistingAmenity) {
        return {
          ...amenity,
          editedAmenity: {
            name: editingName,
            icon: editingIcon,
            color: editingColor
          }
        }
      }
      return amenity
    })

    onAmenitiesChange(updatedAmenities)
    
    setEditingExistingAmenity(null)
    setEditingName("")
    setEditingIcon("Star")
    setEditingColor("text-gray-600")
    setShowIconSelector(false)
    setShowColorSelector(false)
  }



  const getAmenityInfo = (amenityId: string) => {
    // Check for local edits first (during editing)
    const propertyAmenity = amenities.find(a => a.amenityId === amenityId)
    if (propertyAmenity?.editedAmenity) {
      const IconComponent = ICON_OPTIONS.find(io => io.name === propertyAmenity.editedAmenity!.icon)?.icon || Star
      return {
        id: amenityId,
        name: propertyAmenity.editedAmenity.name,
        icon: IconComponent,
        color: propertyAmenity.editedAmenity.color
      }
    }

    // Check for imported custom amenity data first (from CSV import)
    if (propertyAmenity?.customAmenity) {
      const IconComponent = ICON_OPTIONS.find(io => io.name === propertyAmenity.customAmenity!.icon)?.icon || Star
      return {
        id: amenityId,
        name: propertyAmenity.customAmenity.name,
        icon: IconComponent,
        color: propertyAmenity.customAmenity.color
      }
    }

    // Check for custom override first (edited default or custom amenity)
    const customAmenity = customAmenities[amenityId]
    if (customAmenity) {
      const IconComponent = ICON_OPTIONS.find(io => io.name === customAmenity.icon)?.icon || Star
      return {
        id: amenityId,
        name: customAmenity.name,
        icon: IconComponent,
        color: customAmenity.color
      }
    }

    // Check if it's a database amenity
    const dbAmenity = allAmenities?.find(a => a._id === amenityId)
    if (dbAmenity) {
      // Map icon name to component
      const IconComponent = ICON_OPTIONS.find(io => io.name === dbAmenity.icon)?.icon || Star
      return {
        id: amenityId,
        name: dbAmenity.name,
        icon: IconComponent,
        color: dbAmenity.color || "text-gray-600"
      }
    }

    // Fallback
    return {
      id: amenityId,
      name: "Custom Amenity",
      icon: Star,
      color: "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <style jsx>{`
        @keyframes limitHit {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-limit-hit {
          animation: limitHit 0.6s ease-in-out;
        }
      `}</style>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Amenities</h3>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
              Click amenities to enable/disable them
              {isEditMode && "  •  Click edit to customize name, icon & color"}
          </p>
          {(amenities.length >= 11 || amenities.filter(a => a.isAvailable).length >= 11) && (
            <p className={`text-sm ${limitHitAmenityIds.size > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {amenities.filter(a => a.isAvailable).length}/18 active • {amenities.length}/40 total
            </p>
          )}
        </div>
      </div>

      {/* Current Amenities Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {amenities.map((amenity) => {
          const amenityInfo = getAmenityInfo(amenity.amenityId)
          const Icon = amenityInfo.icon
          const isEnabled = amenity.isAvailable
          const isBeingEdited = editingAmenity === amenity.amenityId
          const isEditingExisting = editingExistingAmenity === amenity.amenityId
          
          if (isEditingExisting) {
            // Show edit form for existing amenity
            return (
              <Card key={amenity.amenityId} className="border-2 border-blue-300 bg-blue-50">
                <CardContent className="p-3 text-center space-y-3">
                  {/* Single Icon & Color Selector */}
                  <div className="flex justify-center">
                    <div className="relative" ref={panelRef}>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setShowIconSelector(!showIconSelector)
                          if (showIconSelector) {
                            setShowColorSelector(false)
                          }
                        }}
                        className="h-12 w-12 p-0"
                      >
                        {React.createElement(
                          ICON_OPTIONS.find(io => io.name === editingIcon)?.icon || Star,
                          { className: `h-8 w-8 ${editingColor}` }
                        )}
                      </Button>
                      
                      {/* Icons Panel */}
                      {showIconSelector && (
                        <div className="absolute top-12 left-1/2 transform translate-x-[-125px] bg-white border rounded-md shadow-lg p-4 z-10 min-w-[250px]">
                          <p className="text-xs font-medium mb-3 text-gray-600 text-center">Icons</p>
                          <div className="grid grid-cols-5 gap-2">
                            {ICON_OPTIONS.slice(0, 20).map((iconOption) => {
                              const IconComp = iconOption.icon
                              return (
                                <Button
                                  key={iconOption.name}
                                  type="button"
                                  variant={editingIcon === iconOption.name ? "default" : "ghost"}
                                  size="sm"
                                  onClick={() => {
                                    setEditingIcon(iconOption.name)
                                    setShowIconSelector(false)
                                    setShowColorSelector(true)
                                  }}
                                  className="h-9 w-9 p-0"
                                >
                                  <IconComp className="h-5 w-5" />
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Colors Panel */}
                      {showColorSelector && !showIconSelector && (
                        <div className="absolute top-12 left-1/2 transform translate-x-[-125px] bg-white border rounded-md shadow-lg p-4 z-10 min-w-[250px]">
                          <p className="text-xs font-medium mb-3 text-gray-600 text-center">Colors</p>
                          <div className="grid grid-cols-4 gap-2">
                            {COLOR_OPTIONS.map((color) => (
                              <Button
                                key={color}
                                type="button"
                                variant={editingColor === color ? "default" : "ghost"}
                                size="sm"
                                onClick={() => {
                                  setEditingColor(color)
                                  setShowColorSelector(false)
                                }}
                                className="h-9 w-9 p-0"
                              >
                                <div className={`h-5 w-5 rounded-full bg-current ${color}`} />
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="Amenity name"
                      className="text-xs h-7 w-32"
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex gap-1 justify-center">
                    <Button
                      type="button"
                      onClick={saveExistingAmenityEdit}
                      size="sm"
                      className="h-6 text-xs"
                      disabled={!editingName}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={cancelEditing}
                      size="sm"
                      className="h-6 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          }

          if (isBeingEdited) {
            // Show edit form inline for this amenity (custom amenities)
            return (
              <Card key={amenity.amenityId} className="border-2 border-blue-300 bg-blue-50">
                <CardContent className="p-3 text-center space-y-3">
                  {/* Single Icon & Color Selector */}
                  <div className="flex justify-center">
                    <div className="relative" ref={panelRef}>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setShowIconSelector(!showIconSelector)
                          if (showIconSelector) {
                            setShowColorSelector(false)
                          }
                        }}
                        className="h-12 w-12 p-0"
                      >
                        {React.createElement(
                          ICON_OPTIONS.find(io => io.name === editingIcon)?.icon || Star,
                          { className: `h-8 w-8 ${editingColor}` }
                        )}
                      </Button>
                      
                      {/* Icons Panel */}
                      {showIconSelector && (
                        <div className="absolute top-12 left-1/2 transform translate-x-[-125px] bg-white border rounded-md shadow-lg p-4 z-10 min-w-[250px]">
                          <p className="text-xs font-medium mb-3 text-gray-600 text-center">Icons</p>
                          <div className="grid grid-cols-5 gap-2">
                            {ICON_OPTIONS.slice(0, 20).map((iconOption) => {
                              const IconComp = iconOption.icon
                              return (
                                <Button
                                  key={iconOption.name}
                                  type="button"
                                  variant={editingIcon === iconOption.name ? "default" : "ghost"}
                                  size="sm"
                                  onClick={() => {
                                    setEditingIcon(iconOption.name)
                                    setShowIconSelector(false)
                                    setShowColorSelector(true)
                                  }}
                                  className="h-9 w-9 p-0"
                                >
                                  <IconComp className="h-5 w-5" />
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Colors Panel */}
                      {showColorSelector && !showIconSelector && (
                        <div className="absolute top-12 left-1/2 transform translate-x-[-125px] bg-white border rounded-md shadow-lg p-4 z-10 min-w-[250px]">
                          <p className="text-xs font-medium mb-3 text-gray-600 text-center">Colors</p>
                          <div className="grid grid-cols-4 gap-2">
                            {COLOR_OPTIONS.map((color) => (
                              <Button
                                key={color}
                                type="button"
                                variant={editingColor === color ? "default" : "ghost"}
                                size="sm"
                                onClick={() => {
                                  setEditingColor(color)
                                  setShowColorSelector(false)
                                }}
                                className="h-9 w-9 p-0"
                              >
                                <div className={`h-5 w-5 rounded-full bg-current ${color}`} />
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="Amenity name"
                      className="text-xs h-7 w-32"
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex gap-1 justify-center">
                    <Button
                      type="button"
                      onClick={saveCustomAmenity}
                      size="sm"
                      className="h-6 text-xs"
                      disabled={!editingName}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={cancelEditing}
                      size="sm"
                      className="h-6 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          }
          
          return (
            <Card 
              key={amenity.amenityId}
              className={`cursor-pointer transition-all hover:shadow-md border-2 relative group ${
                isEnabled 
                  ? 'border-gray-800 bg-gray-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              } ${
                limitHitAmenityIds.has(amenity.amenityId)
                  ? 'animate-limit-hit border-red-500 hover:border-red-500 bg-red-50' 
                  : ''
              }`}
              onClick={() => toggleAmenity(amenity.amenityId)}
            >
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isEditMode && !amenity.amenityId.startsWith('custom-')) {
                      startEditingExistingAmenity(amenity.amenityId)
                    } else {
                      startEditingAmenity(amenity.amenityId)
                    }
                  }}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-blue-500"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeAmenity(amenity.amenityId)
                  }}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <CardContent className="p-3 text-center">
                <Icon className={`h-6 w-6 mx-auto mb-2 ${
                  limitHitAmenityIds.has(amenity.amenityId)
                    ? 'text-red-500' 
                    : isEnabled ? amenityInfo.color : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  limitHitAmenityIds.has(amenity.amenityId)
                    ? 'text-red-500' 
                    : isEnabled ? 'text-foreground' : 'text-gray-500'
                }`}>
                  {amenityInfo.name}
                </p>
              </CardContent>
            </Card>
          )
        })}

        {/* Placeholder for new custom amenity */}
        {editingAmenity && !amenities.find(a => a.amenityId === editingAmenity) ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-3 text-center space-y-3">
              {/* Single Icon & Color Selector */}
              <div className="flex justify-center">
                <div className="relative" ref={panelRef}>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowIconSelector(!showIconSelector)
                      if (showIconSelector) {
                        setShowColorSelector(false)
                      }
                    }}
                    className="h-12 w-12 p-0"
                  >
                    {React.createElement(
                      ICON_OPTIONS.find(io => io.name === editingIcon)?.icon || Star,
                      { className: `h-8 w-8 ${editingColor}` }
                    )}
                  </Button>
                  
                  {/* Icons Panel */}
                  {showIconSelector && (
                    <div className="absolute top-12 left-1/2 transform translate-x-[-125px] bg-white border rounded-md shadow-lg p-4 z-10 min-w-[250px]">
                      <p className="text-xs font-medium mb-3 text-gray-600 text-center">Icons</p>
                      <div className="grid grid-cols-5 gap-2">
                        {ICON_OPTIONS.slice(0, 20).map((iconOption) => {
                          const IconComp = iconOption.icon
                          return (
                            <Button
                              key={iconOption.name}
                              type="button"
                              variant={editingIcon === iconOption.name ? "default" : "ghost"}
                              size="sm"
                              onClick={() => {
                                setEditingIcon(iconOption.name)
                                setShowIconSelector(false)
                                setShowColorSelector(true)
                              }}
                              className="h-9 w-9 p-0"
                            >
                              <IconComp className="h-5 w-5" />
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                                      {/* Colors Panel */}
                    {showColorSelector && !showIconSelector && (
                      <div className="absolute top-12 left-1/2 transform translate-x-[-125px] bg-white border rounded-md shadow-lg p-4 z-10 min-w-[250px]">
                        <p className="text-xs font-medium mb-3 text-gray-600 text-center">Colors</p>
                      <div className="grid grid-cols-4 gap-2">
                        {COLOR_OPTIONS.map((color) => (
                          <Button
                            key={color}
                            type="button"
                            variant={editingColor === color ? "default" : "ghost"}
                            size="sm"
                                                          onClick={() => {
                                setEditingColor(color)
                                setShowColorSelector(false)
                              }}
                            className="h-9 w-9 p-0"
                          >
                            <div className={`h-5 w-5 rounded-full bg-current ${color}`} />
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  placeholder="Amenity name"
                  className="text-xs h-7 w-32"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-1 justify-center">
                <Button
                  type="button"
                  onClick={saveCustomAmenity}
                  size="sm"
                  className="h-6 text-xs"
                  disabled={!editingName}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={cancelEditing}
                  size="sm"
                  className="h-6 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : amenities.length >= 40 ? (
          <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
            <CardContent className="p-3 text-center">
              <Plus className="h-6 w-6 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">Maximum 40 amenities reached</p>
            </CardContent>
          </Card>
        ) : (
          <Card 
            className="border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400"
            onClick={createPlaceholderAmenity}
          >
            <CardContent className="p-3 text-center">
              <Plus className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Add custom</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 