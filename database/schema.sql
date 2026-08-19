-- ============================================================
-- W2A Intelligence — Database Schema
-- Normalized to Third Normal Form (3NF)
-- ============================================================

DROP DATABASE IF EXISTS w2a_intelligence;
CREATE DATABASE w2a_intelligence
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE w2a_intelligence;

-- ------------------------------------------------------------
-- 1. Zone  — city zones
-- ------------------------------------------------------------
CREATE TABLE Zone (
  zone_id     INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(80)  NOT NULL UNIQUE,
  area_code   VARCHAR(15)  NOT NULL UNIQUE,
  population  INT          NOT NULL DEFAULT 0,
  CONSTRAINT chk_zone_population CHECK (population >= 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. User  — system users with roles
-- ------------------------------------------------------------
CREATE TABLE User (
  user_id        INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(120) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  role           ENUM('admin','collector','company') NOT NULL,
  zone_id        INT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_zone FOREIGN KEY (zone_id)
    REFERENCES Zone(zone_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_user_role ON User(role);

-- ------------------------------------------------------------
-- 3. WasteType  — master classification table
-- ------------------------------------------------------------
CREATE TABLE WasteType (
  waste_type_id  INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(60) NOT NULL UNIQUE,
  category       ENUM('Plastic','Organic','Metal') NOT NULL,
  description    VARCHAR(255),
  carbon_factor  DECIMAL(6,3) NOT NULL DEFAULT 0.000,  -- kg CO2 saved per kg
  output_products VARCHAR(200),
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_carbon_factor CHECK (carbon_factor >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_wastetype_category ON WasteType(category);

-- ------------------------------------------------------------
-- 4. Company  — recycling companies
-- ------------------------------------------------------------
CREATE TABLE Company (
  company_id        INT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(120) NOT NULL UNIQUE,
  location          VARCHAR(150) NOT NULL,
  contact_email     VARCHAR(120),
  contact_phone     VARCHAR(25),
  efficiency_score  DECIMAL(5,2) NOT NULL DEFAULT 0.00,   -- 0-100
  capacity_kg       INT NOT NULL DEFAULT 1000,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_efficiency CHECK (efficiency_score BETWEEN 0 AND 100),
  CONSTRAINT chk_capacity   CHECK (capacity_kg > 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. CompanyWasteType  — junction table (M:N)
--    Resolves many-to-many between Company and WasteType
-- ------------------------------------------------------------
CREATE TABLE CompanyWasteType (
  company_id     INT NOT NULL,
  waste_type_id  INT NOT NULL,
  PRIMARY KEY (company_id, waste_type_id),
  CONSTRAINT fk_cwt_company FOREIGN KEY (company_id)
    REFERENCES Company(company_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cwt_wastetype FOREIGN KEY (waste_type_id)
    REFERENCES WasteType(waste_type_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. WasteCollection  — collection events
-- ------------------------------------------------------------
CREATE TABLE WasteCollection (
  collection_id    INT AUTO_INCREMENT PRIMARY KEY,
  zone_id          INT NOT NULL,
  user_id          INT NOT NULL,
  waste_type_id    INT NOT NULL,
  quantity_kg      DECIMAL(10,2) NOT NULL,
  collection_date  DATE NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wc_zone FOREIGN KEY (zone_id)
    REFERENCES Zone(zone_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_wc_user FOREIGN KEY (user_id)
    REFERENCES User(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_wc_wastetype FOREIGN KEY (waste_type_id)
    REFERENCES WasteType(waste_type_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_quantity CHECK (quantity_kg > 0),
  -- FR-1.5: prevent duplicate zone + date + waste type
  CONSTRAINT uq_collection UNIQUE (zone_id, collection_date, waste_type_id)
) ENGINE=InnoDB;

CREATE INDEX idx_wc_date ON WasteCollection(collection_date);
CREATE INDEX idx_wc_zone ON WasteCollection(zone_id);

-- ------------------------------------------------------------
-- 7. Assignment  — waste batch allocated to a company
-- ------------------------------------------------------------
CREATE TABLE Assignment (
  assignment_id  INT AUTO_INCREMENT PRIMARY KEY,
  collection_id  INT NOT NULL UNIQUE,
  company_id     INT NULL,
  status         ENUM('Pending','In Progress','Completed','Failed','Unassigned')
                 NOT NULL DEFAULT 'Pending',
  assigned_date  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  start_time     DATETIME NULL,
  end_time       DATETIME NULL,
  processed_qty  DECIMAL(10,2) NULL,
  is_manual      BOOLEAN NOT NULL DEFAULT FALSE,   -- FR-3.6 admin override
  CONSTRAINT fk_asg_collection FOREIGN KEY (collection_id)
    REFERENCES WasteCollection(collection_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_asg_company FOREIGN KEY (company_id)
    REFERENCES Company(company_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_processed_qty CHECK (processed_qty IS NULL OR processed_qty >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_asg_status  ON Assignment(status);
CREATE INDEX idx_asg_company ON Assignment(company_id);

-- ------------------------------------------------------------
-- 8. Product  — assets generated from recycling
-- ------------------------------------------------------------
CREATE TABLE Product (
  product_id         INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id      INT NOT NULL,
  product_name       VARCHAR(100) NOT NULL,
  quantity_produced  DECIMAL(10,2) NOT NULL,
  unit               VARCHAR(15) NOT NULL DEFAULT 'kg',
  production_date    DATE NOT NULL,
  CONSTRAINT fk_prod_assignment FOREIGN KEY (assignment_id)
    REFERENCES Assignment(assignment_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_qty_produced CHECK (quantity_produced > 0)
) ENGINE=InnoDB;


-- Location: database/citizen_schema.sql
CREATE TABLE IF NOT EXISTS CitizenReport (
  report_id INT AUTO_INCREMENT PRIMARY KEY,
  citizen_name VARCHAR(100) DEFAULT 'Anonymous',
  citizen_phone VARCHAR(25) NULL,
  image_url LONGTEXT NULL,
  ai_detected_category VARCHAR(50) NOT NULL,
  ai_confidence DECIMAL(5,2) DEFAULT 90.00,
  priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  estimated_weight_kg DECIMAL(10,2) DEFAULT 10.00,
  ai_reasoning TEXT NULL,
  zone_id INT NULL,
  latitude DECIMAL(10,8) NULL,
  longitude DECIMAL(11,8) NULL,
  status ENUM('Pending', 'Assigned', 'Resolved') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_report_zone FOREIGN KEY (zone_id) 
    REFERENCES Zone(zone_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Add base purchasing market price per kg in BDT to WasteType
ALTER TABLE WasteType ADD COLUMN IF NOT EXISTS price_per_kg DECIMAL(10,2) DEFAULT 35.00;

-- Set realistic base market buying rates per kg in Bangladesh (BDT)
UPDATE WasteType SET price_per_kg = 45.00 WHERE category = 'Plastic';
UPDATE WasteType SET price_per_kg = 15.00 WHERE category = 'Organic';
UPDATE WasteType SET price_per_kg = 85.00 WHERE category = 'Metal';
UPDATE WasteType SET price_per_kg = 25.00 WHERE category = 'Paper';
UPDATE WasteType SET price_per_kg = 18.00 WHERE category = 'Glass';

-- Create B2B Transactions Ledger for Waste Procurement
CREATE TABLE IF NOT EXISTS Transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  company_id INT NOT NULL,
  waste_type_id INT NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  rate_per_kg DECIMAL(10,2) NOT NULL,
  gross_amount DECIMAL(12,2) NOT NULL,
  platform_fee_percent DECIMAL(5,2) DEFAULT 7.50,
  platform_commission DECIMAL(12,2) NOT NULL,
  net_payout DECIMAL(12,2) NOT NULL,
  payment_status ENUM('Pending', 'Completed', 'Settled') DEFAULT 'Completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tx_assignment FOREIGN KEY (assignment_id) REFERENCES Assignment(assignment_id) ON DELETE CASCADE,
  CONSTRAINT fk_tx_company FOREIGN KEY (company_id) REFERENCES Company(company_id) ON DELETE CASCADE,
  CONSTRAINT fk_tx_waste FOREIGN KEY (waste_type_id) REFERENCES WasteType(waste_type_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed initial transactions for completed assignments
INSERT IGNORE INTO Transactions 
  (assignment_id, company_id, waste_type_id, quantity_kg, rate_per_kg, gross_amount, platform_fee_percent, platform_commission, net_payout, payment_status)
SELECT 
  a.assignment_id,
  a.company_id,
  wc.waste_type_id,
  COALESCE(a.processed_qty, wc.quantity_kg) AS quantity_kg,
  COALESCE(wt.price_per_kg, 40.00) AS rate_per_kg,
  (COALESCE(a.processed_qty, wc.quantity_kg) * COALESCE(wt.price_per_kg, 40.00)) AS gross_amount,
  7.50 AS platform_fee_percent,
  ROUND((COALESCE(a.processed_qty, wc.quantity_kg) * COALESCE(wt.price_per_kg, 40.00) * 0.075), 2) AS platform_commission,
  ROUND((COALESCE(a.processed_qty, wc.quantity_kg) * COALESCE(wt.price_per_kg, 40.00) * 0.925), 2) AS net_payout,
  'Settled' AS payment_status
FROM Assignment a
JOIN WasteCollection wc ON a.collection_id = wc.collection_id
JOIN WasteType wt ON wc.waste_type_id = wt.waste_type_id
WHERE a.status = 'Completed' AND a.company_id IS NOT NULL;

CREATE INDEX idx_prod_date ON Product(production_date);