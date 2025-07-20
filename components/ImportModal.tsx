"use client"

import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "./ui/alert"
import { Upload, AlertTriangle, CheckCircle, Download } from "lucide-react"
import { PropertyFormData, CustomFieldFormData, PropertyAmenityFormData, PropertyType, PropertyStatus } from "@/types/property"

interface ImportModalProps {
  onImport: (data: {
    formData: PropertyFormData
    customFields: CustomFieldFormData[]
    amenities: PropertyAmenityFormData[]
  }) => void
  children: React.ReactNode
}

interface CSVValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  data?: {
    formData: PropertyFormData
    customFields: CustomFieldFormData[]
    amenities: PropertyAmenityFormData[]
  }
}

export const ImportModal: React.FC<ImportModalProps> = ({ onImport, children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [validationResult, setValidationResult] = useState<CSVValidationResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const validateCSV = (csvContent: string): CSVValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      const lines = csvContent.split('\n').filter(line => line.trim())
      if (lines.length < 2) {
        return { isValid: false, errors: ['CSV file must have at least a header row and one data row'], warnings: [] }
      }

      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
      const dataRow = lines[1].split(',').map(d => d.replace(/"/g, '').trim())

      // Validate required headers
      const requiredHeaders = ['id', 'title', 'type', 'price', 'currency', 'status', 'location', 'description']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        errors.push(`Missing required headers: ${missingHeaders.join(', ')}`)
      }

      // Parse basic form data
      const formData: PropertyFormData = {
        title: dataRow[headers.indexOf('title')] || '',
        description: dataRow[headers.indexOf('description')] || '',
        price: parseFloat(dataRow[headers.indexOf('price')]) || 0,
        currency: dataRow[headers.indexOf('currency')] || 'USD',
        location: dataRow[headers.indexOf('location')] || '',
        type: (dataRow[headers.indexOf('type')] as PropertyType) || 'House',
        status: (dataRow[headers.indexOf('status')] as PropertyStatus) || 'For Sale'
      }

      // Validate form data
      if (!formData.title.trim()) errors.push('Title is required')
      if (!formData.description.trim()) errors.push('Description is required')
      if (formData.price <= 0) errors.push('Price must be greater than 0')
      if (!formData.location.trim()) errors.push('Location is required')

      // Parse custom fields
      const customFields: CustomFieldFormData[] = []
      let fieldIndex = 0
      
      // Group custom field columns by their base name (e.g., custom_field_1_name, custom_field_1_value, etc.)
      const customFieldGroups: { [key: string]: { [key: string]: string } } = {}
      
      headers.forEach((header, index) => {
        if (header.startsWith('custom_field_')) {
          const value = dataRow[index]
          if (value !== undefined && value !== '') {
            // Extract the base field name and property (e.g., "custom_field_1_name" -> base: "1", prop: "name")
            const match = header.match(/^custom_field_(\d+)_(.+)$/)
            if (match) {
              const baseField = match[1]
              const property = match[2]
              
              if (!customFieldGroups[baseField]) {
                customFieldGroups[baseField] = {}
              }
              customFieldGroups[baseField][property] = value
            }
          }
        }
      })
      
      // Convert grouped data to CustomFieldFormData objects
      Object.keys(customFieldGroups).forEach(baseField => {
        const fieldData = customFieldGroups[baseField]
        const name = fieldData.name || `Custom Field ${fieldIndex + 1}`
        const value = fieldData.value || ''
        const fieldType = (fieldData.fieldType as 'text' | 'number' | 'boolean' | 'metric' | 'currency' | 'percentage') || 'text'
        const unit = fieldData.unit || ''
        const icon = fieldData.icon || ''
        
        // Parse value based on field type
        let parsedValue: string | number | boolean = value
        if (fieldType === 'boolean') {
          parsedValue = value === 'true'
        } else if (fieldType === 'number' && !isNaN(Number(value))) {
          parsedValue = Number(value)
        }
        
        customFields.push({
          name,
          value: parsedValue,
          fieldType,
          unit,
          icon
        })
        fieldIndex++
      })

      // Parse amenities
      const amenities: PropertyAmenityFormData[] = []
      let amenityIndex = 0
      
      // Group amenity columns by their base name (e.g., amenity_1_name, amenity_1_isAvailable, etc.)
      const amenityGroups: { [key: string]: { [key: string]: string } } = {}
      
      headers.forEach((header, index) => {
        if (header.startsWith('amenity_')) {
          const value = dataRow[index]
          if (value !== undefined && value !== '') {
            // Extract the base amenity name and property (e.g., "amenity_1_name" -> base: "1", prop: "name")
            const match = header.match(/^amenity_(\d+)_(.+)$/)
            if (match) {
              const baseAmenity = match[1]
              const property = match[2]
              
              if (!amenityGroups[baseAmenity]) {
                amenityGroups[baseAmenity] = {}
              }
              amenityGroups[baseAmenity][property] = value
            }
          }
        }
      })
      
      // Convert grouped data to PropertyAmenityFormData objects
      Object.keys(amenityGroups).forEach(baseAmenity => {
        const amenityData = amenityGroups[baseAmenity]
        console.log(`Amenity ${baseAmenity} data:`, amenityData)
        
        const name = amenityData.name || `Custom Amenity ${amenityIndex + 1}`
        const isAvailable = amenityData.isAvailable === 'true'
        const icon = amenityData.icon || 'Star'
        const color = amenityData.color || 'text-gray-600'
        const notes = amenityData.notes || ''
        
        const uniqueId = name.toLowerCase().replace(/\s+/g, '_') || `amenity_${amenityIndex}`
        
        const parsedAmenity = {
          amenityId: `imported_${uniqueId}_${amenityIndex}`,
          isAvailable,
          customAmenity: {
            name,
            icon,
            color
          },
          notes
        }
        
        console.log('Parsed amenity:', parsedAmenity)
        amenities.push(parsedAmenity)
        amenityIndex++
      })

      // Check for warnings
      if (customFields.length === 0) warnings.push('No custom fields found in CSV')
      if (amenities.length === 0) warnings.push('No amenities found in CSV')

      const result = {
        isValid: errors.length === 0,
        errors,
        warnings,
        data: {
          formData,
          customFields,
          amenities
        }
      }
      
      console.log('Final validation result:', result)
      return result
    } catch (error) {
      return {
        isValid: false,
        errors: [`Error parsing CSV: ${error}`],
        warnings: []
      }
    }
  }

  const handleFileSelect = useCallback((file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please select a valid CSV file')
      return
    }

    setIsProcessing(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const result = validateCSV(content)
      setValidationResult(result)
      setIsProcessing(false)
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleImport = () => {
    if (validationResult?.data) {
      setShowConfirmation(true)
    }
  }

  const handleConfirmImport = () => {
    if (validationResult?.data) {
      onImport(validationResult.data)
      setIsOpen(false)
      setValidationResult(null)
      setShowConfirmation(false)
    }
  }

  const handleDownloadTemplate = () => {
    const templateHeaders = [
      'id', 'title', 'type', 'price', 'currency', 'status', 'location', 'description',
      'views', 'likes', 'shares', 'notes', 'added_at',
      'custom_field_1_name', 'custom_field_1_value', 'custom_field_1_fieldType', 'custom_field_1_unit', 'custom_field_1_icon',
      'custom_field_2_name', 'custom_field_2_value', 'custom_field_2_fieldType', 'custom_field_2_unit', 'custom_field_2_icon',
      'custom_field_3_name', 'custom_field_3_value', 'custom_field_3_fieldType', 'custom_field_3_unit', 'custom_field_3_icon',
      'amenity_1_name', 'amenity_1_isAvailable', 'amenity_1_icon', 'amenity_1_color', 'amenity_1_notes',
      'amenity_2_name', 'amenity_2_isAvailable', 'amenity_2_icon', 'amenity_2_color', 'amenity_2_notes',
      'amenity_3_name', 'amenity_3_isAvailable', 'amenity_3_icon', 'amenity_3_color', 'amenity_3_notes'
    ]

    const templateData = [
      'prop_123', 'Sample Property', 'House', '500000', 'USD', 'For Sale', '123 Main St, City, State',
      'Beautiful 3-bedroom house with modern amenities', '150', '25', '8', '3', '2024-01-15',
      'Bedrooms', '3', 'number', '', 'Bed',
      'Bathrooms', '2', 'number', '', 'Bath',
      'Square Feet', '2000', 'number', 'sqft', 'Ruler',
      'Pool', 'true', 'Waves', 'text-blue-500', 'Olympic size pool',
      'Garage', 'true', 'Car', 'text-gray-600', '2 car garage',
      'WiFi', 'true', 'Wifi', 'text-green-500', 'High speed internet'
    ]

    const csvContent = [
      templateHeaders,
      templateData
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'property_import_template.csv')
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
            <Upload className="h-5 w-5" />
            Import Property Data
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop a CSV file here, or click to select
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button variant="outline" size="sm" className="cursor-pointer">
                Select CSV File
              </Button>
            </label>
          </div>

          {/* Template Download */}
          <div className="text-center">
            <Button
              onClick={handleDownloadTemplate}
              variant="link"
              size="sm"
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Download Import Template
            </Button>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm">Processing CSV...</span>
            </div>
          )}

          {/* Validation Results */}
          {validationResult && (
            <div className="space-y-3">
              {/* Errors */}
              {validationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-1">Validation Errors:</div>
                    <ul className="text-sm space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Warnings */}
              {validationResult.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-1">Warnings:</div>
                    <ul className="text-sm space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Success */}
              {validationResult.isValid && validationResult.data && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">CSV is valid! Summary:</div>
                    <div className="space-y-2 text-sm">
                      <div><strong>Property:</strong> {validationResult.data.formData.title}</div>
                      <div><strong>Type:</strong> {validationResult.data.formData.type} • <strong>Price:</strong> {validationResult.data.formData.currency} {validationResult.data.formData.price}</div>
                      <div><strong>Location:</strong> {validationResult.data.formData.location}</div>
                      {validationResult.data.customFields.length > 0 && (
                        <div>
                          <strong>Custom Fields:</strong> {validationResult.data.customFields.length} additional fields recognized
                        </div>
                      )}
                      {validationResult.data.amenities.length > 0 && (
                        <div>
                          <strong>Amenities:</strong> {validationResult.data.amenities.length} amenities recognized
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Import Button */}
              {validationResult.isValid && validationResult.data && !showConfirmation && (
                <Button onClick={handleImport} className="w-full">
                  Import Data
                </Button>
              )}

              {/* Confirmation Step */}
              {showConfirmation && validationResult?.data && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">⚠️ Final Warning</div>
                    <p className="text-sm mb-3">
                      Importing this CSV will overwrite all current form data. This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={handleConfirmImport} className="flex-1">
                        Confirm Import
                      </Button>
                      <Button 
                        onClick={() => setShowConfirmation(false)} 
                        variant="outline" 
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 