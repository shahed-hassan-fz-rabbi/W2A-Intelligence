import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query("SELECT COUNT(*) AS zones FROM Zone");
    return NextResponse.json({ ok: true, zones: rows[0].zones });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}