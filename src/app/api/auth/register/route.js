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

   
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

 
    if (name.trim().length < 3) {
      return NextResponse.json(
        { error: "Name must contain at least 3 characters." },
        { status: 400 }
      );
    }

    
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    
    if (password.length > 100) {
      return NextResponse.json(
        { error: "Password is too long." },
        { status: 400 }
      );
    }

    
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
        },
        { status: 400 }
      );
    }

    
    const existing = await query(
      `SELECT user_id FROM User WHERE email = ?`,
      [cleanEmail]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    
    const userRole = role || "Waste Collector";

    const result = await query(
      `INSERT INTO User (name, email, password_hash, role, zone_id, company_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [
        name.trim(),
        cleanEmail,
        password,
        userRole,
        zone_id || null,
        company_id || null,
      ]
    );

    
    const rows = await query(
      `SELECT user_id, name, email, password_hash, role, zone_id, company_id
       FROM User
       WHERE user_id = ?`,
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}