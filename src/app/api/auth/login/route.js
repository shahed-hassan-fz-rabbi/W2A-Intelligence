import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { setSession } from "@/lib/session";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const rows = await query(
      `SELECT user_id, name, email, password_hash, role, zone_id
       FROM User
       WHERE email = ? AND is_active = TRUE`,
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0 || rows[0].password_hash !== password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await setSession(rows[0]);
    return NextResponse.json({ ok: true, role: rows[0].role });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}