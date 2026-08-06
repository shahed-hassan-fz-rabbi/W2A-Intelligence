import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { setSession } from "@/lib/session";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      password,
      role,
      zone_id,
      company_id,
    } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "Name, email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Duplicate email check
    const existing = await query(
      `
      SELECT user_id
      FROM User
      WHERE email = ?
      `,
      [cleanEmail]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: "Email already exists",
        },
        {
          status: 400,
        }
      );
    }

    // Default role
    const userRole = role || "Waste Collector";

    // Insert user
    const result = await query(
      `
      INSERT INTO User
      (
        name,
        email,
        password_hash,
        role,
        zone_id,
        company_id,
        is_active
      )
      VALUES
      (
        ?, ?, ?, ?, ?, ?, TRUE
      )
      `,
      [
        name.trim(),
        cleanEmail,
        password,
        userRole,
        zone_id || null,
        company_id || null,
      ]
    );

    // Fetch inserted user
    const rows = await query(
      `
      SELECT
      user_id,
      name,
      email,
      password_hash,
      role,
      zone_id,
      company_id
      FROM User
      WHERE user_id = ?
      `,
      [result.insertId]
    );

    await setSession(rows[0]);

    return NextResponse.json({
      ok: true,
      role: rows[0].role,
      name: rows[0].name,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);

    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}