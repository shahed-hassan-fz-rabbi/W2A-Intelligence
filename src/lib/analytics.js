import { query } from "./db";

function dateClause(from, to, col = "wc.collection_date") {
  const parts = [];
  const params = [];
  if (from) { parts.push(`${col} >= ?`); params.push(from); }
  if (to)   { parts.push(`${col} <= ?`); params.push(to); }
  return { sql: parts.length ? " AND " + parts.join(" AND ") : "", params };
}

/** FR-6.1 — headline KPIs */
export async function getOverview(from, to) {
  const d = dateClause(from, to);
  const [row] = await query(
    `SELECT
       COUNT(DISTINCT wc.collection_id) AS total_collections,
       COALESCE(SUM(wc.quantity_kg), 0) AS total_collected_kg,
       COALESCE(SUM(CASE WHEN a.status = 'Completed' THEN a.processed_qty END), 0)
         AS total_processed_kg,
       SUM(a.status = 'Completed')  AS completed_jobs,
       SUM(a.status = 'Unassigned') AS unassigned_jobs,
       ROUND(SUM(a.company_id IS NOT NULL) / NULLIF(COUNT(a.assignment_id),0) * 100, 1)
         AS assignment_rate,
       COALESCE(ROUND(SUM(CASE WHEN a.status = 'Completed'
              THEN a.processed_qty * wt.carbon_factor END), 2), 0)
         AS carbon_saved_kg
     FROM WasteCollection wc
     JOIN WasteType wt      ON wc.waste_type_id = wt.waste_type_id
     LEFT JOIN Assignment a ON wc.collection_id = a.collection_id
     WHERE 1 = 1 ${d.sql}`,
    d.params
  );
  return row;
}

/** FR-6.2 — zone heatmap */
export async function getZoneStats(from, to) {
  const d = dateClause(from, to);
  return query(
    `SELECT z.zone_id, z.name AS zone_name, z.area_code, z.population,
            COUNT(wc.collection_id)          AS collection_count,
            COALESCE(SUM(wc.quantity_kg), 0) AS total_waste_kg,
            COALESCE(ROUND(SUM(wc.quantity_kg) / NULLIF(z.population,0) * 1000, 2), 0)
              AS kg_per_1000
     FROM Zone z
     LEFT JOIN WasteCollection wc ON z.zone_id = wc.zone_id ${d.sql.replace(" AND ", " AND ")}
     GROUP BY z.zone_id, z.name, z.area_code, z.population
     ORDER BY total_waste_kg DESC`,
    d.params
  );
}

/** FR-6.3 — company performance */
export async function getCompanyStats() {
  return query(
    `SELECT c.company_id, c.name, c.efficiency_score,
            COUNT(a.assignment_id) AS total_assignments,
            COALESCE(SUM(a.status = 'Completed'), 0)   AS completed_jobs,
            COALESCE(SUM(a.status = 'In Progress'), 0) AS active_jobs,
            COALESCE(SUM(a.processed_qty), 0)          AS processed_kg,
            COALESCE(ROUND(SUM(a.status = 'Completed')
              / NULLIF(COUNT(a.assignment_id),0) * 100, 1), 0) AS completion_rate
     FROM Company c
     LEFT JOIN Assignment a ON c.company_id = a.company_id
     WHERE c.is_active = TRUE
     GROUP BY c.company_id, c.name, c.efficiency_score
     ORDER BY processed_kg DESC`
  );
}

/** FR-6.4 — category breakdown with carbon */
export async function getCategoryStats(from, to) {
  const d = dateClause(from, to);
  return query(
    `SELECT wt.category,
            COUNT(DISTINCT wc.collection_id)  AS collections,
            COALESCE(SUM(wc.quantity_kg), 0)  AS collected_kg,
            COALESCE(SUM(CASE WHEN a.status='Completed' THEN a.processed_qty END), 0)
              AS processed_kg,
            COALESCE(ROUND(SUM(CASE WHEN a.status='Completed'
                   THEN a.processed_qty * wt.carbon_factor END), 2), 0)
              AS carbon_saved_kg
     FROM WasteType wt
     JOIN WasteCollection wc ON wt.waste_type_id = wc.waste_type_id
     LEFT JOIN Assignment a  ON wc.collection_id = a.collection_id
     WHERE 1 = 1 ${d.sql}
     GROUP BY wt.category
     ORDER BY collected_kg DESC`,
    d.params
  );
}

/** Q6 — UNION activity feed */
export async function getActivityFeed(limit = 15) {
  return query(
    `SELECT 'Collection' AS event_type,
            wc.collection_date AS event_date,
            CONCAT(wt.name, ' collected from ', z.name) AS description,
            wc.quantity_kg AS quantity
     FROM WasteCollection wc
     JOIN Zone z       ON wc.zone_id = z.zone_id
     JOIN WasteType wt ON wc.waste_type_id = wt.waste_type_id

     UNION

     SELECT 'Assignment', DATE(a.assigned_date),
            CONCAT('Batch #', a.assignment_id, ' assigned to ',
                   COALESCE(c.name, 'NO COMPANY')),
            wc.quantity_kg
     FROM Assignment a
     JOIN WasteCollection wc ON a.collection_id = wc.collection_id
     LEFT JOIN Company c     ON a.company_id = c.company_id

     UNION

     SELECT 'Production', p.production_date,
            CONCAT(p.product_name, ' produced by ', COALESCE(c.name, 'unknown')),
            p.quantity_produced
     FROM Product p
     JOIN Assignment a   ON p.assignment_id = a.assignment_id
     LEFT JOIN Company c ON a.company_id = c.company_id

     ORDER BY event_date DESC, event_type
     LIMIT ${Number(limit)}`
  );
}

/** Q7 — UNION ALL alerts */
export async function getAlerts() {
  return query(
    `SELECT 'Unassigned Batch' AS alert_type,
            CONCAT('Collection #', wc.collection_id, ' (', wt.name,
                   ') could not be allocated') AS message
     FROM Assignment a
     JOIN WasteCollection wc ON a.collection_id = wc.collection_id
     JOIN WasteType wt       ON wc.waste_type_id = wt.waste_type_id
     WHERE a.status = 'Unassigned'

     UNION ALL

     SELECT 'Overloaded Company',
            CONCAT(c.name, ' has ', COUNT(a.assignment_id), ' active batches')
     FROM Company c
     JOIN Assignment a ON c.company_id = a.company_id
     WHERE a.status IN ('Pending','In Progress')
     GROUP BY c.company_id, c.name
     HAVING COUNT(a.assignment_id) >= 3`
  );
}

/** Daily trend for the line chart */
export async function getDailyTrend(days = 14) {
  return query(
    `SELECT DATE_FORMAT(wc.collection_date, '%Y-%m-%d') AS day,
            SUM(wc.quantity_kg) AS collected_kg
     FROM WasteCollection wc
     WHERE wc.collection_date >= DATE_SUB(CURDATE(), INTERVAL ${Number(days)} DAY)
     GROUP BY wc.collection_date
     ORDER BY wc.collection_date ASC`
  );
}