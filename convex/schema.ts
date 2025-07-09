import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  activationLogs: defineTable({
    deviceId: v.string(),
    serialNumber: v.optional(v.string()),
    imei: v.optional(v.string()),
    productType: v.optional(v.string()),
    activationType: v.string(), // "device" or "drm"
    requestData: v.string(),
    responseData: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    status: v.string(), // "success" or "error"
  }).index("by_device_id", ["deviceId"])
    .index("by_activation_type", ["activationType"])
    .index("by_status", ["status"]),

  deviceInfo: defineTable({
    deviceId: v.string(),
    serialNumber: v.optional(v.string()),
    imei: v.optional(v.string()),
    productType: v.optional(v.string()),
    buildVersion: v.optional(v.string()),
    lastActivation: v.number(),
    activationCount: v.number(),
  }).index("by_device_id", ["deviceId"])
    .index("by_serial", ["serialNumber"])
    .index("by_imei", ["imei"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
