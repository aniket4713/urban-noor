import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { ApiError } from "@/lib/api";
import { BUCKET, supabaseAdmin, supabaseConfigured } from "@/lib/supabase";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export const uploadService = {
  /**
   * Uploads an image to Supabase Storage and returns its public URL.
   * Dev fallback: if Supabase isn't configured AND we're in development, the file is saved
   * to /public/uploads so you can test the admin panel before setting up Supabase.
   * In production, Supabase is required (Vercel's disk is read-only/ephemeral).
   */
  async uploadImage(file: File, folder = "products") {
    if (!ALLOWED.includes(file.type)) throw new ApiError(415, "Only JPG, PNG, WEBP, AVIF or GIF images are allowed");
    if (file.size > MAX_BYTES) throw new ApiError(413, "Image must be smaller than 5 MB");

    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const name = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    if (supabaseConfigured()) {
      const sb = supabaseAdmin();
      const { error } = await sb.storage.from(BUCKET()).upload(name, bytes, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw new ApiError(500, `Upload failed: ${error.message}`);
      return sb.storage.from(BUCKET()).getPublicUrl(name).data.publicUrl;
    }

    if (process.env.NODE_ENV !== "production") {
      const dest = path.join(process.cwd(), "public", "uploads", name);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, bytes);
      console.warn("⚠ Supabase not configured — saved upload locally (dev only):", `/uploads/${name}`);
      return `/uploads/${name}`;
    }

    throw new ApiError(500, "Image storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  },
};
