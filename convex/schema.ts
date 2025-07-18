import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  properties: defineTable({
    title: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.optional(v.string()), // Currency code (USD, EUR, GBP, etc.)
    location: v.string(),
    type: v.union(v.literal("House"), v.literal("Apartment"), v.literal("Land"), v.literal("Commercial")),
    status: v.union(v.literal("For Sale"), v.literal("For Rent"), v.literal("Sold")),
    images: v.array(v.string()),
    views: v.optional(v.number()),
    likes: v.optional(v.number()),
    shares: v.optional(v.number()),
    notes: v.optional(v.number()),
  }).index("by_type", ["type"]).index("by_status", ["status"]).index("by_price", ["price"]),

  // Multimedia files linked to properties
  multimedia: defineTable({
    propertyId: v.id("properties"),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("document")),
    filename: v.string(),
    fileSize: v.optional(v.number()), // bytes
    mimeType: v.optional(v.string()),
    url: v.string(), // For now, just storing URLs; later can be replaced with Convex file storage IDs
    order: v.optional(v.number()), // For ordering images in gallery
    description: v.optional(v.string()),
  }).index("by_property", ["propertyId"]).index("by_property_and_type", ["propertyId", "type"]),

  // Custom fields for properties
  propertyCustomFields: defineTable({
    propertyId: v.id("properties"),
    name: v.string(),
    value: v.union(v.string(), v.number(), v.boolean()),
    fieldType: v.union(
      v.literal("text"),
      v.literal("number"),
      v.literal("boolean"),
      v.literal("metric"),
      v.literal("currency"),
      v.literal("percentage")
    ),
    unit: v.optional(v.string()), // For metric fields (e.g., "m", "ft", "kg")
    icon: v.optional(v.string()), // Icon name for display
    order: v.optional(v.number()), // For field ordering in UI
  }).index("by_property", ["propertyId"]).index("by_property_and_name", ["propertyId", "name"]),

  // Amenities for properties
  propertyAmenities: defineTable({
    propertyId: v.id("properties"),
    amenityId: v.id("amenities"),
    isAvailable: v.boolean(),
    notes: v.optional(v.string()), // Optional notes for specific amenity (e.g., pool size)
  }).index("by_property", ["propertyId"]).index("by_amenity", ["amenityId"]).index("by_property_and_amenity", ["propertyId", "amenityId"]),

  // Master amenities list (both default and custom)
  amenities: defineTable({
    name: v.string(),
    icon: v.optional(v.string()), // Icon name or class
    color: v.optional(v.string()), // Color for custom amenities
    isDefault: v.boolean(), // Whether this is a default amenity or custom
    category: v.optional(v.string()), // e.g., "recreation", "utilities", "security"
  }).index("by_isDefault", ["isDefault"]),
});
