import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { validateImageFile } from "@/lib/image-upload";

export const runtime = "nodejs";

// Product image upload. A route handler (not a Server Action) so it is not
// bound by the 1 MB default Server Action body limit; it accepts images up to
// Vercel's 4.5 MB serverless request-body cap. See src/lib/image-upload.ts.
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validation = validateImageFile(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const supabase = await createClient();

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${randomBytes(16).toString("hex")}.${ext}`;
    const path = `products/${filename}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
