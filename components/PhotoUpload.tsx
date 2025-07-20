import React, { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Image as ImageIcon, Video, File, Plus } from "lucide-react"
import { FileUpload, ConvexMultimedia } from "@/types/property"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface PhotoUploadProps {
  files: FileUpload[]
  onFilesChange: (files: FileUpload[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  existingMultimedia?: ConvexMultimedia[]
  isEditMode?: boolean
  onRemoveExisting?: (multimediaId: string) => void
  onReorderExisting?: (multimedia: ConvexMultimedia[]) => void
  onReorderPriorities?: (multimediaOrder: { multimediaId: string; priority: number }[]) => void
  onUnifiedOrderChange?: (order: Array<{ id: string; type: 'existing' | 'new'; index?: number }>) => void
}

// Unified sortable item component for both existing and new multimedia
const SortableItem = ({ 
  item,
  onRemove
}: {
  item: { 
    id: string
    type: 'existing' | 'new'
    data: ConvexMultimedia | FileUpload
    order: number
  }
  onRemove: (id: string) => void
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getFileIcon = (type: 'image' | 'video' | 'document') => {
    switch (type) {
      case 'image': return ImageIcon
      case 'video': return Video
      case 'document': return File
      default: return File
    }
  }

  const isNew = item.type === 'new'
  const mediaData = item.data
  const fileType = isNew ? (mediaData as FileUpload).type : (mediaData as ConvexMultimedia).type
  const filename = isNew ? (mediaData as FileUpload).file.name : (mediaData as ConvexMultimedia).filename
  const imageSrc = isNew ? (mediaData as FileUpload).preview : (mediaData as ConvexMultimedia).url
  const imageAlt = isNew ? `Upload ${item.order}` : `Existing ${filename}`

  const Icon = getFileIcon(fileType)

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className="relative group py-2 cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardContent className="px-2 py-0">
        <div className="min-h-52 relative bg-muted rounded-lg overflow-hidden">
          {fileType === 'image' ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
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
                {filename}
              </p>
            </div>
          )}

          {/* File type badge */}
          <Badge 
            variant="secondary" 
            className="absolute bottom-1 left-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
          </Badge>

          {/* Drag handle - entire image area */}
          <div
            {...attributes}
            {...listeners}
            className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Remove button */}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-3 right-3 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  files,
  onFilesChange,
  maxFiles = 10,
  acceptedTypes = ['image/*', 'video/*'],
  existingMultimedia = [],
  isEditMode = false,
  onRemoveExisting,
  onReorderExisting,
  onReorderPriorities,
  onUnifiedOrderChange
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [orderedExistingMultimedia, setOrderedExistingMultimedia] = useState<ConvexMultimedia[]>(
    existingMultimedia.sort((a, b) => (a.priority || 0) - (b.priority || 0))
  )
  const [unifiedItems, setUnifiedItems] = useState<Array<{ 
    id: string
    type: 'existing' | 'new'
    data: ConvexMultimedia | FileUpload
    order: number
  }>>([])
  const [isDragging, setIsDragging] = useState(false)

  // Update ordered multimedia when existingMultimedia prop changes
  // Only update if the multimedia items themselves have changed (not just reordering)
  useEffect(() => {
    const currentIds = orderedExistingMultimedia.map(m => m._id).sort()
    const newIds = existingMultimedia.map(m => m._id).sort()
    
    // Only update if the actual multimedia items have changed (not just reordering)
    if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
      setOrderedExistingMultimedia(
        existingMultimedia.sort((a, b) => (a.priority || 0) - (b.priority || 0))
      )
    }
  }, [existingMultimedia, orderedExistingMultimedia])

  // Initialize and update unified items when existing multimedia or files change
  useEffect(() => {
    // Don't update unified items during drag operations
    if (isDragging) return

    const newUnifiedItems: Array<{ 
      id: string
      type: 'existing' | 'new'
      data: ConvexMultimedia | FileUpload
      order: number
    }> = []

    // Add existing items with their current order
    orderedExistingMultimedia.forEach((media, index) => {
      newUnifiedItems.push({
        id: `existing-${media._id}`,
        type: 'existing',
        data: media,
        order: index
      })
    })

    // Add new items with order numbers continuing from the last existing item
    const lastOrder = newUnifiedItems.length > 0 ? Math.max(...newUnifiedItems.map(item => item.order)) : -1
    files.forEach((fileUpload, index) => {
      newUnifiedItems.push({
        id: `new-${index}`,
        type: 'new',
        data: fileUpload,
        order: lastOrder + 1 + index
      })
    })

    setUnifiedItems(newUnifiedItems)
  }, [orderedExistingMultimedia, files, isDragging])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    return 'document'
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
    
    // Update unified items immediately with new files
    const lastOrder = unifiedItems.length > 0 ? Math.max(...unifiedItems.map(item => item.order)) : -1
    const newUnifiedItems = [...unifiedItems]
    
    newFiles.forEach((fileUpload, index) => {
      const globalIndex = files.length + index
      if (globalIndex < maxFiles) {
        newUnifiedItems.push({
          id: `new-${globalIndex}`,
          type: 'new',
          data: fileUpload,
          order: lastOrder + 1 + index
        })
      }
    })
    
    setUnifiedItems(newUnifiedItems)
    setDragActive(false)
  }, [files, onFilesChange, maxFiles, unifiedItems])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    multiple: true,
    maxFiles: maxFiles - files.length,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  })

  const removeItem = (itemId: string) => {
    const item = unifiedItems.find(item => item.id === itemId)
    if (!item) return

    if (item.type === 'existing') {
      onRemoveExisting?.(itemId.replace('existing-', ''))
    } else {
      const fileIndex = files.findIndex((_, index) => `new-${index}` === itemId)
      if (fileIndex !== -1) {
        const newFiles = files.filter((_, i) => i !== fileIndex)
        onFilesChange(newFiles)
      }
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    console.log('Drag end:', { active: active.id, over: over?.id })

    if (active.id !== over?.id) {
      const activeId = active.id as string
      const overId = over?.id as string

      // Find indices in unified items
      const activeIndex = unifiedItems.findIndex(item => item.id === activeId)
      const overIndex = unifiedItems.findIndex(item => item.id === overId)

      if (activeIndex !== -1 && overIndex !== -1) {
        // Reorder the unified items array
        const newUnifiedItems = arrayMove(unifiedItems, activeIndex, overIndex)
        
        // Update order numbers
        newUnifiedItems.forEach((item, index) => {
          item.order = index
        })
        
        // Update the unified items state
        setUnifiedItems(newUnifiedItems)
        
        // Extract existing multimedia in new order
        const newExistingOrder = newUnifiedItems
          .filter(item => item.type === 'existing')
          .map(item => item.data as ConvexMultimedia)
        
        // Extract new files in new order
        const newFilesOrder = newUnifiedItems
          .filter(item => item.type === 'new')
          .map(item => item.data as FileUpload)
        
        // Update existing multimedia order
        if (newExistingOrder.length > 0) {
          setOrderedExistingMultimedia(newExistingOrder)
          onReorderExisting?.(newExistingOrder)
          
          // Calculate new priorities for existing multimedia
          const multimediaOrder = newExistingOrder.map((item, index) => ({
            multimediaId: item._id,
            priority: index
          }))
          onReorderPriorities?.(multimediaOrder)
        }

        // Update new files order
        if (newFilesOrder.length > 0) {
          onFilesChange(newFilesOrder)
        }

        // Notify parent of unified order change
        const unifiedOrderForParent = newUnifiedItems.map(item => ({
          id: item.id,
          type: item.type,
          index: item.type === 'new' ? newFilesOrder.indexOf(item.data as FileUpload) : undefined
        }))
        onUnifiedOrderChange?.(unifiedOrderForParent)
      }
    }
    
    // End dragging state
    setIsDragging(false)
  }

  // Create sortable items array
  const sortableItems = unifiedItems.map(item => item.id)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Photos & Media</h3>
        <Badge variant="secondary">
          {files.length + existingMultimedia.length}/{maxFiles} files
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

      {/* Unified Multimedia Grid with Drag & Drop */}
      {(files.length > 0 || (isEditMode && existingMultimedia.length > 0)) && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Render all items in unified order */}
              {unifiedItems.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        {isEditMode 
          ? "Note: New files (marked with 'New' badge) will be uploaded when you save. Existing media will be preserved. Drag items to reorder them in any order."
          : "Note: Files are not uploaded to the server yet. They will be processed when you save the property. Drag items to reorder them."
        }
      </p>
    </div>
  )
} 