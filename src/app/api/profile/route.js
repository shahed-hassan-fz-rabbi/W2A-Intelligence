import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireRole, setSession } from "@/lib/session";

export async function GET() {
  const auth = await requireRole();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const [user] = await query(
      `SELECT u.user_id, u.name, u.email, u.role, u.zone_id, u.company_id,
              DATE_FORMAT(u.created_at, '%Y-%m-%d') AS joined,
              z.name AS zone_name, c.name AS company_name
       FROM User u
       LEFT JOIN Zone z    ON u.zone_id = z.zone_id
       LEFT JOIN Company c ON u.company_id = c.company_id
       WHERE u.user_id = ?`,
      [auth.session.user_id]
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Role-specific activity summary
    let stats = {};
    if (user.role === "collector") {
      const [s] = await query(
        `SELECT COUNT(*) AS collections,
                COALESCE(SUM(quantity_kg), 0) AS total_kg
         FROM WasteCollection WHERE user_id = ?`,
        [user.user_id]
      );
      stats = s;
    } else if (user.role === "company" && user.company_id) {
      const [s] = await query(
        `SELECT COUNT(*) AS assignments,
                COALESCE(SUM(a.status = 'Completed'), 0) AS completed,
                COALESCE(SUM(a.processed_qty), 0) AS processed_kg
         FROM Assignment a WHERE a.company_id = ?`,
        [user.company_id]
      );
      stats = s;
    } else {
      const [s] = await query(
        `SELECT (SELECT COUNT(*) FROM WasteCollection) AS collections,
                (SELECT COUNT(*) FROM Company)         AS companies,
                (SELECT COUNT(*) FROM User)            AS users`
      );
      stats = s;
    }

    return NextResponse.json({ user, stats });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const auth = await requireRole();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { name, email } = await request.json();

    if (!name?.trim() || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Name must be at least 3 characters" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const clean = email.trim().toLowerCase();
    const dup = await query(
      "SELECT user_id FROM User WHERE email = ? AND user_id <> ?",
      [clean, auth.session.user_id]
    );
    if (dup.length > 0) {
      return NextResponse.json(
        { error: "That email is already used by another account" },
        { status: 409 }
      );
    }

    await execute("UPDATE User SET name = ?, email = ? WHERE user_id = ?", [
      name.trim(),
      clean,
      auth.session.user_id,
    ]);

    await setSession({
      ...auth.session,
      name: name.trim(),
      email: clean,
    });

    return NextResponse.json({ ok: true, message: "Profile updated" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}