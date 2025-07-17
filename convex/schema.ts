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
    location: v.string(),
    images: v.array(v.string()),
  }),
});
