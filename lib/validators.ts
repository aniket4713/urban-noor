import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

export const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code");

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email");

export const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(100);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});

export const forgotSchema = z.object({ email: emailSchema });
export const resetSchema = z.object({ token: z.string().min(10), password: passwordSchema });

export const addressSchema = z.object({
  name: z.string().trim().min(2, "Enter full name").max(80),
  phone: phoneSchema,
  line1: z.string().trim().min(3, "Enter address").max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter city").max(80),
  state: z.string().trim().min(2, "Select state").max(80),
  pincode: pincodeSchema,
  isDefault: z.boolean().optional(),
});

export const cartLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});

export const checkoutSchema = z.object({
  items: z.array(cartLineSchema).min(1, "Your cart is empty"),
  customer: z.object({
    name: z.string().trim().min(2, "Enter your name").max(80),
    email: emailSchema,
    phone: phoneSchema,
  }),
  address: addressSchema.omit({ isDefault: true }),
  couponCode: z.string().trim().toUpperCase().max(30).optional().or(z.literal("")),
  saveAddress: z.boolean().optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().trim().toUpperCase().min(4),
  contact: z.string().trim().min(4, "Enter email or phone"),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(140),
  slug: z.string().trim().max(160).optional().or(z.literal("")),
  description: z.string().trim().min(10, "Description is too short"),
  gender: z.enum(["MEN", "WOMEN", "UNISEX"]),
  categoryId: z.string().min(1, "Select a category"),
  price: z.coerce.number().int().min(1),
  mrp: z.coerce.number().int().min(1),
  stock: z.coerce.number().int().min(0),
  sku: z.string().trim().max(60).optional().or(z.literal("")),
  material: z.string().trim().max(120).optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  images: z.array(z.string().min(1)).max(10).default([]),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
});

export const couponSchema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(30).regex(/^[A-Z0-9_-]+$/, "Use letters and numbers only"),
  type: z.enum(["PERCENT", "FLAT"]),
  value: z.coerce.number().int().min(1),
  minOrder: z.coerce.number().int().min(0).default(0),
  maxDiscount: z.coerce.number().int().min(1).optional().nullable(),
  usageLimit: z.coerce.number().int().min(1).optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const orderUpdateSchema = z.object({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  courier: z.string().trim().max(60).optional().nullable(),
  trackingNumber: z.string().trim().max(80).optional().nullable(),
});

export const settingsSchema = z.object({
  tagline: z.string().trim().max(120),
  announcement: z.string().trim().max(300),
  heroTitle: z.string().trim().max(120),
  heroSubtitle: z.string().trim().max(300),
  heroImage: z.string().trim().min(1),
  shippingFee: z.coerce.number().int().min(0),
  freeShippingThreshold: z.coerce.number().int().min(0),
  whatsappNumber: z.string().trim().regex(/^\d{10,15}$/, "Digits only, with country code e.g. 919876543210"),
  contactEmail: z.string().trim().email(),
  contactPhone: z.string().trim().max(30),
  address: z.string().trim().max(200),
  instagramUrl: z.string().trim().max(200),
  facebookUrl: z.string().trim().max(200),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: phoneSchema.optional().or(z.literal("")),
});
