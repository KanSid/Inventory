"use server";

import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

export async function uploadProductImage(file: File) {
  if (!file) {
    return { error: "No file provided" };
  }

  // Validate file
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "Image must be less than 5MB" };
  }

  try {
    const supabase = await createClient();

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${randomBytes(16).toString("hex")}.${ext}`;
    const bucket = "product-images";
    const path = `products/${filename}`;

    // Upload to Supabase Storage
    const buffer = await file.arrayBuffer();
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { error: "Failed to upload image" };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return { success: true, url: publicUrl };
  } catch (err) {
    console.error("Upload error:", err);
    return { error: "Failed to upload image" };
  }
}
