// Product image upload limits and validation, shared by the client form
// (src/components/products/product-form.tsx) and the upload route handler
// (src/app/api/upload/route.ts) so both agree on what a valid image is.
//
// The cap stays below Vercel's 4.5 MB serverless request-body limit. Uploads
// go through a route handler rather than a Server Action, so they are not
// subject to the 1 MB default Server Action body limit that previously
// rejected normal photos with a generic "unexpected response" error.
export const MAX_IMAGE_MB = 4;
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

export type ImageValidationResult = { ok: true } | { ok: false; error: string };

export function validateImageFile(
  file: { size: number; type: string } | null | undefined
): ImageValidationResult {
  if (!file) return { ok: false, error: "No file provided" };
  if (!file.type.startsWith("image/")) return { ok: false, error: "File must be an image" };
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: `Image must be less than ${MAX_IMAGE_MB}MB` };
  }
  return { ok: true };
}
