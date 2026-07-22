USE w2a_intelligence;

ALTER TABLE Zone
  ADD COLUMN city     VARCHAR(80)  NOT NULL DEFAULT 'Comilla' AFTER name,
  ADD COLUMN district VARCHAR(80)  NULL     AFTER city,
  ADD COLUMN country  VARCHAR(80)  NOT NULL DEFAULT 'Bangladesh' AFTER district,
  ADD COLUMN latitude  DECIMAL(10,7) NULL AFTER population,
  ADD COLUMN longitude DECIMAL(10,7) NULL AFTER latitude;

-- Area code only needs to be unique inside a city, not globally
ALTER TABLE Zone DROP INDEX area_code;
ALTER TABLE Zone ADD CONSTRAINT uq_zone_area UNIQUE (city, area_code);
ALTER TABLE Zone DROP INDEX name;
ALTER TABLE Zone ADD CONSTRAINT uq_zone_name UNIQUE (city, name);

CREATE INDEX idx_zone_city ON Zone(city);

-- Existing rows
UPDATE Zone SET city = 'Comilla', district = 'Cumilla', country = 'Bangladesh';

-- A few extra cities so the demo shows the system is location-agnostic
INSERT INTO Zone (name, city, district, country, area_code, population) VALUES
('Gulshan',      'Dhaka',      'Dhaka',      'Bangladesh', 'DHK-01', 82000),
('Dhanmondi',    'Dhaka',      'Dhaka',      'Bangladesh', 'DHK-02', 96000),
('Mirpur 10',    'Dhaka',      'Dhaka',      'Bangladesh', 'DHK-03', 145000),
('Agrabad',      'Chattogram', 'Chattogram', 'Bangladesh', 'CTG-01', 71000),
('Panchlaish',   'Chattogram', 'Chattogram', 'Bangladesh', 'CTG-02', 63000),
('Zindabazar',   'Sylhet',     'Sylhet',     'Bangladesh', 'SYL-01', 48000);