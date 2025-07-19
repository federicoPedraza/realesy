import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone, Mail, Send, ArrowLeft, MessageSquare, CircleCheck } from "lucide-react"

type ContactStep = 'initial' | 'name' | 'email' | 'phone' | 'preference' | 'success' | 'successButton'

interface ContactForm {
  name: string
  phone: string
  email: string
  preferences: ('call' | 'sms' | 'whatsapp' | 'email')[]
}

interface ValidationErrors {
  name?: string
  phone?: string
  email?: string
}

// Custom WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
  </svg>
)

export const Contact = () => {
  const [currentStep, setCurrentStep] = useState<ContactStep>('initial')
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    phone: '',
    email: '',
    preferences: []
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
    const [containerHeight, setContainerHeight] = useState<number | 'auto'>('auto')
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Animation effect for step transitions
  useEffect(() => {
    // Set a fixed height for smooth transitions
    const heights = {
      initial: 75,
      name: 175,
      email: 175,
      phone: 175,
      preference: 200,
      success: 115,
      successButton: 75
    }
    setContainerHeight(heights[currentStep as keyof typeof heights] || 'auto')
  }, [currentStep])

  // Handle transition animations
  useEffect(() => {
    if (currentStep === 'successButton') {
      setIsTransitioning(true)
      const timer = setTimeout(() => setIsTransitioning(false), 300)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  // Handle transition back to initial
  useEffect(() => {
    if (currentStep === 'initial' && containerHeight === 75) {
      // This means we're coming from successButton
      setIsTransitioning(true)
      const timer = setTimeout(() => setIsTransitioning(false), 300)
      return () => clearTimeout(timer)
    }
  }, [currentStep, containerHeight])

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Name is required'
    if (name.trim().length < 2) return 'Name must be at least 2 characters'
    if (name.trim().length > 50) return 'Name must be less than 50 characters'
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return 'Name can only contain letters, spaces, hyphens, and apostrophes'
    return undefined
  }

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return undefined // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address'
    if (email.trim().length > 100) return 'Email must be less than 100 characters'
    return undefined
  }

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) return undefined // Phone is optional
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/ 
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    if (!phoneRegex.test(cleanPhone)) return 'Please enter a valid phone number'
    if (cleanPhone.length < 10) return 'Phone number must be at least 10 digits'
    if (cleanPhone.length > 15) return 'Phone number must be less than 15 digits'
    return undefined
  }

  const validateField = (field: string, value: string) => {
    let error: string | undefined
    
    switch (field) {
      case 'name':
        error = validateName(value)
        break
      case 'email':
        error = validateEmail(value)
        break
      case 'phone':
        error = validatePhone(value)
        break
      default:
        error = undefined
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }))
    
    return !error
  }

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleFieldBlur = (field: string, value: string) => {
    validateField(field, value)
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateField('name', formData.name)) {
      setCurrentStep('email')
    }
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep('phone')
  }

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Check if at least one contact method is provided
    if (formData.email.trim() || formData.phone.trim()) {
      if (formData.email.trim() && !formData.phone.trim()) {
        // Only email provided, skip preference and go to success
        setCurrentStep('success')
      } else {
        // Phone provided (with or without email), show preference step
        setCurrentStep('preference')
      }
    }
  }

  const handlePreferenceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.preferences.length > 0) {
      setCurrentStep('success')
    }
  }

  const handleSuccess = () => {
    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      preferences: []
    })
    setErrors({})
    
    // Trigger transition animation
    setIsTransitioning(true)
    
    // Transition to success button after animation
    setTimeout(() => {
      setCurrentStep('successButton')
    }, 300)
    
    // Reset to normal state after 8 seconds
    setTimeout(() => {
      setCurrentStep('initial')
    }, 8000)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      preferences: []
    })
    setErrors({})
    setCurrentStep('initial')
  }

  const goBack = () => {
    switch (currentStep) {
      case 'email':
        setCurrentStep('name')
        break
      case 'phone':
        setCurrentStep('email')
        break
      case 'preference':
        setCurrentStep('phone')
        break
      default:
        break
    }
  }

  const canSkipPhone = () => {
    return formData.email.trim() !== '' // Can skip phone if email is provided
  }

  const canProceedFromPhone = () => {
    return formData.email.trim() !== '' || formData.phone.trim() !== ''
  }

  const togglePreference = (preference: 'call' | 'sms' | 'whatsapp' | 'email') => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter(p => p !== preference)
        : [...prev.preferences, preference]
    }))
  }

  const getAvailablePreferences = () => {
    const available: ('call' | 'sms' | 'whatsapp' | 'email')[] = []
    
    if (formData.phone.trim()) {
      available.push('call', 'sms', 'whatsapp')
    }
    if (formData.email.trim()) {
      available.push('email')
    }
    
    return available
  }

  // Show initial button
  if (currentStep === 'initial') {
    return (
      <div 
        className="bg-background border rounded-lg p-4 shadow-sm transition-[height] duration-300 ease-in-out"
        style={{ 
          height: containerHeight === 'auto' ? 'auto' : `${containerHeight}px`,
          overflow: 'hidden'
        }}
      >
        <Button 
          className={`w-full transition-all duration-300 ease-in-out ${
            isTransitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
          }`}
          size="lg"
          onClick={() => setCurrentStep('name')}
        >
          <Send className="h-4 w-4 mr-2" />
          Contact Agent
        </Button>
      </div>
    )
  }

  return (
    <div 
      className="bg-background border rounded-lg p-4 shadow-sm transition-[height] duration-300 ease-in-out"
      style={{ 
        height: containerHeight === 'auto' ? 'auto' : `${containerHeight}px`,
        overflow: 'hidden'
      }}
    >
      <div className="space-y-4">
      {/* Step 1: Name */}
      {currentStep === 'name' && (
          <form onSubmit={handleNameSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">What&apos;s your name?</Label>
            <Input
              id="name"
              type="text"
              placeholder="How can we call you?"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={(e) => handleFieldBlur('name', e.target.value)}
              required
              autoFocus
            />
            <div className="text-sm text-muted-foreground">
              {errors.name ? errors.name : "We'll use this to personalize your experience."}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!formData.name.trim() || !!errors.name}>
              Continue
            </Button>
          </div>
        </form>
      )}

      {/* Step 2: Email */}
      {currentStep === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={(e) => handleFieldBlur('email', e.target.value)}
              autoFocus
            />
            <div className="text-sm text-muted-foreground">
              {errors.email ? errors.email : "You can skip this step if you prefer to provide only a phone number"}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={goBack} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={!!errors.email}>
              Continue
            </Button>
          </div>
        </form>
      )}

      {/* Step 3: Phone */}
      {currentStep === 'phone' && (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              onBlur={(e) => handleFieldBlur('phone', e.target.value)}
              autoFocus
            />
            <div className="text-sm text-muted-foreground">
              {errors.phone ? errors.phone : (
                canSkipPhone() 
                  ? "You can skip this step if you prefer to be contacted by email only"
                  : "Please provide either an email or phone number"
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={goBack} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {canSkipPhone() && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentStep('success')}
                className="flex-1"
              >
                Skip
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={!canProceedFromPhone() || !!errors.phone}
            >
              Continue
            </Button>
          </div>
        </form>
      )}

      {/* Step 4: Contact Preference */}
      {currentStep === 'preference' && (
        <form onSubmit={handlePreferenceSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label>How would you prefer to be contacted?</Label>
            <div className="grid grid-cols-2 gap-2">
              {getAvailablePreferences().map((preference) => (
                <Button
                  key={preference}
                  type="button"
                  variant={formData.preferences.includes(preference) ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => togglePreference(preference)}
                >
                  {preference === 'call' && <Phone className="h-4 w-4 mr-2" />}
                  {preference === 'sms' && <MessageSquare className="h-4 w-4 mr-2" />}
                  {preference === 'whatsapp' && <WhatsAppIcon className="h-4 w-4 mr-2" />}
                  {preference === 'email' && <Mail className="h-4 w-4 mr-2" />}
                  {preference === 'call' && 'Call'}
                  {preference === 'sms' && 'SMS'}
                  {preference === 'whatsapp' && 'WhatsApp'}
                  {preference === 'email' && 'Email'}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={goBack} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={formData.preferences.length === 0}
            >
              Send Message
            </Button>
          </div>
        </form>
      )}

      {/* Step 5: Success */}
      {currentStep === 'success' && (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Thank you for your interest, {formData.name}. We&apos;ll contact you soon.
            </p>
          </div>
          <Button 
            onClick={handleSuccess} 
            className={`w-full transition-all duration-300 ease-in-out ${
              isTransitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
            }`}
          >
            Perfect!
          </Button>
        </div>
      )}

      {/* Step 6: Success Button */}
      {currentStep === 'successButton' && (
        <Button 
          className={`w-full bg-green-800 text-white transition-all duration-300 ease-in-out ${
            isTransitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
          }`}
          size="lg"
          disabled
        >
          <CircleCheck className="h-10 w-10 text-green-100" strokeWidth={2} />
        </Button>
      )}
      </div>
    </div>
  )
} 