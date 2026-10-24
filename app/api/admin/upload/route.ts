import { ApiError, handle, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { uploadService } from "@/lib/services/uploadService";

/** multipart/form-data with one or more "files" fields → { urls: string[] } */
export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const form = await req.formData();
  const folder = String(form.get("folder") || "products").replace(/[^a-z0-9-]/gi, "") || "products";
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) throw new ApiError(400, "No files received");
  if (files.length > 10) throw new ApiError(400, "Upload up to 10 images at a time");
  const urls: string[] = [];
  for (const f of files) urls.push(await uploadService.uploadImage(f, folder));
  return ok({ urls }, 201);
});
