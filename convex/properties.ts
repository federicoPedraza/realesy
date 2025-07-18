import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Property Mutations
export const createProperty = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.optional(v.string()),
    location: v.string(),
    type: v.union(v.literal("House"), v.literal("Apartment"), v.literal("Land"), v.literal("Commercial")),
    status: v.union(v.literal("For Sale"), v.literal("For Rent"), v.literal("Sold")),
    images: v.array(v.string()), // Legacy support
  },
  returns: v.object({ propertyId: v.id("properties") }),
  handler: async (ctx, args) => {
    const propertyId = await ctx.db.insert("properties", {
      ...args,
      views: 0,
      likes: 0,
      shares: 0,
      notes: 0,
    });
    return { propertyId };
  },
});

export const updateProperty = mutation({
  args: {
    propertyId: v.id("properties"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    location: v.optional(v.string()),
    type: v.optional(v.union(v.literal("House"), v.literal("Apartment"), v.literal("Land"), v.literal("Commercial"))),
    status: v.optional(v.union(v.literal("For Sale"), v.literal("For Rent"), v.literal("Sold"))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { propertyId, ...updates } = args;
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(propertyId, cleanUpdates);
    return null;
  },
});

// Multimedia Mutations
export const addMultimedia = mutation({
  args: {
    propertyId: v.id("properties"),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("document")),
    filename: v.string(),
    url: v.string(),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    order: v.optional(v.number()),
    description: v.optional(v.string()),
    priority: v.optional(v.number()), // Priority number for loading order (lower numbers = higher priority)
  },
  returns: v.object({ multimediaId: v.id("multimedia") }),
  handler: async (ctx, args) => {
    const multimediaId = await ctx.db.insert("multimedia", args);
    return { multimediaId };
  },
});

export const deleteMultimedia = mutation({
  args: { multimediaId: v.id("multimedia") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.multimediaId);
    return null;
  },
});

export const updateMultimediaPriority = mutation({
  args: {
    multimediaId: v.id("multimedia"),
    priority: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.multimediaId, { priority: args.priority });
    return null;
  },
});

export const reorderMultimediaPriorities = mutation({
  args: {
    propertyId: v.id("properties"),
    multimediaOrder: v.array(v.object({
      multimediaId: v.id("multimedia"),
      priority: v.number(),
    })),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Update each multimedia item with its new priority
    for (const item of args.multimediaOrder) {
      await ctx.db.patch(item.multimediaId, { priority: item.priority });
    }
    return null;
  },
});

// Custom Fields Mutations
export const addCustomField = mutation({
  args: {
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
    unit: v.optional(v.string()),
    icon: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  returns: v.object({ fieldId: v.id("propertyCustomFields") }),
  handler: async (ctx, args) => {
    // Check if a field with the same name already exists for this property
    const existingField = await ctx.db
      .query("propertyCustomFields")
      .withIndex("by_property_and_name", (q) => 
        q.eq("propertyId", args.propertyId).eq("name", args.name)
      )
      .unique();

    if (existingField) {
      // Update the existing field
      await ctx.db.patch(existingField._id, {
        value: args.value,
        fieldType: args.fieldType,
        unit: args.unit,
        icon: args.icon,
        order: args.order,
      });
      return { fieldId: existingField._id };
    } else {
      // Create a new field
      const fieldId = await ctx.db.insert("propertyCustomFields", args);
      return { fieldId };
    }
  },
});

export const updateCustomField = mutation({
  args: {
    fieldId: v.id("propertyCustomFields"),
    name: v.optional(v.string()),
    value: v.optional(v.union(v.string(), v.number(), v.boolean())),
    fieldType: v.optional(v.union(
      v.literal("text"),
      v.literal("number"),
      v.literal("boolean"),
      v.literal("metric"),
      v.literal("currency"),
      v.literal("percentage")
    )),
    unit: v.optional(v.string()),
    icon: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { fieldId, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(fieldId, cleanUpdates);
    return null;
  },
});

export const deleteCustomField = mutation({
  args: { fieldId: v.id("propertyCustomFields") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.fieldId);
    return null;
  },
});

// Amenities Mutations
export const createAmenity = mutation({
  args: {
    name: v.string(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    isDefault: v.boolean(),
    category: v.optional(v.string()),
  },
  returns: v.object({ amenityId: v.id("amenities") }),
  handler: async (ctx, args) => {
    const amenityId = await ctx.db.insert("amenities", args);
    return { amenityId };
  },
});

export const updateAmenity = mutation({
  args: {
    amenityId: v.id("amenities"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { amenityId, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(amenityId, cleanUpdates);
    return null;
  },
});

export const addPropertyAmenity = mutation({
  args: {
    propertyId: v.id("properties"),
    amenityId: v.id("amenities"),
    isAvailable: v.boolean(),
    notes: v.optional(v.string()),
  },
  returns: v.object({ propertyAmenityId: v.id("propertyAmenities") }),
  handler: async (ctx, args) => {
    // Check if this amenity already exists for this property
    const existingPropertyAmenity = await ctx.db
      .query("propertyAmenities")
      .withIndex("by_property_and_amenity", (q) => 
        q.eq("propertyId", args.propertyId).eq("amenityId", args.amenityId)
      )
      .unique();

    if (existingPropertyAmenity) {
      // Update the existing property amenity
      await ctx.db.patch(existingPropertyAmenity._id, {
        isAvailable: args.isAvailable,
        notes: args.notes,
      });
      return { propertyAmenityId: existingPropertyAmenity._id };
    } else {
      // Create a new property amenity
      const propertyAmenityId = await ctx.db.insert("propertyAmenities", args);
      return { propertyAmenityId };
    }
  },
});

export const updatePropertyAmenity = mutation({
  args: {
    propertyAmenityId: v.id("propertyAmenities"),
    isAvailable: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { propertyAmenityId, ...updates } = args;
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(propertyAmenityId, cleanUpdates);
    return null;
  },
});

export const deletePropertyAmenity = mutation({
  args: { propertyAmenityId: v.id("propertyAmenities") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.propertyAmenityId);
    return null;
  },
});

// Initialize default amenities
export const initializeDefaultAmenities = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if default amenities already exist
    const existingDefaults = await ctx.db
      .query("amenities")
      .withIndex("by_isDefault", (q) => q.eq("isDefault", true))
      .collect();

    if (existingDefaults.length > 0) {
      return null; // Already initialized
    }

    const defaultAmenities = [
      { name: "Grill", icon: "Flame", isDefault: true, category: "recreation" },
      { name: "Pool", icon: "Waves", isDefault: true, category: "recreation" },
      { name: "Garage", icon: "Car", isDefault: true, category: "parking" },
      { name: "WiFi", icon: "Wifi", isDefault: true, category: "utilities" },
      { name: "TV", icon: "Tv", isDefault: true, category: "entertainment" },
      { name: "AC", icon: "AirVent", isDefault: true, category: "utilities" },
      { name: "Gym", icon: "Dumbbell", isDefault: true, category: "recreation" },
      { name: "Security", icon: "Shield", isDefault: true, category: "security" },
      { name: "Garden", icon: "TreePine", isDefault: true, category: "outdoor" },
      { name: "Balcony", icon: "Building", isDefault: true, category: "outdoor" },
    ];

    for (const amenity of defaultAmenities) {
      await ctx.db.insert("amenities", amenity);
    }

    return null;
  },
});

// Migration function to add priority to existing multimedia records
export const migrateMultimediaPriority = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Get all multimedia records that don't have a priority field
    const multimediaRecords = await ctx.db.query("multimedia").collect();
    
    for (const record of multimediaRecords) {
      // Check if the record already has a priority field
      if (record.priority === undefined) {
        // Use the order field if available, otherwise use creation time as priority
        const priority = record.order !== undefined ? record.order : record._creationTime;
        await ctx.db.patch(record._id, { priority });
      }
    }

    return null;
  },
});

// Queries
export const getProperty = query({
  args: { propertyId: v.id("properties") },
  returns: v.union(v.object({
    _id: v.id("properties"),
    _creationTime: v.number(),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.optional(v.string()),
    location: v.string(),
    type: v.union(v.literal("House"), v.literal("Apartment"), v.literal("Land"), v.literal("Commercial")),
    status: v.union(v.literal("For Sale"), v.literal("For Rent"), v.literal("Sold")),
    images: v.array(v.string()),
    views: v.optional(v.number()),
    likes: v.optional(v.number()),
    shares: v.optional(v.number()),
    notes: v.optional(v.number()),
  }), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.propertyId);
  },
});

export const getProperties = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("properties"),
    _creationTime: v.number(),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.optional(v.string()),
    location: v.string(),
    type: v.union(v.literal("House"), v.literal("Apartment"), v.literal("Land"), v.literal("Commercial")),
    status: v.union(v.literal("For Sale"), v.literal("For Rent"), v.literal("Sold")),
    images: v.array(v.string()),
    views: v.optional(v.number()),
    likes: v.optional(v.number()),
    shares: v.optional(v.number()),
    notes: v.optional(v.number()),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("properties").collect();
  },
});

export const getPropertyMultimedia = query({
  args: { propertyId: v.id("properties") },
  returns: v.array(v.object({
    _id: v.id("multimedia"),
    _creationTime: v.number(),
    propertyId: v.id("properties"),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("document")),
    filename: v.string(),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    url: v.string(),
    order: v.optional(v.number()),
    description: v.optional(v.string()),
    priority: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("multimedia")
      .withIndex("by_property_and_priority", (q) => q.eq("propertyId", args.propertyId))
      .order("asc") // Order by priority (ascending - lower numbers first)
      .collect();
  },
});

export const getPropertyMultimediaByType = query({
  args: { 
    propertyId: v.id("properties"),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("document")),
  },
  returns: v.array(v.object({
    _id: v.id("multimedia"),
    _creationTime: v.number(),
    propertyId: v.id("properties"),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("document")),
    filename: v.string(),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    url: v.string(),
    order: v.optional(v.number()),
    description: v.optional(v.string()),
    priority: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("multimedia")
      .withIndex("by_property_and_type", (q) => 
        q.eq("propertyId", args.propertyId).eq("type", args.type)
      )
      .order("asc") // Order by priority (ascending - lower numbers first)
      .collect();
  },
});

// Get the next available priority number for a property
export const getNextPriority = query({
  args: { propertyId: v.id("properties") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const multimediaRecords = await ctx.db
      .query("multimedia")
      .withIndex("by_property_and_priority", (q) => q.eq("propertyId", args.propertyId))
      .order("desc") // Get the highest priority first
      .first();
    
    return multimediaRecords && multimediaRecords.priority !== undefined ? multimediaRecords.priority + 1 : 0;
  },
});

export const getPropertyCustomFields = query({
  args: { propertyId: v.id("properties") },
  returns: v.array(v.object({
    _id: v.id("propertyCustomFields"),
    _creationTime: v.number(),
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
    unit: v.optional(v.string()),
    icon: v.optional(v.string()),
    order: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("propertyCustomFields")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();
  },
});

export const getPropertyAmenities = query({
  args: { propertyId: v.id("properties") },
  returns: v.array(v.object({
    _id: v.id("propertyAmenities"),
    _creationTime: v.number(),
    propertyId: v.id("properties"),
    amenityId: v.id("amenities"),
    isAvailable: v.boolean(),
    notes: v.optional(v.string()),
    amenity: v.object({
      _id: v.id("amenities"),
      _creationTime: v.number(),
      name: v.string(),
      icon: v.optional(v.string()),
      color: v.optional(v.string()),
      isDefault: v.boolean(),
      category: v.optional(v.string()),
    }),
  })),
  handler: async (ctx, args) => {
    const propertyAmenities = await ctx.db
      .query("propertyAmenities")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();

    const amenitiesWithDetails = [];
    for (const pa of propertyAmenities) {
      const amenity = await ctx.db.get(pa.amenityId);
      if (amenity) {
        amenitiesWithDetails.push({
          ...pa,
          amenity,
        });
      }
    }

    return amenitiesWithDetails;
  },
});

export const getAllAmenities = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("amenities"),
    _creationTime: v.number(),
    name: v.string(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    isDefault: v.boolean(),
    category: v.optional(v.string()),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("amenities").collect();
  },
});

export const getDefaultAmenities = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("amenities"),
    _creationTime: v.number(),
    name: v.string(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    isDefault: v.boolean(),
    category: v.optional(v.string()),
  })),
  handler: async (ctx) => {
    return await ctx.db
      .query("amenities")
      .withIndex("by_isDefault", (q) => q.eq("isDefault", true))
      .collect();
  },
}); 