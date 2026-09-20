import { test } from "node:test";
import assert from "node:assert/strict";
import { validateImageFile, MAX_IMAGE_BYTES, MAX_IMAGE_MB } from "./image-upload.ts";

test("accepts an image within the size limit", () => {
  assert.deepEqual(validateImageFile({ type: "image/jpeg", size: 1024 }), { ok: true });
  assert.deepEqual(validateImageFile({ type: "image/png", size: MAX_IMAGE_BYTES }), { ok: true });
});

// Regression: a file above the limit must be rejected here so the user gets a
// clear message instead of a failed upload. Oversized image uploads were the
// trigger for the "An unexpected response was received from the server." crash
// on the product edit page.
test("rejects a file larger than the limit", () => {
  assert.deepEqual(validateImageFile({ type: "image/jpeg", size: MAX_IMAGE_BYTES + 1 }), {
    ok: false,
    error: `Image must be less than ${MAX_IMAGE_MB}MB`,
  });
});

test("rejects a non-image file", () => {
  assert.deepEqual(validateImageFile({ type: "application/pdf", size: 1024 }), {
    ok: false,
    error: "File must be an image",
  });
});

test("rejects a missing file", () => {
  assert.deepEqual(validateImageFile(null), { ok: false, error: "No file provided" });
  assert.deepEqual(validateImageFile(undefined), { ok: false, error: "No file provided" });
});
