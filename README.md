# ♻️ W2A Intelligence

### Smart Waste-to-Assets Management and Company Allocation System

> Every kilogram of waste is a recoverable asset.

**🔗 Live Demo:** [w2-a-intelligence-phi.vercel.app](https://w2-a-intelligence-phi.vercel.app/)

A centralised, database-driven web platform that transforms urban waste management from a reactive disposal process into a proactive, resource-oriented workflow. At its core is an **Intelligent Company Allocation Engine** that automatically assigns each collected waste batch to the most suitable recycling company — using nothing but a well-normalised relational schema and a single multi-criteria SQL query. **No machine learning involved.**

Built as a Database Management System project for the Department of Computer Science and Engineering, Comilla University.

---

## 📋 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Database Design](#-database-design)
- [The Allocation Engine](#-the-allocation-engine)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Demo Accounts](#-demo-accounts)
- [Deployment](#-deployment)

---

## 🎯 The Problem

In most cities, deciding which recycling company should process which batch of waste is still done manually — through phone calls and personal contacts. This leads to:

- **No capability-aware routing** — plastic batches sent to metal-only facilities, then discarded
- **No load balancing** — a few well-known companies get overloaded while others sit idle
- **No traceability** — once waste leaves the collection point, its fate is unknown
- **No environmental accounting** — carbon savings are never measured
- **No basis for planning** — administrators cannot answer basic operational questions

## 💡 The Solution

W2A Intelligence solves this as a **data and coordination problem** rather than an algorithmic one. The allocation decision emerges directly from a normalised database and a declarative SQL query:

- **Capability filtering** → a `JOIN`
- **Load balancing** → an aggregate (`COUNT` + `GROUP BY`)
- **Ranking** → an `ORDER BY`
- **Traceability** → a foreign key chain from `Product` back to `Zone`

---

## ✨ Key Features

| Module | Description |
|--------|-------------|
| 🗑️ **Waste Collection** | Field collectors log every pickup with zone, waste type and weight |
| 🏷️ **Waste Classification** | Master registry of waste types with carbon factors |
| 🤖 **Company Allocation** | Auto-assigns each batch to the best recycler based on capability, load and efficiency |
| ⚙️ **Process Tracking** | State-machine-enforced status flow (Pending → In Progress → Completed) |
| 📦 **Asset Generation** | Records recovered products, traceable back to source |
| 📊 **Analytics** | Zone stats, company performance, conversion ratios, carbon reduction, CSV export |

**Plus:**
- 🔐 Role-based access control (Admin, Collector, Company Manager)
- 🌍 Public transparency portal (no login required)
- 🔍 Allocation ranking view — see *why* each company was chosen
- 🌗 Dark / light mode
- 📱 Fully responsive design

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Frontend** | React 19, Tailwind CSS v4 |
| **Database** | MySQL 8 |
| **DB Driver** | mysql2 (raw parameterised SQL, no ORM) |
| **Icons** | lucide-react |
| **Notifications** | sonner |
| **Deployment** | Vercel + Aiven (managed MySQL) |

> **Why no ORM?** This is a database project. Raw SQL keeps the joins, aggregations and ranking policy explicit and inspectable — exactly what the project sets out to demonstrate.

---

## 🗄️ Database Design

The schema is normalised to **Third Normal Form (3NF)** across eight relations:

```
Zone ──┬── User ──┐
       │          │
       ├── WasteCollection ──── Assignment ──── Product
       │              │            │
WasteType ────────────┤            │
       │              │         Company
       └── CompanyWasteType ──────┘
              (M:N junction)
```

The **`CompanyWasteType`** junction table is the key to the whole system. It resolves the many-to-many relationship between companies and the waste types they can process, which is what makes capability filtering a simple `JOIN` rather than application-level logic.

---

## ⚡ The Allocation Engine

The analytical core of the project — a single query that picks the best company:

```sql
SELECT c.company_id,
       c.name,
       c.efficiency_score,
       COUNT(a.assignment_id) AS active_load
FROM Company c
JOIN CompanyWasteType cwt
     ON c.company_id = cwt.company_id
LEFT JOIN Assignment a
     ON c.company_id = a.company_id
     AND a.status IN ('Pending', 'In Progress')
WHERE cwt.waste_type_id = ?
  AND c.is_active = TRUE
GROUP BY c.company_id, c.name, c.efficiency_score
ORDER BY active_load ASC, c.efficiency_score DESC
LIMIT 1;
```

**How it works:**
- The `INNER JOIN` enforces capability — a company not certified for the waste type simply never appears
- The `LEFT JOIN` keeps idle companies in the running (they rank *first* under load balancing)
- The status filter counts only active work, not historical jobs
- The two-column `ORDER BY` balances load first, breaks ties by efficiency

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL (or XAMPP)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/shahed-hassan-fz-rabbi/W2A-Intelligence.git
cd W2A-Intelligence

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)

# 4. Set up the database
#    Run these SQL files in order via phpMyAdmin or MySQL Workbench:
#    - database/schema.sql
#    - database/seed.sql
#    - database/schema_update.sql
#    - database/schema_update_2.sql

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
