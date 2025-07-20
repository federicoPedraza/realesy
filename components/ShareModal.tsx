"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Share2, Link, FileText, Copy, Download, Check } from "lucide-react"
import { Property } from "@/types/property"
import { ConvexCustomField, ConvexPropertyAmenity, ConvexMultimedia } from "@/types/property"

interface ShareModalProps {
  property: Property
  customFields?: ConvexCustomField[]
  propertyAmenities?: ConvexPropertyAmenity[]
  multimedia?: ConvexMultimedia[]
  children: React.ReactNode
}

export const ShareModal: React.FC<ShareModalProps> = ({ 
  property, 
  customFields = [], 
  propertyAmenities = [], 
  multimedia = [], 
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'link' | 'csv'>('link')

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/properties/${property.id}` 
    : ''

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleDownloadTemplate = () => {
    // Create a sample CSV template with example data
    const templateHeaders = [
      'id', 'title', 'type', 'price', 'currency', 'status', 'location', 'description',
      'views', 'likes', 'shares', 'notes', 'added_at',
      'custom_field_1_name', 'custom_field_1_value', 'custom_field_1_fieldType', 'custom_field_1_unit', 'custom_field_1_icon',
      'custom_field_2_name', 'custom_field_2_value', 'custom_field_2_fieldType', 'custom_field_2_unit', 'custom_field_2_icon',
      'custom_field_3_name', 'custom_field_3_value', 'custom_field_3_fieldType', 'custom_field_3_unit', 'custom_field_3_icon',
      'amenity_1_name', 'amenity_1_isAvailable', 'amenity_1_icon', 'amenity_1_color', 'amenity_1_notes',
      'amenity_2_name', 'amenity_2_isAvailable', 'amenity_2_icon', 'amenity_2_color', 'amenity_2_notes',
      'amenity_3_name', 'amenity_3_isAvailable', 'amenity_3_icon', 'amenity_3_color', 'amenity_3_notes',
      'media_image_1_url', 'media_image_1_filename', 'media_image_1_description', 'media_image_1_mime_type'
    ]

    const templateData = [
      'prop_123', 'Sample Property', 'House', '500000', 'USD', 'For Sale', '123 Main St, City, State',
      'Beautiful 3-bedroom house with modern amenities', '150', '25', '8', '3', '2024-01-15',
      'Bedrooms', '3', 'number', '', 'Bed',
      'Bathrooms', '2', 'number', '', 'Bath',
      'Square Feet', '2000', 'number', 'sqft', 'Ruler',
      'Pool', 'true', 'Waves', 'text-blue-500', 'Olympic size pool',
      'Garage', 'true', 'Car', 'text-gray-600', '2 car garage',
      'WiFi', 'true', 'Wifi', 'text-green-500', 'High speed internet',
      'https://example.com/image1.jpg', 'house_front.jpg', 'Front view of the house', 'image/jpeg'
    ]

    const csvContent = [
      templateHeaders,
      templateData
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    // Create and download template file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'property_export_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportCSV = () => {
    // Helper function to escape CSV values
    const escapeCSVValue = (value: string | number | boolean | null | undefined): string => {
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      // Replace special characters with safe alternatives
      return stringValue
        .replace(/[,\n\r\t]/g, ' ') // Replace commas, newlines, tabs with spaces
        .replace(/"/g, '""') // Escape quotes by doubling them
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim()
    }

    // Prepare headers for all property data
    const headers = [
      // Basic property fields (standardized names)
      'id', 'title', 'type', 'price', 'currency', 'status', 'location', 'description',
      'views', 'likes', 'shares', 'notes', 'added_at'
    ]

    // Add custom fields with individual columns for each property
    const customFieldHeaders = customFields.flatMap((_, index) => [
      `custom_field_${index + 1}_name`,
      `custom_field_${index + 1}_value`,
      `custom_field_${index + 1}_fieldType`,
      `custom_field_${index + 1}_unit`,
      `custom_field_${index + 1}_icon`
    ])

    // Add amenities with individual columns for each property
    const amenityHeaders = propertyAmenities.flatMap((_, index) => [
      `amenity_${index + 1}_name`,
      `amenity_${index + 1}_isAvailable`,
      `amenity_${index + 1}_icon`,
      `amenity_${index + 1}_color`,
      `amenity_${index + 1}_notes`
    ])

    // Add multimedia files with indexed naming by type
    const images = multimedia.filter(m => m.type === 'image')
    const videos = multimedia.filter(m => m.type === 'video')
    const documents = multimedia.filter(m => m.type === 'document')

    const imageHeaders = images.flatMap((_, index) => [
      `media_image_${index + 1}_url`,
      `media_image_${index + 1}_filename`,
      `media_image_${index + 1}_description`,
      `media_image_${index + 1}_mime_type`
    ])

    const videoHeaders = videos.flatMap((_, index) => [
      `media_video_${index + 1}_url`,
      `media_video_${index + 1}_filename`,
      `media_video_${index + 1}_description`,
      `media_video_${index + 1}_mime_type`
    ])

    const documentHeaders = documents.flatMap((_, index) => [
      `media_document_${index + 1}_url`,
      `media_document_${index + 1}_filename`,
      `media_document_${index + 1}_description`,
      `media_document_${index + 1}_mime_type`
    ])

    // Combine all headers
    const allHeaders = [
      ...headers,
      ...customFieldHeaders,
      ...amenityHeaders,
      ...imageHeaders,
      ...videoHeaders,
      ...documentHeaders
    ]

    // Prepare data row
    const dataRow = [
      // Basic property fields
      escapeCSVValue(property.id),
      escapeCSVValue(property.title),
      escapeCSVValue(property.type),
      escapeCSVValue(property.price),
      escapeCSVValue(property.currency || 'USD'),
      escapeCSVValue(property.status),
      escapeCSVValue(property.location),
      escapeCSVValue(property.description),
      escapeCSVValue(property.views),
      escapeCSVValue(property.likes),
      escapeCSVValue(property.shares),
      escapeCSVValue(property.notes),
      escapeCSVValue(property.dateAdded)
    ]

    // Add custom fields values as individual columns
    const customFieldValues = customFields.flatMap(field => [
      escapeCSVValue(field.name),
      escapeCSVValue(field.value),
      escapeCSVValue(field.fieldType),
      escapeCSVValue(field.unit || ''),
      escapeCSVValue(field.icon || '')
    ])

    // Add amenities values as individual columns
    const amenityValues = propertyAmenities.flatMap(pa => [
      escapeCSVValue(pa.amenity.name),
      escapeCSVValue(pa.isAvailable ? 'true' : 'false'),
      escapeCSVValue(pa.amenity.icon || ''),
      escapeCSVValue(pa.amenity.color || ''),
      escapeCSVValue(pa.notes || '')
    ])

    // Add multimedia files data
    const imageData = images.flatMap(m => [
      escapeCSVValue(m.url),
      escapeCSVValue(m.filename),
      escapeCSVValue(m.description || ''),
      escapeCSVValue(m.mimeType || '')
    ])

    const videoData = videos.flatMap(m => [
      escapeCSVValue(m.url),
      escapeCSVValue(m.filename),
      escapeCSVValue(m.description || ''),
      escapeCSVValue(m.mimeType || '')
    ])

    const documentData = documents.flatMap(m => [
      escapeCSVValue(m.url),
      escapeCSVValue(m.filename),
      escapeCSVValue(m.description || ''),
      escapeCSVValue(m.mimeType || '')
    ])

    // Combine all data
    const allData = [
      ...dataRow,
      ...customFieldValues,
      ...amenityValues,
      ...imageData,
      ...videoData,
      ...documentData
    ]

    // Create CSV content
    const csvContent = [
      allHeaders,
      allData
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${property.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Property
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'link'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Link className="h-4 w-4" />
              Share Link
            </button>
            <button
              onClick={() => setActiveTab('csv')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'csv'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          {/* Link Sharing Tab */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="share-url">Property Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="share-url"
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this link with others to let them view the property details.
              </p>
            </div>
          )}

          {/* CSV Export Tab */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Export Property Data</h4>
                <p className="text-sm text-muted-foreground">
                  Download the property information as a CSV file for use in spreadsheets or other applications.
                </p>
              </div>
              <div className="space-y-4">
                <Button
                  onClick={handleDownloadTemplate}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Download a sample CSV to see the exact column structure and format
                </p>
              </div>
              <Button
                onClick={handleExportCSV}
                className="w-full flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export as CSV
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 