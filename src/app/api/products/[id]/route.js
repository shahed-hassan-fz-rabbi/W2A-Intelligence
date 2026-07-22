import { NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function DELETE(request, { params }) {
  const auth = await requireRole("admin");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const result = await execute("DELETE FROM Product WHERE product_id = ?", [id]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}