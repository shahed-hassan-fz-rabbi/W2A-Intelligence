USE w2a_intelligence;

-- ============================================================
-- Q1. ALLOCATION ENGINE — multi-criteria company ranking
--     JOIN + LEFT JOIN + GROUP BY + ORDER BY
-- ============================================================
SELECT c.company_id, c.name, c.efficiency_score,
       COUNT(a.assignment_id) AS active_load
FROM Company c
JOIN CompanyWasteType cwt ON c.company_id = cwt.company_id
LEFT JOIN Assignment a    ON c.company_id = a.company_id
     AND a.status IN ('Pending','In Progress')
WHERE cwt.waste_type_id = 1 AND c.is_active = TRUE
GROUP BY c.company_id, c.name, c.efficiency_score
ORDER BY active_load ASC, c.efficiency_score DESC;

-- ============================================================
-- Q2. ZONE WASTE HEATMAP (FR-6.2)
-- ============================================================
SELECT z.zone_id, z.name AS zone_name, z.area_code, z.population,
       COUNT(wc.collection_id)          AS collection_count,
       COALESCE(SUM(wc.quantity_kg), 0) AS total_waste_kg,
       COALESCE(ROUND(SUM(wc.quantity_kg) / NULLIF(z.population,0) * 1000, 3), 0)
         AS kg_per_1000_people
FROM Zone z
LEFT JOIN WasteCollection wc ON z.zone_id = wc.zone_id
GROUP BY z.zone_id, z.name, z.area_code, z.population
ORDER BY total_waste_kg DESC;

-- ============================================================
-- Q3. COMPANY PERFORMANCE REPORT (FR-6.3)
-- ============================================================
SELECT c.company_id, c.name, c.efficiency_score, c.capacity_kg,
       COUNT(a.assignment_id) AS total_assignments,
       SUM(a.status = 'Completed')   AS completed_jobs,
       SUM(a.status = 'In Progress') AS in_progress_jobs,
       SUM(a.status = 'Pending')     AS pending_jobs,
       COALESCE(SUM(a.processed_qty), 0) AS total_processed_kg,
       ROUND(SUM(a.status = 'Completed') / NULLIF(COUNT(a.assignment_id),0) * 100, 2)
         AS completion_rate
FROM Company c
LEFT JOIN Assignment a ON c.company_id = a.company_id
GROUP BY c.company_id, c.name, c.efficiency_score, c.capacity_kg
ORDER BY total_processed_kg DESC;

-- ============================================================
-- Q4. WASTE CATEGORY DISTRIBUTION + CARBON REDUCTION (FR-6.4)
--     carbon_saved = processed_qty * carbon_factor
-- ============================================================
SELECT wt.category,
       COUNT(DISTINCT wc.collection_id)  AS collections,
       SUM(wc.quantity_kg)               AS collected_kg,
       COALESCE(SUM(a.processed_qty), 0) AS processed_kg,
       COALESCE(ROUND(SUM(a.processed_qty * wt.carbon_factor), 2), 0)
         AS carbon_saved_kg
FROM WasteType wt
JOIN WasteCollection wc ON wt.waste_type_id = wc.waste_type_id
LEFT JOIN Assignment a  ON wc.collection_id = a.collection_id
     AND a.status = 'Completed'
GROUP BY wt.category
ORDER BY carbon_saved_kg DESC;

-- ============================================================
-- Q5. FULL LIFECYCLE TRACE (FR-5.4)
--     Zone → Collection → Assignment → Company → Product
-- ============================================================
SELECT z.name AS zone, wt.name AS waste_type, wc.quantity_kg AS collected,
       c.name AS company, a.status, a.processed_qty,
       p.product_name, p.quantity_produced, p.unit,
       ROUND(p.quantity_produced / wc.quantity_kg * 100, 2) AS conversion_pct
FROM WasteCollection wc
JOIN Zone z             ON wc.zone_id = z.zone_id
JOIN WasteType wt       ON wc.waste_type_id = wt.waste_type_id
LEFT JOIN Assignment a  ON wc.collection_id = a.collection_id
LEFT JOIN Company c     ON a.company_id = c.company_id
LEFT JOIN Product p     ON a.assignment_id = p.assignment_id
ORDER BY wc.collection_date DESC;

-- ============================================================
-- Q6. UNION — unified city activity feed
--     Combines three different event tables into one timeline
-- ============================================================
SELECT 'Collection' AS event_type,
       wc.collection_date AS event_date,
       CONCAT(wt.name, ' collected from ', z.name) AS description,
       wc.quantity_kg AS quantity
FROM WasteCollection wc
JOIN Zone z       ON wc.zone_id = z.zone_id
JOIN WasteType wt ON wc.waste_type_id = wt.waste_type_id

UNION

SELECT 'Assignment' AS event_type,
       DATE(a.assigned_date) AS event_date,
       CONCAT('Batch #', a.assignment_id, ' assigned to ',
              COALESCE(c.name, 'NO COMPANY')) AS description,
       wc.quantity_kg AS quantity
FROM Assignment a
JOIN WasteCollection wc ON a.collection_id = wc.collection_id
LEFT JOIN Company c     ON a.company_id = c.company_id

UNION

SELECT 'Production' AS event_type,
       p.production_date AS event_date,
       CONCAT(p.product_name, ' produced by ',
              COALESCE(c.name, 'unknown')) AS description,
       p.quantity_produced AS quantity
FROM Product p
JOIN Assignment a   ON p.assignment_id = a.assignment_id
LEFT JOIN Company c ON a.company_id = c.company_id

ORDER BY event_date DESC, event_type;

-- ============================================================
-- Q7. UNION ALL — unassigned + overloaded alerts
-- ============================================================
SELECT 'Unassigned Batch' AS alert_type,
       CONCAT('Collection #', wc.collection_id, ' (', wt.name, ') has no company')
         AS message
FROM Assignment a
JOIN WasteCollection wc ON a.collection_id = wc.collection_id
JOIN WasteType wt       ON wc.waste_type_id = wt.waste_type_id
WHERE a.status = 'Unassigned'

UNION ALL

SELECT 'Overloaded Company' AS alert_type,
       CONCAT(c.name, ' has ', COUNT(a.assignment_id), ' active batches')
         AS message
FROM Company c
JOIN Assignment a ON c.company_id = a.company_id
WHERE a.status IN ('Pending','In Progress')
GROUP BY c.company_id, c.name
HAVING COUNT(a.assignment_id) >= 3;