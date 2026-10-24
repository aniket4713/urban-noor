"use client";

import { useRef, useState } from "react";
import { Reorder } from "framer-motion";
import { GripVertical, ImagePlus, Loader2, Star, X } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

/**
 * Multi-image uploader with drag-to-reorder.
 * Images go to Supabase Storage via /api/admin/upload; the first image is the main/cover image.
 */
export function ImageUploader({ value, onChange, max = 10, folder = "products" }: { value: string[]; onChange: (urls: string[]) => void; max?: number; folder?: string }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, max - value.length);
    if (!list.length) return toast(`You can add up to ${max} images`, "error");
    setUploading(true);
    try {
      const fd = new FormData();
      list.forEach((f) => fd.append("files", f));
      fd.append("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange([...value, ...data.urls]);
      toast(`${data.urls.length} image(s) uploaded`);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <Reorder.Group axis="y" values={value} onReorder={onChange} className="space-y-2">
          {value.map((url, i) => (
            <Reorder.Item key={url} value={url} className="flex cursor-grab items-center gap-3 rounded-xl border border-ivory/10 bg-noir-900 p-2 active:cursor-grabbing" whileDrag={{ scale: 1.02, boxShadow: "0 10px 30px rgba(91,30,145,.2)" }}>
              <GripVertical className="h-4 w-4 text-ivory/30" />
              <img src={url} alt="" className="h-14 w-12 rounded-lg object-cover" />
              <span className="flex-1 truncate text-xs text-ivory/45">{url.split("/").pop()}</span>
              {i === 0 && <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] text-gold"><Star className="h-3 w-3" /> Cover</span>}
              <button type="button" onClick={() => onChange(value.filter((u) => u !== url))} className="p-1 text-ivory/40 hover:text-red-600" aria-label="Remove image">
                <X className="h-4 w-4" />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {value.length < max && (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-sm transition ${dragOver ? "border-gold bg-gold/5 text-gold" : "border-ivory/15 text-ivory/50 hover:border-gold/50"}`}
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin text-gold" /> : <ImagePlus className="h-6 w-6" />}
          {uploading ? "Uploading…" : "Click or drop images here (JPG/PNG/WEBP, max 5 MB)"}
          <span className="text-[11px] text-ivory/35">Drag the rows above to reorder — the first image is the cover.</span>
        </button>
      )}
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
    </div>
  );
}
