import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { reassign, canTransition, TRANSITIONS } from "@/lib/allocation";

// FR-4.1, FR-4.2, FR-4.3 — status update
// FR-3.6 — manual override (admin only)
export async function PATCH(request, { params }) {
  const auth = await requireRole("admin", "company");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // ---- Manual reassignment ----
    if (body.company_id !== undefined) {
      if (auth.session.role !== "admin") {
        return NextResponse.json(
          { error: "Only administrators can reassign a batch" },
          { status: 403 }
        );
      }
      await reassign(id, Number(body.company_id));
      return NextResponse.json({
        ok: true,
        message: "Assignment manually reassigned",
      });
    }

    // ---- Status transition ----
    const nextStatus = body.status;
    if (!nextStatus) {
      return NextResponse.json({ error: "No status provided" }, { status: 400 });
    }

    const [current] = await query(
      "SELECT status, company_id FROM Assignment WHERE assignment_id = ?",
      [id]
    );
    if (!current) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (!canTransition(current.status, nextStatus)) {
      return NextResponse.json(
        {
          error: `Cannot change status from ${current.status} to ${nextStatus}. Allowed: ${
            TRANSITIONS[current.status].join(", ") || "none"
          }`,
        },
        { status: 400 }
      );
    }

    if (nextStatus === "In Progress") {
      await execute(
        `UPDATE Assignment SET status = 'In Progress', start_time = NOW()
         WHERE assignment_id = ?`,
        [id]
      );
    } else if (nextStatus === "Completed") {
      const qty = Number(body.processed_qty);
      if (!Number.isFinite(qty) || qty <= 0) {
        return NextResponse.json(
          { error: "Processed quantity must be greater than zero" },
          { status: 400 }
        );
      }
      await execute(
        `UPDATE Assignment
         SET status = 'Completed', end_time = NOW(), processed_qty = ?
         WHERE assignment_id = ?`,
        [qty, id]
      );
    } else {
      await execute("UPDATE Assignment SET status = ? WHERE assignment_id = ?", [
        nextStatus,
        id,
      ]);
    }

    return NextResponse.json({
      ok: true,
      message: `Status updated to ${nextStatus}`,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}