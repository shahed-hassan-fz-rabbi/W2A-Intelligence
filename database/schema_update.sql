USE w2a_intelligence;

ALTER TABLE User
  ADD COLUMN company_id INT NULL AFTER zone_id,
  ADD CONSTRAINT fk_user_company FOREIGN KEY (company_id)
    REFERENCES Company(company_id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Link existing seeded managers to their companies
UPDATE User SET company_id = 1 WHERE email = 'green@w2a.com';
UPDATE User SET company_id = 4 WHERE email = 'metal@w2a.com';