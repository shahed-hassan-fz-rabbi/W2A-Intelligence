import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const [zones, companies] = await Promise.all([
      query(
        "SELECT zone_id, name, city, area_code FROM Zone ORDER BY city, name"
      ),
      query(
        "SELECT company_id, name FROM Company WHERE is_active = TRUE ORDER BY name"
      ),
    ]);
    return NextResponse.json({ zones, companies });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}