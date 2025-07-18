import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Plus, X, Edit, Calendar, Ruler, Users, Star, Home, MapPin, Clock, Coffee, 
  Camera, Music, Gamepad2, Utensils, Bed, Bath, Zap, Sun, Moon, Heart, 
  Lock, Key, Flame, Waves, Car, Wifi, Tv, AirVent, Dumbbell, Shield, TreePine, Building
} from "lucide-react"
import { CustomFieldFormData, FIELD_TYPES, METRIC_UNITS } from "@/types/property"

interface CustomFieldsEditorProps {
  fields: CustomFieldFormData[]
  onFieldsChange: (fields: CustomFieldFormData[]) => void
}

interface DefaultField {
  name: string
  fieldType: 'text' | 'number' | 'boolean' | 'metric' | 'currency' | 'percentage'
  icon: string
  unit?: string
  defaultValue: string | number | boolean
}

const ICON_OPTIONS = [
  { name: "Star", icon: Star },
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
  { name: "Flame", icon: Flame },
  { name: "Waves", icon: Waves },
  { name: "Car", icon: Car },
  { name: "Wifi", icon: Wifi },
  { name: "Tv", icon: Tv },
  { name: "AirVent", icon: AirVent },
  { name: "Dumbbell", icon: Dumbbell },
  { name: "Shield", icon: Shield },
  { name: "TreePine", icon: TreePine },
  { name: "Building", icon: Building },
  { name: "Calendar", icon: Calendar },
  { name: "Ruler", icon: Ruler },
  { name: "Users", icon: Users },
]

const DEFAULT_FIELDS: DefaultField[] = [
  { name: "Area Size", fieldType: "metric", icon: "Ruler", unit: "sqft", defaultValue: 0 },
  { name: "Bedrooms", fieldType: "number", icon: "Bed", defaultValue: 0 },
  { name: "Bathrooms", fieldType: "number", icon: "Bath", defaultValue: 0 },
  { name: "Age", fieldType: "metric", icon: "Calendar", unit: "years", defaultValue: 0 },
  { name: "Height", fieldType: "metric", icon: "Ruler", unit: "m", defaultValue: 0 },
]

export const CustomFieldsEditor: React.FC<CustomFieldsEditorProps> = ({
  fields,
  onFieldsChange
}) => {
  const [newField, setNewField] = useState<Partial<CustomFieldFormData>>({
    name: "",
    fieldType: "text",
    value: "",
    unit: "",
    icon: "Star"
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingField, setEditingField] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<Partial<CustomFieldFormData>>({})
  const [showIconSelector, setShowIconSelector] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Initialize with default fields only on first load
  React.useEffect(() => {
    if (!hasInitialized && fields.length === 0) {
      const defaultFields: CustomFieldFormData[] = DEFAULT_FIELDS.map(field => ({
        name: field.name,
        fieldType: field.fieldType,
        value: field.defaultValue,
        unit: field.unit,
        icon: field.icon
      }))
      
      onFieldsChange(defaultFields)
      setHasInitialized(true)
    } else if (fields.length > 0 && !hasInitialized) {
      // If fields are provided from parent, mark as initialized
      setHasInitialized(true)
    }
  }, [fields.length, onFieldsChange, hasInitialized])

  const addField = () => {
    if (!newField.name || newField.fieldType === undefined) return

    const field: CustomFieldFormData = {
      name: newField.name,
      fieldType: newField.fieldType,
      value: getDefaultValueForType(newField.fieldType),
      unit: newField.unit,
      icon: newField.icon
    }

    onFieldsChange([...fields, field])
    setNewField({ name: "", fieldType: "text", value: "", unit: "", icon: "Star" })
    setShowAddForm(false)
  }

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index)
    onFieldsChange(newFields)
  }

  const updateField = (index: number, updates: Partial<CustomFieldFormData>) => {
    const newFields = fields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    )
    onFieldsChange(newFields)
  }

  const startEditing = (index: number) => {
    const field = fields[index]
    setEditingField(index)
    setEditingData({
      name: field.name,
      fieldType: field.fieldType,
      unit: field.unit,
      icon: field.icon || "Star"
    })
    setShowIconSelector(true)
  }

  const saveEdit = () => {
    if (editingField !== null && editingData.name) {
      updateField(editingField, {
        name: editingData.name,
        fieldType: editingData.fieldType,
        unit: editingData.unit,
        icon: editingData.icon
      })
      
      setEditingField(null)
      setEditingData({})
      setShowIconSelector(false)
    }
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditingData({})
    setShowIconSelector(false)
  }

  const getDefaultValueForType = (type: string): string | number | boolean => {
    switch (type) {
      case 'number': 
      case 'metric': 
      case 'currency': 
      case 'percentage': 
        return 0
      case 'boolean': 
        return false
      default: 
        return ""
    }
  }

  const renderFieldInput = (field: CustomFieldFormData, index: number) => {
    const commonProps = {
      id: `field-${index}`,
      className: "h-8 text-sm"
    }

    switch (field.fieldType) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
               checked={field.value as boolean}
               onCheckedChange={(checked: boolean) => updateField(index, { value: checked })}
             />
            <Label htmlFor={`field-${index}`} className="text-xs">
              {field.value ? "Yes" : "No"}
            </Label>
          </div>
        )
      
      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            value={field.value as number}
            onChange={(e) => updateField(index, { value: Number(e.target.value) })}
            placeholder="0"
          />
        )
      
      case 'currency':
        return (
          <div className="flex items-center">
            <span className="text-xs text-muted-foreground mr-1">$</span>
            <Input
              {...commonProps}
              type="number"
              value={field.value as number}
              onChange={(e) => updateField(index, { value: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
        )
      
      case 'percentage':
        return (
          <div className="flex items-center">
            <Input
              {...commonProps}
              type="number"
              value={field.value as number}
              onChange={(e) => updateField(index, { value: Number(e.target.value) })}
              placeholder="0"
              max={100}
              min={0}
            />
            <span className="text-xs text-muted-foreground ml-1">%</span>
          </div>
        )
      
      case 'metric':
        return (
          <div className="flex items-center space-x-1">
            <Input
              type="number"
              value={field.value as number}
              onChange={(e) => updateField(index, { value: Number(e.target.value) })}
              placeholder="0"
              className="h-8 text-sm flex-1"
            />
            <Select
              value={field.unit || ""}
              onValueChange={(unit) => updateField(index, { unit })}
            >
              <SelectTrigger className="w-16 h-8 text-xs">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                {METRIC_UNITS.map(unit => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      
      default: // text
        return (
          <Input
            {...commonProps}
            type="text"
            value={field.value as string}
            onChange={(e) => updateField(index, { value: e.target.value })}
            placeholder="Enter text"
          />
        )
    }
  }

  const getFieldIcon = (field: CustomFieldFormData) => {
    const iconName = field.icon || "Star"
    const iconOption = ICON_OPTIONS.find(option => option.name === iconName)
    if (iconOption) {
      const Icon = iconOption.icon
      return <Icon className="h-3 w-3 text-muted-foreground" />
    }
    return <Star className="h-3 w-3 text-muted-foreground" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">Additional Details</h3>
        <p className="text-sm text-muted-foreground">Click fields to edit or remove them</p>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {fields.map((field, index) => {
          const isEditing = editingField === index
          
                     if (isEditing) {
             return (
               <Card key={index} className="border-2 border-blue-300 bg-blue-50 relative">
                 <CardContent className="p-3 space-y-2">
                   <div className="flex items-center gap-2">
                     <Button
                       type="button"
                       variant="ghost"
                       onClick={() => setShowIconSelector(!showIconSelector)}
                       className="h-7 w-7 p-0"
                     >
                       {React.createElement(
                         ICON_OPTIONS.find(io => io.name === (editingData.icon || "Star"))?.icon || Star,
                         { className: "h-4 w-4 text-gray-600" }
                       )}
                     </Button>
                     <Input
                       value={editingData.name || ""}
                       onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                       placeholder="Field name"
                       className="h-7 text-xs flex-1"
                       autoFocus
                     />
                   </div>
                   
                   {showIconSelector && (
                     <div className="absolute top-12 left-3 bg-white border rounded-md shadow-lg p-2 z-10 grid grid-cols-6 gap-1">
                       {ICON_OPTIONS.slice(0, 18).map((iconOption) => {
                         const IconComp = iconOption.icon
                         return (
                           <Button
                             key={iconOption.name}
                             type="button"
                             variant={editingData.icon === iconOption.name ? "default" : "ghost"}
                             size="sm"
                             onClick={() => {
                               setEditingData({ ...editingData, icon: iconOption.name })
                               setShowIconSelector(false)
                             }}
                             className="h-7 w-7 p-0"
                           >
                             <IconComp className="h-3 w-3" />
                           </Button>
                         )
                       })}
                     </div>
                   )}
                   
                   <Select
                     value={editingData.fieldType || field.fieldType}
                     onValueChange={(fieldType: 'text' | 'number' | 'boolean' | 'metric' | 'currency' | 'percentage') => 
                       setEditingData({ ...editingData, fieldType })
                     }
                   >
                     <SelectTrigger className="h-7 text-xs">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       {FIELD_TYPES.map(type => (
                         <SelectItem key={type.value} value={type.value}>
                           {type.label}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   {editingData.fieldType === 'metric' && (
                     <Select
                       value={editingData.unit || ""}
                       onValueChange={(unit) => setEditingData({ ...editingData, unit })}
                     >
                       <SelectTrigger className="h-7 text-xs">
                         <SelectValue placeholder="Unit" />
                       </SelectTrigger>
                       <SelectContent>
                         {METRIC_UNITS.map(unit => (
                           <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   )}
                   <div className="flex gap-1">
                     <Button
                       type="button"
                       onClick={saveEdit}
                       size="sm"
                       className="h-6 text-xs flex-1"
                       disabled={!editingData.name}
                     >
                       Save
                     </Button>
                     <Button
                       type="button"
                       variant="ghost"
                       onClick={cancelEdit}
                       size="sm"
                       className="h-6 text-xs flex-1"
                     >
                       Cancel
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             )
           }

          return (
            <Card key={index} className="relative group hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(index)}
                    className="h-5 w-5 p-0 text-gray-400 hover:text-blue-500"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(index)}
                    className="h-5 w-5 p-0 text-gray-400 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-1">
                    {getFieldIcon(field)}
                    <Label className="text-xs font-medium truncate flex-1">
                      {field.name}
                    </Label>
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      {FIELD_TYPES.find(ft => ft.value === field.fieldType)?.label}
                    </Badge>
                  </div>
                  
                  {renderFieldInput(field, index)}
                </div>
              </CardContent>
            </Card>
          )
        })}

                 {/* Add New Field Card */}
         {showAddForm ? (
           <Card className="border-2 border-dashed border-gray-300 relative">
             <CardContent className="p-3 space-y-2">
               <div className="flex items-center gap-2">
                 <Button
                   type="button"
                   variant="ghost"
                   onClick={() => setShowIconSelector(!showIconSelector)}
                   className="h-7 w-7 p-0"
                 >
                   {React.createElement(
                     ICON_OPTIONS.find(io => io.name === (newField.icon || "Star"))?.icon || Star,
                     { className: "h-4 w-4 text-gray-600" }
                   )}
                 </Button>
                 <Input
                   value={newField.name}
                   onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                   placeholder="Field name"
                   className="h-7 text-xs flex-1"
                   autoFocus
                 />
               </div>
               
               {showIconSelector && (
                 <div className="absolute top-12 left-3 bg-white border rounded-md shadow-lg p-2 z-10 grid grid-cols-6 gap-1">
                   {ICON_OPTIONS.slice(0, 18).map((iconOption) => {
                     const IconComp = iconOption.icon
                     return (
                       <Button
                         key={iconOption.name}
                         type="button"
                         variant={newField.icon === iconOption.name ? "default" : "ghost"}
                         size="sm"
                         onClick={() => {
                           setNewField({ ...newField, icon: iconOption.name })
                           setShowIconSelector(false)
                         }}
                         className="h-7 w-7 p-0"
                       >
                         <IconComp className="h-3 w-3" />
                       </Button>
                     )
                   })}
                 </div>
               )}
               
               <Select
                 value={newField.fieldType}
                 onValueChange={(fieldType: 'text' | 'number' | 'boolean' | 'metric' | 'currency' | 'percentage') => 
                   setNewField({ ...newField, fieldType })
                 }
               >
                 <SelectTrigger className="h-7 text-xs">
                   <SelectValue placeholder="Field type" />
                 </SelectTrigger>
                 <SelectContent>
                   {FIELD_TYPES.map(type => (
                     <SelectItem key={type.value} value={type.value}>
                       {type.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               {newField.fieldType === 'metric' && (
                 <Select
                   value={newField.unit || ""}
                   onValueChange={(unit) => setNewField({ ...newField, unit })}
                 >
                   <SelectTrigger className="h-7 text-xs">
                     <SelectValue placeholder="Unit" />
                   </SelectTrigger>
                   <SelectContent>
                     {METRIC_UNITS.map(unit => (
                       <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               )}
               <div className="flex gap-1">
                 <Button
                   type="button"
                   onClick={addField}
                   size="sm"
                   className="h-6 text-xs flex-1"
                   disabled={!newField.name || !newField.fieldType}
                 >
                   Add
                 </Button>
                 <Button
                   type="button"
                   variant="ghost"
                   onClick={() => {
                     setShowAddForm(false)
                     setShowIconSelector(false)
                   }}
                   size="sm"
                   className="h-6 text-xs flex-1"
                 >
                   Cancel
                 </Button>
               </div>
             </CardContent>
           </Card>
                 ) : (
           <Card 
             className="border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400"
             onClick={() => setShowAddForm(true)}
           >
             <CardContent className="p-3 text-center">
               <Plus className="h-6 w-6 mx-auto mb-2 text-gray-400" />
               <p className="text-sm text-gray-500">Add field</p>
             </CardContent>
           </Card>
         )}
      </div>
    </div>
  )
} 