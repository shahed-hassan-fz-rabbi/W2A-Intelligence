import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function GET() {
  const auth = await requireRole("admin");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const rows = await query(
      `SELECT u.user_id, u.name, u.email, u.role, u.is_active,
              DATE_FORMAT(u.created_at, '%Y-%m-%d') AS joined,
              z.name AS zone_name, c.name AS company_name,
              u.zone_id, u.company_id,
              (SELECT COUNT(*) FROM WasteCollection wc WHERE wc.user_id = u.user_id)
                AS collections
       FROM User u
       LEFT JOIN Zone z    ON u.zone_id = z.zone_id
       LEFT JOIN Company c ON u.company_id = c.company_id
       ORDER BY FIELD(u.role,'admin','collector','company'), u.name`
    );
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireRole("admin");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const role = body.role;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password and role are required" },
        { status: 400 }
      );
    }
    if (!["admin", "collector", "company"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }
    if (role === "collector" && !body.zone_id) {
      return NextResponse.json(
        { error: "Collectors must be assigned a zone" },
        { status: 400 }
      );
    }
    if (role === "company" && !body.company_id) {
      return NextResponse.json(
        { error: "Company managers must be linked to a company" },
        { status: 400 }
      );
    }

    const result = await execute(
      `INSERT INTO User (name, email, password_hash, role, zone_id, company_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        password,
        role,
        role === "collector" ? Number(body.zone_id) : null,
        role === "company" ? Number(body.company_id) : null,
      ]
    );

    return NextResponse.json(
      { ok: true, user_id: result.insertId, message: `${name} added` },
      { status: 201 }
    );
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}