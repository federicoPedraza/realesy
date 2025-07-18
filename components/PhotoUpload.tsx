import React, { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Image as ImageIcon, Video, File, Plus, GripVertical } from "lucide-react"
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
}

// Sortable item component for existing multimedia
const SortableExistingItem = ({ 
  media, 
  onRemove
}: {
  media: ConvexMultimedia
  onRemove: (id: string) => void
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `existing-${media._id}` })

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

  const Icon = getFileIcon(media.type)

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className="relative group py-2 cursor-pointer hover:shadow-md transition-shadow"
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
            className="absolute bottom-1 left-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {media.type.charAt(0).toUpperCase() + media.type.slice(1)}
          </Badge>

          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 rounded cursor-grab active:cursor-grabbing flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        {/* Remove button for existing media */}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(media._id);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}

// Sortable item component for new files
const SortableNewItem = ({ 
  fileUpload, 
  index, 
  onRemove
}: {
  fileUpload: FileUpload
  index: number
  onRemove: (index: number) => void
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `new-${index}` })

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

  const Icon = getFileIcon(fileUpload.type)

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className="relative group py-2 px-4 cursor-pointer hover:shadow-md transition-shadow"
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
            className="absolute bottom-1 left-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {fileUpload.type.charAt(0).toUpperCase() + fileUpload.type.slice(1)}
          </Badge>

          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 rounded cursor-grab active:cursor-grabbing flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        {/* Remove button for new files */}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
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
  onReorderPriorities
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [orderedExistingMultimedia, setOrderedExistingMultimedia] = useState<ConvexMultimedia[]>(
    existingMultimedia.sort((a, b) => (a.priority || 0) - (b.priority || 0))
  )

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    console.log('Drag end:', { active: active.id, over: over?.id })

    if (active.id !== over?.id) {
      const activeId = active.id as string
      const overId = over?.id as string

      // Handle reordering existing multimedia
      if (activeId.startsWith('existing-') && overId.startsWith('existing-')) {
        const activeIndex = orderedExistingMultimedia.findIndex(
          item => `existing-${item._id}` === activeId
        )
        const overIndex = orderedExistingMultimedia.findIndex(
          item => `existing-${item._id}` === overId
        )

        console.log('Reordering existing multimedia:', { activeIndex, overIndex })

        if (activeIndex !== -1 && overIndex !== -1) {
          const newOrder = arrayMove(orderedExistingMultimedia, activeIndex, overIndex)
          console.log('New order:', newOrder.map(item => item.filename))
          setOrderedExistingMultimedia(newOrder)
          onReorderExisting?.(newOrder)
          
          // Calculate new priorities based on the new order
          const multimediaOrder = newOrder.map((item, index) => ({
            multimediaId: item._id,
            priority: index
          }))
          console.log('New priorities:', multimediaOrder)
          onReorderPriorities?.(multimediaOrder)
        }
      }

      // Handle reordering new files
      if (activeId.startsWith('new-') && overId.startsWith('new-')) {
        const activeIndex = parseInt(activeId.replace('new-', ''))
        const overIndex = parseInt(overId.replace('new-', ''))

        if (!isNaN(activeIndex) && !isNaN(overIndex)) {
          const newFiles = arrayMove(files, activeIndex, overIndex)
          onFilesChange(newFiles)
        }
      }
    }
  }

  // Create sortable items array
  const sortableItems = [
    ...orderedExistingMultimedia.map(media => `existing-${media._id}`),
    ...files.map((_, index) => `new-${index}`)
  ]

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
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Existing multimedia */}
              {isEditMode && orderedExistingMultimedia.map((media) => (
                <SortableExistingItem
                  key={`existing-${media._id}`}
                  media={media}
                  onRemove={onRemoveExisting || (() => {})}
                />
              ))}

              {/* New file uploads */}
              {files.map((fileUpload, index) => (
                <SortableNewItem
                  key={`new-${index}`}
                  fileUpload={fileUpload}
                  index={index}
                  onRemove={removeFile}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        {isEditMode 
          ? "Note: New files will be uploaded when you save. Existing media will be preserved. Drag items to reorder them."
          : "Note: Files are not uploaded to the server yet. They will be processed when you save the property. Drag items to reorder them."
        }
      </p>
    </div>
  )
} 