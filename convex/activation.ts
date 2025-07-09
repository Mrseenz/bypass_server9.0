import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Internal mutations for database operations
export const logActivationRequestInternal = internalMutation({
  args: {
    deviceId: v.string(),
    serialNumber: v.optional(v.string()),
    imei: v.optional(v.string()),
    productType: v.optional(v.string()),
    activationType: v.string(),
    requestData: v.string(),
    responseData: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    status: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activationLogs", args);
  }
});

export const updateDeviceInfoInternal = internalMutation({
  args: {
    deviceId: v.string(),
    serialNumber: v.optional(v.string()),
    imei: v.optional(v.string()),
    productType: v.optional(v.string()),
    buildVersion: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Check if device already exists
    const existingDevice = await ctx.db
      .query("deviceInfo")
      .withIndex("by_device_id", (q) => q.eq("deviceId", args.deviceId))
      .first();

    if (existingDevice) {
      // Update existing device
      await ctx.db.patch(existingDevice._id, {
        serialNumber: args.serialNumber,
        imei: args.imei,
        productType: args.productType,
        buildVersion: args.buildVersion,
        lastActivation: Date.now(),
        activationCount: existingDevice.activationCount + 1
      });
      return existingDevice._id;
    } else {
      // Create new device record
      return await ctx.db.insert("deviceInfo", {
        deviceId: args.deviceId,
        serialNumber: args.serialNumber,
        imei: args.imei,
        productType: args.productType,
        buildVersion: args.buildVersion,
        lastActivation: Date.now(),
        activationCount: 1
      });
    }
  }
});

// Query functions for the dashboard
export const getActivationLogs = query({
  args: {
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("activationLogs")
      .order("desc")
      .take(limit);
  }
});

export const getDeviceInfo = query({
  args: {
    deviceId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    if (args.deviceId) {
      return await ctx.db
        .query("deviceInfo")
        .withIndex("by_device_id", (q) => q.eq("deviceId", args.deviceId!))
        .first();
    } else {
      return await ctx.db
        .query("deviceInfo")
        .order("desc")
        .take(50);
    }
  }
});

export const getActivationStats = query({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("activationLogs").collect();
    const devices = await ctx.db.query("deviceInfo").collect();
    
    const totalActivations = logs.length;
    const successfulActivations = logs.filter(log => log.status === "success").length;
    const deviceActivations = logs.filter(log => log.activationType === "device").length;
    const drmActivations = logs.filter(log => log.activationType === "drm").length;
    const uniqueDevices = devices.length;
    
    return {
      totalActivations,
      successfulActivations,
      deviceActivations,
      drmActivations,
      uniqueDevices,
      successRate: totalActivations > 0 ? (successfulActivations / totalActivations) * 100 : 0
    };
  }
});
