import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function PATCH(request) {
  const auth = await requireRole();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { current, next, confirm } = await request.json();

    if (!current || !next || !confirm) {
      return NextResponse.json(
        { error: "All password fields are required" },
        { status: 400 }
      );
    }
    if (next !== confirm) {
      return NextResponse.json(
        { error: "New passwords do not match" },
        { status: 400 }
      );
    }
    if (next.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }
    if (next === current) {
      return NextResponse.json(
        { error: "New password must be different from the current one" },
        { status: 400 }
      );
    }

    const [user] = await query(
      "SELECT password_hash FROM User WHERE user_id = ?",
      [auth.session.user_id]
    );
    if (!user || user.password_hash !== current) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    await execute("UPDATE User SET password_hash = ? WHERE user_id = ?", [
      next,
      auth.session.user_id,
    ]);

    return NextResponse.json({ ok: true, message: "Password changed" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}