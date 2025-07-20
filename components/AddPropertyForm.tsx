"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Save, Loader2, Bold, Italic, Underline, Eye, Upload } from "lucide-react"
import { PhotoUpload } from "@/components/PhotoUpload"
import { CustomFieldsEditor } from "@/components/CustomFieldsEditor"
import { AmenitiesEditor } from "@/components/AmenitiesEditor"
import { PropertyPreviewCard } from "@/components/PropertyPreviewCard"
import { ImportModal } from "@/components/ImportModal"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { uploadImage, uploadVideo, uploadDocument, getBucketForFileType } from "@/lib/supabase.lib"
import { 
  PropertyFormData, 
  CustomFieldFormData, 
  PropertyAmenityFormData, 
  FileUpload,
  ConvexProperty,
  ConvexCustomField,
  ConvexPropertyAmenity,
  ConvexMultimedia,
  CURRENCIES,
  Property
} from "@/types/property"

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

// Rich Text Editor Component
const RichTextEditor: React.FC<{
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}> = ({ value, onChange, placeholder, rows = 4 }) => {
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const applyFormat = (format: 'bold' | 'italic' | 'underline') => {
    const textarea = document.getElementById('rich-textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    if (selectedText) {
      let formattedText = selectedText
      switch (format) {
        case 'bold':
          formattedText = `**${selectedText}**`
          break
        case 'italic':
          formattedText = `*${selectedText}*`
          break
        case 'underline':
          formattedText = `__${selectedText}__`
          break
      }

      const newValue = value.substring(0, start) + formattedText + value.substring(end)
      onChange(newValue)

      // Set cursor position after the formatted text
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
      }, 0)
    } else {
      // If no text is selected, insert formatting markers and place cursor between them
      let markers = ''
      switch (format) {
        case 'bold':
          markers = '****'
          break
        case 'italic':
          markers = '**'
          break
        case 'underline':
          markers = '____'
          break
      }

      const newValue = value.substring(0, start) + markers + value.substring(end)
      onChange(newValue)

      // Set cursor position between the markers
      setTimeout(() => {
        textarea.focus()
        const markerLength = markers.length / 2
        textarea.setSelectionRange(start + markerLength, start + markerLength)
      }, 0)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    
    // Update button states based on cursor position
    const textarea = e.target
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    if (start === end) {
      // No selection, check if cursor is inside formatting
      const beforeCursor = value.substring(0, start)
      const afterCursor = value.substring(end)
      
      setIsBold(beforeCursor.endsWith('**') && afterCursor.startsWith('**'))
      setIsItalic(beforeCursor.endsWith('*') && afterCursor.startsWith('*') && !beforeCursor.endsWith('**'))
      setIsUnderline(beforeCursor.endsWith('__') && afterCursor.startsWith('__'))
    } else {
      // Text is selected, check if it's already formatted
      const selectedText = value.substring(start, end)
      setIsBold(selectedText.startsWith('**') && selectedText.endsWith('**'))
      setIsItalic(selectedText.startsWith('*') && selectedText.endsWith('*') && !selectedText.startsWith('**'))
      setIsUnderline(selectedText.startsWith('__') && selectedText.endsWith('__'))
    }
  }

  return (
    <div className="space-y-0">
      {/* Formatting Toolbar */}
      <div className="flex p-2 border rounded-t-lg bg-muted/50">
        <Button
          type="button"
          variant={isBold ? "default" : "ghost"}
          size="sm"
          onClick={() => applyFormat('bold')}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={isItalic ? "default" : "ghost"}
          size="sm"
          onClick={() => applyFormat('italic')}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={isUnderline ? "default" : "ghost"}
          size="sm"
          onClick={() => applyFormat('underline')}
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          variant={showPreview ? "default" : "ghost"}
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="h-8 px-3 text-xs"
        >
          {showPreview ? "Edit" : "Preview"}
        </Button>
      </div>

      {/* Textarea or Preview */}
      {showPreview ? (
        <div className="border rounded-b-lg border-t-0 p-3 min-h-[120px] bg-background">
          <RichTextRenderer content={value || placeholder || ""} />
        </div>
      ) : (
        <Textarea
          id="rich-textarea"
          value={value}
          onChange={handleTextareaChange}
          onSelect={handleTextareaChange}
          placeholder={placeholder}
          rows={rows}
          className="rounded-t-none border-t-0 focus:border-t focus:border-t-input"
        />
      )}
    </div>
  )
}

interface AddPropertyFormProps {
  onBack: () => void
  onPropertyCreated: (propertyId: string) => void
  isEditMode?: boolean
  propertyId?: Id<"properties"> | null
  existingProperty?: ConvexProperty | null
  existingCustomFields?: ConvexCustomField[]
  existingAmenities?: ConvexPropertyAmenity[]
  existingMultimedia?: ConvexMultimedia[]
}

export const AddPropertyForm: React.FC<AddPropertyFormProps> = ({
  onBack,
  onPropertyCreated,
  isEditMode = false,
  propertyId,
  existingProperty,
  existingCustomFields = [],
  existingAmenities = [],
  existingMultimedia = []
}) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    price: 0,
    currency: "USD",
    location: "",
    type: "House",
    status: "For Sale",
  })

  const [files, setFiles] = useState<FileUpload[]>([])
  const [customFields, setCustomFields] = useState<CustomFieldFormData[]>([])
  const [amenities, setAmenities] = useState<PropertyAmenityFormData[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removedMultimediaIds, setRemovedMultimediaIds] = useState<string[]>([])
  const [reorderedMultimediaPriorities, setReorderedMultimediaPriorities] = useState<{ multimediaId: string; priority: number }[]>([])

  const createProperty = useMutation(api.properties.createProperty)
  const updateProperty = useMutation(api.properties.updateProperty)
  const addCustomField = useMutation(api.properties.addCustomField)
  const deleteCustomField = useMutation(api.properties.deleteCustomField)
  const addPropertyAmenity = useMutation(api.properties.addPropertyAmenity)
  const deletePropertyAmenity = useMutation(api.properties.deletePropertyAmenity)
  const addMultimedia = useMutation(api.properties.addMultimedia)
  const reorderMultimediaPriorities = useMutation(api.properties.reorderMultimediaPriorities)
  const createAmenity = useMutation(api.properties.createAmenity)
  const updateAmenity = useMutation(api.properties.updateAmenity)

  // Pre-populate form when editing
  useEffect(() => {
    if (isEditMode && existingProperty) {
      setFormData({
        title: existingProperty.title || "",
        description: existingProperty.description || "",
        price: existingProperty.price || 0,
        currency: existingProperty.currency || "USD",
        location: existingProperty.location || "",
        type: existingProperty.type || "House",
        status: existingProperty.status || "For Sale",
      })
    }
  }, [isEditMode, existingProperty])

  // Pre-populate custom fields when editing
  useEffect(() => {
    if (isEditMode && existingCustomFields?.length > 0) {
      const formattedFields: CustomFieldFormData[] = existingCustomFields.map(field => ({
        name: field.name,
        value: field.value,
        fieldType: field.fieldType,
        unit: field.unit,
        icon: field.icon,
      }))
      setCustomFields(formattedFields)
    }
  }, [isEditMode, existingCustomFields])

  // Pre-populate amenities when editing
  useEffect(() => {
    if (isEditMode && existingAmenities?.length > 0) {
      const formattedAmenities: PropertyAmenityFormData[] = existingAmenities.map(amenity => ({
        amenityId: amenity.amenityId,
        isAvailable: amenity.isAvailable,
        notes: amenity.notes,
      }))
      setAmenities(formattedAmenities)
    }
  }, [isEditMode, existingAmenities])

  // Pre-populate multimedia files when editing (convert to FileUpload format for display)
  useEffect(() => {
    if (isEditMode && existingMultimedia?.length > 0) {
      // For edit mode, we'll show existing multimedia info but handle file uploads separately
      // Since we can't recreate File objects from URLs, we'll keep this empty for now
      // and handle existing multimedia display separately in the PhotoUpload component
      setFiles([])
    }
  }, [isEditMode, existingMultimedia])

  const handleInputChange = (field: keyof PropertyFormData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRemoveExistingMultimedia = (multimediaId: string) => {
    setRemovedMultimediaIds(prev => [...prev, multimediaId])
  }

  const handleReorderPriorities = (multimediaOrder: { multimediaId: string; priority: number }[]) => {
    setReorderedMultimediaPriorities(multimediaOrder)
  }

  const handleImportData = (importedData: {
    formData: PropertyFormData
    customFields: CustomFieldFormData[]
    amenities: PropertyAmenityFormData[]
  }) => {
    // Update form data
    setFormData(importedData.formData)
    
    // Update custom fields
    setCustomFields(importedData.customFields)
    
    // Update amenities
    setAmenities(importedData.amenities)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Step 1: Create any new custom amenities first and get their real IDs
      const amenityIdMap = new Map<string, Id<"amenities">>()
      
      for (const amenity of amenities) {
        if (amenity.amenityId.startsWith('custom-')) {
          // This is a new custom amenity, create it first
          const customDetails = amenity.customAmenity
          const { amenityId: newAmenityId } = await createAmenity({
            name: customDetails?.name || 'Custom Amenity',
            icon: customDetails?.icon || "Star",
            color: customDetails?.color || "text-gray-600",
            isDefault: false,
            category: "custom"
          })
          amenityIdMap.set(amenity.amenityId, newAmenityId)
        } else {
          // Existing amenity, keep the same ID
          amenityIdMap.set(amenity.amenityId, amenity.amenityId as Id<"amenities">)
        }
      }

      // Step 2: Create or update the property
      let finalPropertyId: Id<"properties">

      if (isEditMode && propertyId) {
        // Update existing property
        await updateProperty({
          propertyId,
          title: formData.title,
          description: formData.description,
          price: formData.price,
          currency: formData.currency,
          location: formData.location,
          type: formData.type,
          status: formData.status,
        })
        finalPropertyId = propertyId
      } else {
        // Create new property
        const { propertyId: newPropertyId } = await createProperty({
          title: formData.title,
          description: formData.description,
          price: formData.price,
          currency: formData.currency,
          location: formData.location,
          type: formData.type,
          status: formData.status,
          images: [], // Legacy field, will be replaced by multimedia
        })
        finalPropertyId = newPropertyId
      }

      // Step 3: Handle custom fields - remove deleted fields and add/update existing ones
      if (isEditMode && existingCustomFields) {
        // Find fields to delete (existing fields not in current customFields)
        const currentFieldNames = new Set(customFields.map(f => f.name))
        const fieldsToDelete = existingCustomFields.filter(field => !currentFieldNames.has(field.name))
        
        // Delete removed fields
        for (const field of fieldsToDelete) {
          await deleteCustomField({ fieldId: field._id as Id<"propertyCustomFields"> })
        }
      }
      
      // Add/update current custom fields
      for (const field of customFields) {
        await addCustomField({
          propertyId: finalPropertyId,
          name: field.name,
          value: field.value,
          fieldType: field.fieldType,
          unit: field.unit,
          icon: field.icon,
        })
      }

      // Step 4: Update existing amenities if they have been edited
      for (const amenity of amenities) {
        if (amenity.editedAmenity && !amenity.amenityId.startsWith('custom-')) {
          await updateAmenity({
            amenityId: amenity.amenityId as Id<"amenities">,
            name: amenity.editedAmenity.name,
            icon: amenity.editedAmenity.icon,
            color: amenity.editedAmenity.color,
          })
        }
      }

      // Step 5: Handle amenities - remove deleted amenities and add/update existing ones
      if (isEditMode && existingAmenities) {
        // Find amenities to delete (existing amenities not in current amenities)
        const currentAmenityIds = new Set(amenities.map(a => a.amenityId))
        const amenitiesToDelete = existingAmenities.filter(amenity => !currentAmenityIds.has(amenity.amenityId))
        
        // Delete removed amenities
        for (const amenity of amenitiesToDelete) {
          await deletePropertyAmenity({ propertyAmenityId: amenity._id as Id<"propertyAmenities"> })
        }
      }
      
      // Add/update current amenities using the real amenity IDs
      for (const amenity of amenities) {
        const realAmenityId = amenityIdMap.get(amenity.amenityId)
        if (realAmenityId) {
          await addPropertyAmenity({
            propertyId: finalPropertyId,
            amenityId: realAmenityId,
            isAvailable: amenity.isAvailable,
            notes: amenity.notes,
          })
        }
      }

      // Step 6: Update multimedia priorities if reordered
      if (reorderedMultimediaPriorities.length > 0) {
        try {
          await reorderMultimediaPriorities({
            propertyId: finalPropertyId,
            multimediaOrder: reorderedMultimediaPriorities
              .filter(item => !removedMultimediaIds.includes(item.multimediaId)) // filter out removed
              .map(item => ({
                multimediaId: item.multimediaId as Id<"multimedia">,
                priority: item.priority
              }))
          })
        } catch (priorityError) {
          console.error('Error updating multimedia priorities:', priorityError)
          // Continue with other operations even if priority update fails
        }
      }

      // Step 7: Handle multimedia files - upload to Supabase via backend and store URLs in Convex
      // Calculate the starting priority for new files (after existing multimedia)
      const existingMultimediaCount = existingMultimedia.filter(m => !removedMultimediaIds.includes(m._id)).length
      const newFileStartPriority = existingMultimediaCount
      
      for (const [index, fileUpload] of files.entries()) {
        try {
          // Determine the appropriate bucket based on file type
          const bucket = getBucketForFileType(fileUpload.file.type)
          
          // Upload file to Supabase via backend HTTP endpoint
          let uploadResult
          switch (bucket) {
            case 'images':
              uploadResult = await uploadImage(fileUpload.file)
              break
            case 'videos':
              uploadResult = await uploadVideo(fileUpload.file)
              break
            case 'documents':
              uploadResult = await uploadDocument(fileUpload.file)
              break
            default:
              uploadResult = await uploadImage(fileUpload.file)
          }
          
          // Store the Supabase URL in Convex
          await addMultimedia({
            propertyId: finalPropertyId,
            type: fileUpload.type,
            filename: fileUpload.file.name,
            url: uploadResult.url, // Supabase public URL from backend response
            fileSize: fileUpload.file.size,
            mimeType: fileUpload.file.type,
            order: index,
            description: fileUpload.description,
            priority: newFileStartPriority + index, // Assign priority after existing multimedia
          })
        } catch (uploadError) {
          console.error(`Error uploading file ${fileUpload.file.name}:`, uploadError)
          // Continue with other files even if one fails
        }
      }

      // Navigate to the property detail page
      onPropertyCreated(finalPropertyId)
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} property:`, error)
      // In a real app, you'd show an error message to the user
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    return formData.title.trim() !== "" && 
           formData.description.trim() !== "" && 
           formData.location.trim() !== "" && 
           formData.price > 0
  }

  // Create a preview property object from current form data
  const createPreviewProperty = (): Property => {
    // Create a map of multimedia ID to reordered priority
    const reorderedPriorityMap = new Map<string, number>()
    reorderedMultimediaPriorities.forEach(item => {
      reorderedPriorityMap.set(item.multimediaId, item.priority)
    })

    // Get existing multimedia images (filter out removed ones) with proper ordering
    const existingImages = existingMultimedia
      .filter(m => m.type === 'image' && !removedMultimediaIds.includes(m._id))
      .map(m => ({
        ...m,
        // Use reordered priority if available, otherwise use original priority
        priority: reorderedPriorityMap.get(m._id) ?? (m.priority || 0)
      }))
      .sort((a, b) => a.priority - b.priority)
      .map(m => m.url)

    // Convert uploaded files to image URLs for preview
    const newImages = files
      .filter(file => file.type === 'image')
      .map(file => file.preview)
      .filter(Boolean)

    // Combine existing and new images
    const previewImages = [...existingImages, ...newImages]

    return {
      id: propertyId || 'preview',
      title: formData.title || 'Preview Property',
      type: formData.type,
      price: formData.price || 0,
      currency: formData.currency,
      status: formData.status,
      location: formData.location || 'Location',
      description: formData.description || 'Description',
      images: previewImages,
      views: 0,
      likes: 0,
      shares: 0,
      notes: 0,
      dateAdded: new Date().toISOString(),
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Property' : 'Add New Property'}
          </h1>
        </div>
        
        {/* Top Action Buttons */}
        <div className="flex space-x-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          
          {/* Import Button - Only show when not in edit mode */}
          {!isEditMode && (
            <ImportModal onImport={handleImportData}>
              <Button type="button" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </ImportModal>
          )}
          
          {/* Preview Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Property Preview</DialogTitle>
              </DialogHeader>
                              <div className="flex justify-center">
                  <div className="w-full max-w-md">
                    <PropertyPreviewCard property={createPreviewProperty()} />
                  </div>
                </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            type="submit" 
            disabled={!isFormValid() || isSubmitting}
            className="min-w-[120px]"
            form="property-form"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update Property' : 'Create Property'}
              </>
            )}
          </Button>
        </div>
      </div>

      <form id="property-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Beautiful family home"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Location *</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="123 Main St, City, State"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Type</label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: 'House' | 'Apartment' | 'Land' | 'Commercial') => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="Land">Land</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: 'For Sale' | 'For Rent' | 'Sold') => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="For Sale">For Sale</SelectItem>
                      <SelectItem value="For Rent">For Rent</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Price *</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', Number(e.target.value))}
                      placeholder="0"
                      required
                      className="flex-1"
                    />
                    <Select 
                      value={formData.currency} 
                      onValueChange={(value: string) => handleInputChange('currency', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(currency => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description *</label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  placeholder="Describe the property..."
                />
              </div>
            </div>

            {/* Custom Fields Section */}
            <div className="border-t pt-6">
              <CustomFieldsEditor
                fields={customFields}
                onFieldsChange={setCustomFields}
              />
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card>
          <CardContent className="p-6">
            <PhotoUpload
              files={files}
              onFilesChange={setFiles}
              maxFiles={10}
              existingMultimedia={existingMultimedia
                .filter(m => !removedMultimediaIds.includes(m._id))
                .map(m => ({
                  ...m,
                  description: m.description
                }))
              }
              isEditMode={isEditMode}
              onRemoveExisting={handleRemoveExistingMultimedia}
              onReorderPriorities={handleReorderPriorities}
            />
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardContent className="p-6">
            <AmenitiesEditor
              amenities={amenities}
              onAmenitiesChange={setAmenities}
              isEditMode={isEditMode}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!isFormValid() || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update Property' : 'Create Property'}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Fields marked with * are required. All information can be edited later.
      </p>
    </div>
  )
} 