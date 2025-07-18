import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Image as ImageIcon, Video, File, Plus } from "lucide-react"
import { FileUpload, ConvexMultimedia } from "@/types/property"

interface PhotoUploadProps {
  files: FileUpload[]
  onFilesChange: (files: FileUpload[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  existingMultimedia?: ConvexMultimedia[]
  isEditMode?: boolean
  onRemoveExisting?: (multimediaId: string) => void
  onUpdateExistingDescription?: (multimediaId: string, description: string) => void
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  files,
  onFilesChange,
  maxFiles = 10,
  acceptedTypes = ['image/*', 'video/*'],
  existingMultimedia = [],
  isEditMode = false,
  onRemoveExisting,
  onUpdateExistingDescription
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    return 'document'
  }

  const getFileIcon = (type: 'image' | 'video' | 'document') => {
    switch (type) {
      case 'image': return ImageIcon
      case 'video': return Video
      case 'document': return File
      default: return File
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileUpload[] = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: getFileType(file),
      description: ""
    }))

    const updatedFiles = [...files, ...newFiles].slice(0, maxFiles)
    onFilesChange(updatedFiles)
    setDragActive(false)
  }, [files, onFilesChange, maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    multiple: true,
    maxFiles: maxFiles - files.length,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  })

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  const updateDescription = (index: number, description: string) => {
    const newFiles = files.map((file, i) => 
      i === index ? { ...file, description } : file
    )
    onFilesChange(newFiles)
  }

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Photos & Media</h3>
        <Badge variant="secondary">
          {files.length}/{maxFiles} files
        </Badge>
      </div>

      {/* Upload Area */}
      <Card className={`border-dashed border-2 transition-colors ${
        isDragActive || dragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/25 hover:border-primary/50'
      }`}>
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className="text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                {isDragActive || dragActive ? (
                  <Plus className="h-6 w-6 text-primary" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragActive || dragActive
                    ? "Drop files here..."
                    : "Drag & drop files here, or click to select"
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports images and videos up to {maxFiles} files
                </p>
              </div>
              {files.length < maxFiles && (
                <Button type="button" variant="outline" size="sm">
                  Choose Files
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unified Multimedia Grid */}
      {(files.length > 0 || (isEditMode && existingMultimedia.length > 0)) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Existing multimedia */}
          {isEditMode && existingMultimedia.map((media) => {
            const Icon = getFileIcon(media.type)
            return (
              <Card 
                key={`existing-${media._id}`} 
                className="relative group py-2 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => toggleExpanded(`existing-${media._id}`)}
              >
                <CardContent className="px-2 py-0">
                  <div className="min-h-52 relative bg-muted rounded-lg overflow-hidden">
                    {media.type === 'image' ? (
                      <Image
                        src={media.url}
                        alt={`Existing ${media.filename}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <Icon className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-xs text-center text-muted-foreground truncate">
                          {media.filename}
                        </p>
                      </div>
                    )}

                    {/* File type badge */}
                    <Badge 
                      variant="secondary" 
                      className="absolute bottom-1 left-1 text-xs"
                    >
                      {media.type.charAt(0).toUpperCase() + media.type.slice(1)}
                    </Badge>
                  </div>

                  {/* Remove button for existing media - moved to card level */}
                  {onRemoveExisting && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveExisting(media._id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}

                  {/* Collapsible Details Section */}
                  {expandedItems.has(`existing-${media._id}`) && (
                    <div className="mt-2 space-y-2">
                      {/* Description input for existing media */}
                      <div>
                        <input
                          type="text"
                          placeholder="Add description..."
                          value={media.description || ""}
                          onChange={(e) => onUpdateExistingDescription?.(media._id, e.target.value)}
                          className="w-full text-xs p-1 border rounded text-center bg-background"
                        />
                      </div>

                      {/* File size */}
                      {media.fileSize && (
                        <p className="text-xs text-muted-foreground text-center">
                          {(media.fileSize / 1024 / 1024).toFixed(1)} MB
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}

          {/* New file uploads */}
          {files.map((fileUpload, index) => {
            const Icon = getFileIcon(fileUpload.type)
            return (
              <Card 
                key={`new-${index}`} 
                className="relative group py-2 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => toggleExpanded(`new-${index}`)}
              >
                <CardContent className="px-2 py-0">
                  <div className="h-52 relative bg-muted rounded-lg overflow-hidden">
                    {fileUpload.type === 'image' ? (
                      <Image
                        src={fileUpload.preview}
                        alt={`Upload ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <Icon className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-xs text-center text-muted-foreground truncate">
                          {fileUpload.file.name}
                        </p>
                      </div>
                    )}

                    {/* File type badge */}
                    <Badge 
                      variant="secondary" 
                      className="absolute bottom-1 left-1 text-xs"
                    >
                      {fileUpload.type.charAt(0).toUpperCase() + fileUpload.type.slice(1)}
                    </Badge>
                  </div>

                  {/* Remove button for new files - moved to card level */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {/* Collapsible Details Section */}
                  {expandedItems.has(`new-${index}`) && (
                    <div className="mt-2 space-y-2">
                      {/* Description input */}
                      <div>
                        <input
                          type="text"
                          placeholder="Add description..."
                          value={fileUpload.description}
                          onChange={(e) => updateDescription(index, e.target.value)}
                          className="w-full text-xs p-1 border rounded text-center bg-background"
                        />
                      </div>

                      {/* File size */}
                      <p className="text-xs text-muted-foreground text-center">
                        {(fileUpload.file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        {isEditMode 
          ? "Note: New files will be uploaded when you save. Existing media will be preserved."
          : "Note: Files are not uploaded to the server yet. They will be processed when you save the property."
        }
      </p>
    </div>
  )
} 