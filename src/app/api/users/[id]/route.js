import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function PATCH(request, { params }) {
  const auth = await requireRole("admin");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    if (Number(id) === auth.session.user_id && body.is_active === false) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    // Toggle active
    if (body.is_active !== undefined && body.name === undefined) {
      await execute("UPDATE User SET is_active = ? WHERE user_id = ?", [
        body.is_active ? 1 : 0,
        id,
      ]);
      return NextResponse.json({
        ok: true,
        message: body.is_active ? "Account activated" : "Account deactivated",
      });
    }

    // Reset password
    if (body.password) {
      if (body.password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      await execute("UPDATE User SET password_hash = ? WHERE user_id = ?", [
        body.password,
        id,
      ]);
      return NextResponse.json({ ok: true, message: "Password reset" });
    }

    // Full edit
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const role = body.role;

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email and role are required" },
        { status: 400 }
      );
    }

    const dup = await query(
      "SELECT user_id FROM User WHERE email = ? AND user_id <> ?",
      [email, id]
    );
    if (dup.length > 0) {
      return NextResponse.json(
        { error: "Another account already uses this email" },
        { status: 409 }
      );
    }

    await execute(
      `UPDATE User
       SET name = ?, email = ?, role = ?, zone_id = ?, company_id = ?
       WHERE user_id = ?`,
      [
        name,
        email,
        role,
        role === "collector" ? Number(body.zone_id) || null : null,
        role === "company" ? Number(body.company_id) || null : null,
        id,
      ]
    );

    return NextResponse.json({ ok: true, message: "User updated" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireRole("admin");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { id } = await params;

    if (Number(id) === auth.session.user_id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const [used] = await query(
      "SELECT COUNT(*) AS n FROM WasteCollection WHERE user_id = ?",
      [id]
    );
    if (used.n > 0) {
      return NextResponse.json(
        {
          error: `This user has ${used.n} collection record(s). Deactivate the account instead.`,
        },
        { status: 409 }
      );
    }

    const result = await execute("DELETE FROM User WHERE user_id = ?", [id]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, message: "User deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}