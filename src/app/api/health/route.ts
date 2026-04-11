import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();
    // Lightweight DB ping
    const { error } = await supabase.from("categories").select("id").limit(1);
    if (error) throw error;

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      db: "connected",
      version: process.env.npm_package_version ?? "unknown",
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        db: "disconnected",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
