USE w2a_intelligence;

-- ---------- Zones ----------
INSERT INTO Zone (name, area_code, population) VALUES
('Kandirpar',    'CMP-01', 45000),
('Tomsom Bridge','CMP-02', 38000),
('Jhautola',     'CMP-03', 29000),
('Rajganj',      'CMP-04', 52000),
('Shasongacha',  'CMP-05', 21000),
('Cantonment',   'CMP-06', 17000);

-- ---------- Users ----------
INSERT INTO User (name, email, password_hash, role, zone_id) VALUES
('System Admin',  'admin@w2a.com',     'admin123',  'admin',     NULL),
('Rakib Hasan',   'rakib@w2a.com',     'collect123','collector', 1),
('Nusrat Jahan',  'nusrat@w2a.com',    'collect123','collector', 2),
('Tanvir Ahmed',  'tanvir@w2a.com',    'collect123','collector', 4),
('GreenCycle Mgr','green@w2a.com',     'company123','company',   NULL),
('MetalWorks Mgr','metal@w2a.com',     'company123','company',   NULL);

-- ---------- Waste Types ----------
INSERT INTO WasteType (name, category, description, carbon_factor, output_products) VALUES
('PET Bottles',      'Plastic', 'Polyethylene terephthalate drink bottles', 2.150, 'Plastic pellets, Fiber'),
('HDPE Containers',  'Plastic', 'High-density polyethylene containers',     1.800, 'Construction materials, Pipes'),
('PVC Waste',        'Plastic', 'Polyvinyl chloride scrap material',        1.400, 'Construction boards, Cables'),
('Food Waste',       'Organic', 'Household and restaurant food residue',    0.550, 'Compost, Biogas'),
('Agricultural Waste','Organic','Crop residue and plant matter',            0.480, 'Compost, Fertilizer'),
('Aluminum Scrap',   'Metal',   'Cans, foils and aluminum sheets',          8.900, 'Industrial metal, Alloys'),
('Steel Scrap',      'Metal',   'Steel rods, sheets and structural scrap',  1.900, 'Industrial metal, Rebar'),
('Copper Wire',      'Metal',   'Discarded copper wiring and cables',       3.600, 'Wire, Alloys');

-- ---------- Companies ----------
INSERT INTO Company (name, location, contact_email, contact_phone, efficiency_score, capacity_kg) VALUES
('GreenCycle Ltd',      'Comilla Industrial Area', 'info@greencycle.com', '01711000001', 92.50, 5000),
('EcoPlast Recyclers',  'Chittagong EPZ',          'info@ecoplast.com',   '01711000002', 87.00, 4200),
('AgroCompost BD',      'Comilla Sadar',           'info@agrocompost.com','01711000003', 78.25, 3000),
('MetalWorks Industries','Chittagong Port Area',   'info@metalworks.com', '01711000004', 95.00, 8000),
('UrbanWaste Solutions','Comilla Bypass',          'info@urbanwaste.com', '01711000005', 71.50, 2500),
('BioGas Energy Co',    'Daudkandi',               'info@biogasbd.com',   '01711000006', 83.75, 3500);

-- ---------- Company ↔ WasteType capabilities ----------
INSERT INTO CompanyWasteType (company_id, waste_type_id) VALUES
-- GreenCycle: all plastics
(1,1),(1,2),(1,3),
-- EcoPlast: PET + HDPE
(2,1),(2,2),
-- AgroCompost: organics
(3,4),(3,5),
-- MetalWorks: all metals
(4,6),(4,7),(4,8),
-- UrbanWaste: mixed plastic + organic
(5,1),(5,4),(5,5),
-- BioGas: organics
(6,4),(6,5);

-- ---------- Waste Collections ----------
INSERT INTO WasteCollection (zone_id, user_id, waste_type_id, quantity_kg, collection_date) VALUES
(1, 2, 1, 420.50, '2026-07-01'),
(1, 2, 4, 780.00, '2026-07-01'),
(2, 3, 1, 310.25, '2026-07-02'),
(2, 3, 6, 145.00, '2026-07-02'),
(4, 4, 2, 560.75, '2026-07-03'),
(4, 4, 5, 990.00, '2026-07-03'),
(3, 2, 7, 275.50, '2026-07-04'),
(1, 2, 8,  88.25, '2026-07-05'),
(5, 3, 4, 615.00, '2026-07-06'),
(6, 4, 3, 190.00, '2026-07-07'),
(2, 3, 5, 450.00, '2026-07-08'),
(4, 4, 6, 230.75, '2026-07-09');

-- ---------- Assignments ----------
INSERT INTO Assignment (collection_id, company_id, status, start_time, end_time, processed_qty) VALUES
(1,  1, 'Completed',   '2026-07-02 09:00:00', '2026-07-03 17:00:00', 400.00),
(2,  3, 'Completed',   '2026-07-02 08:30:00', '2026-07-04 16:00:00', 750.00),
(3,  2, 'Completed',   '2026-07-03 10:00:00', '2026-07-04 15:00:00', 300.00),
(4,  4, 'In Progress', '2026-07-03 11:00:00', NULL, NULL),
(5,  1, 'Completed',   '2026-07-04 09:00:00', '2026-07-06 18:00:00', 540.00),
(6,  6, 'In Progress', '2026-07-04 10:30:00', NULL, NULL),
(7,  4, 'Completed',   '2026-07-05 08:00:00', '2026-07-06 14:00:00', 268.00),
(8,  4, 'Pending',     NULL, NULL, NULL),
(9,  3, 'Pending',     NULL, NULL, NULL),
(10, 1, 'Pending',     NULL, NULL, NULL),
(11, 6, 'Pending',     NULL, NULL, NULL),
(12, 4, 'Pending',     NULL, NULL, NULL);

-- ---------- Products ----------
INSERT INTO Product (assignment_id, product_name, quantity_produced, unit, production_date) VALUES
(1, 'Plastic Pellets',        310.00, 'kg', '2026-07-03'),
(1, 'Polyester Fiber',         70.00, 'kg', '2026-07-03'),
(2, 'Organic Compost',        520.00, 'kg', '2026-07-04'),
(2, 'Liquid Fertilizer',      140.00, 'L',  '2026-07-04'),
(3, 'Plastic Pellets',        245.00, 'kg', '2026-07-04'),
(5, 'Construction Boards',    390.00, 'kg', '2026-07-06'),
(5, 'HDPE Pipes',             120.00, 'kg', '2026-07-06'),
(7, 'Industrial Steel Ingot', 240.00, 'kg', '2026-07-06');