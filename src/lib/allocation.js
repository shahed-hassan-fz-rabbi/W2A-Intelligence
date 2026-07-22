import { query, execute } from "./db";

/**
 * Intelligent Company Allocation Engine
 *
 * FR-3.2 : find all companies capable of handling the given waste type
 * FR-3.3 : rank by (a) active load ASC, (b) efficiency score DESC
 *
 * The ranking query is the heart of the system. It uses:
 *   - JOIN            → Company ⋈ CompanyWasteType  (capability filter)
 *   - LEFT JOIN       → keeps companies with ZERO pending jobs in the result
 *   - GROUP BY        → collapse assignment rows into a per-company load count
 *   - ORDER BY        → multi-criteria ranking
 */
const RANKING_SQL = `
  SELECT c.company_id,
         c.name,
         c.efficiency_score,
         c.capacity_kg,
         COUNT(a.assignment_id) AS active_load
  FROM Company c
  JOIN CompanyWasteType cwt
       ON c.company_id = cwt.company_id
  LEFT JOIN Assignment a
       ON c.company_id = a.company_id
       AND a.status IN ('Pending', 'In Progress')
  WHERE cwt.waste_type_id = ?
    AND c.is_active = TRUE
  GROUP BY c.company_id, c.name, c.efficiency_score, c.capacity_kg
  ORDER BY active_load ASC, c.efficiency_score DESC
`;

/** Returns the full ranked list — used by the "why this company?" panel. */
export async function rankCompanies(wasteTypeId) {
  return query(RANKING_SQL, [wasteTypeId]);
}

/** Returns only the winner, or null if no company can handle this waste type. */
export async function findBestCompany(wasteTypeId) {
  const ranked = await query(RANKING_SQL + " LIMIT 1", [wasteTypeId]);
  return ranked.length > 0 ? ranked[0] : null;
}

/**
 * FR-3.1 : auto-allocate a newly created collection
 * FR-3.4 : create Assignment with status 'Pending'
 * FR-3.5 : flag as 'Unassigned' when no eligible company exists
 */
export async function allocateCollection(collectionId, wasteTypeId) {
  const existing = await query(
    "SELECT assignment_id FROM Assignment WHERE collection_id = ?",
    [collectionId]
  );
  if (existing.length > 0) {
    return { allocated: false, reason: "Already assigned" };
  }

  const best = await findBestCompany(wasteTypeId);

  if (!best) {
    await execute(
      `INSERT INTO Assignment (collection_id, company_id, status)
       VALUES (?, NULL, 'Unassigned')`,
      [collectionId]
    );
    return {
      allocated: false,
      reason: "No company registered for this waste type",
      status: "Unassigned",
    };
  }

  const result = await execute(
    `INSERT INTO Assignment (collection_id, company_id, status)
     VALUES (?, ?, 'Pending')`,
    [collectionId, best.company_id]
  );

  return {
    allocated: true,
    assignment_id: result.insertId,
    company_id: best.company_id,
    company_name: best.name,
    active_load: best.active_load,
    efficiency_score: best.efficiency_score,
    status: "Pending",
  };
}

/** FR-3.6 : administrator manual override */
export async function reassign(assignmentId, companyId) {
  const [asg] = await query(
    `SELECT a.assignment_id, a.status, wc.waste_type_id
     FROM Assignment a
     JOIN WasteCollection wc ON a.collection_id = wc.collection_id
     WHERE a.assignment_id = ?`,
    [assignmentId]
  );
  if (!asg) throw new Error("Assignment not found");
  if (asg.status === "Completed") {
    throw new Error("A completed assignment cannot be reassigned");
  }

  const capable = await query(
    `SELECT 1 FROM CompanyWasteType
     WHERE company_id = ? AND waste_type_id = ?`,
    [companyId, asg.waste_type_id]
  );
  if (capable.length === 0) {
    throw new Error("Selected company cannot process this waste type");
  }

  await execute(
    `UPDATE Assignment
     SET company_id = ?, status = 'Pending', is_manual = TRUE,
         start_time = NULL, end_time = NULL, processed_qty = NULL
     WHERE assignment_id = ?`,
    [companyId, assignmentId]
  );

  return { ok: true };
}

/** FR-4.2 : allowed status transitions */
export const TRANSITIONS = {
  Unassigned: ["Pending"],
  Pending: ["In Progress", "Failed"],
  "In Progress": ["Completed", "Failed"],
  Completed: [],
  Failed: ["Pending"],
};

export function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}