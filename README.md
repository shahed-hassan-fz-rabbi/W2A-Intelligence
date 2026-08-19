# ♻️ W2A Intelligence

### Smart Waste-to-Assets Management & Circular Allocation Operating System

> **Transforming municipal waste from an urban disposal liability into verifiable, monetized circular assets.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2_(App_Router)-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/Database-MySQL_8.0_(3NF)-00758f?style=flat&logo=mysql)](https://www.mysql.com/)
[![Gemini AI](https://img.shields.io/badge/AI_Engine-Gemini_Flash_Vision-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![Deployment](https://img.shields.io/badge/Deployed-Vercel-black?style=flat&logo=vercel)](https://w2-a-intelligence-phi.vercel.app/)

**🔗 Live Production URL:** [https://w2-a-intelligence-phi.vercel.app](https://w2-a-intelligence-phi.vercel.app/)

---

## 📌 Executive Summary

**W2A Intelligence** is an enterprise-grade, database-driven circular economy platform built to bridge the systemic gap between municipal waste collection and industrial recycling networks.

The platform eliminates manual coordination by combining:
1. **Multimodal AI Incident Triage (Google Gemini Vision API)** for citizen reporting.
2. **Automated Multi-Criteria Allocation Engine (Declarative SQL in 3NF Schema)** for capacity-aware plant dispatching.
3. **Live Municipal IoT & GPS Map Telemetry** for real-time asset tracking.
4. **Digital Material Passports (DMP)** providing end-to-end traceability from street smart bins to certified recycled products.
5. **Verified Carbon Mitigation Accounting (CO₂e)** following mass-balance factor multipliers.

---

## 🎯 The Urban Waste Dilemma & Solution

**Traditional Linear Flow (Wasteful):**
```
[Street Waste] → [Manual Phone Calls] → [Landfill / Idle Facilities] 
(No Traceability, High Operational Cost, Zero Circular Value)
```

**W2A Circular Closed-Loop (Smart & Optimized):**
```
[Citizen AI Report / IoT Bin] → [SQL Auto-Allocation] → [Certified Recycler] 
→ [Minted DMP Asset] → [B2B Circular Market]
(Full Traceability, Verified ESG Metrics, Monetized Circular Assets)
```

### Problem-Solution Mapping

| Operational Challenge | W2A Intelligence Solution |
| :--- | :--- |
| **Capability Mismatches** | Raw plastic batches routed to metal facilities are discarded. W2A uses a relational M:N capability junction (`CompanyWasteType`) to guarantee 100% matched batch allocations. |
| **Unbalanced Plant Loads** | Select plants get overwhelmed while certified local recyclers sit idle. W2A balances workloads via aggregate SQL query ranking (`COUNT(active_load) ASC`). |
| **Zero Traceability** | Once waste leaves city bins, its chain-of-custody is lost. W2A mints **Digital Material Passports (DMP)** with verifiable foreign key lineages back to collection zones. |
| **Unmeasured Climate Impact** | Municipalities fail to report ESG figures. W2A automatically computes verified avoided CO₂ emissions and tree equivalents per processed material batch. |

---

## ✨ Core System Modules

### 1. 🤖 Multimodal AI Citizen Triage (`/citizen`)
Citizens capture or upload street waste photos with GPS geotagging. The integrated **Google Gemini Vision API** inspects images in real time to extract:
- Material Classification (e.g., *HDPE Plastic, Organic Waste, Metal Scrap*)
- Overflow Hazard & Priority Rating (*Low, Medium, Critical*)
- Automated municipal action recommendations

### 2. ⚡ Declarative SQL Allocation Engine
Computes batch assignments dynamically without heavy heuristics. Balances plant capacity, live operational queues, and historical ESG efficiency ratings in a single relational query.

### 3. 🗺️ Smart City Telemetry & Interactive Map
- Live GPS inspection of smart collection hubs across municipal sectors
- Dynamic fleet rerouting simulator with visual proof of collector truck dispatch
- Real-time operational dashboards and performance analytics

### 4. 📦 Digital Material Passports (DMP) (`/products`)
High-value intermediate and manufactured outputs (e.g., *Recycled Plastic Pellets, Organic Bio-Fertilizer, Aluminum Billets*) are issued verifiable digital passports displaying:
- Batch genesis and processing timestamps
- Compliance certifications and material specifications
- Verified avoided carbon offsets and ESG metrics

### 5. 🧮 Interactive Circular ROI & Carbon Simulator
Client-side dynamic calculator simulating municipal waste inputs against:
- Market buying rates for recycled materials
- CO₂e avoided metrics and carbon savings
- Asset yields and circular economy value projections

### 6. 🏆 Top Green Recyclers Leaderboard (`/companies`)
Transparent ESG partner ranking featuring Gold/Silver/Bronze tiers based on:
- Verified throughput and processing volumes
- Efficiency percentages and waste recovery rates
- Environmental impact contributions and certifications

---

## 🗄️ Relational Database Schema (3NF Normalized)

The data model is engineered strictly in **Third Normal Form (3NF)** across eight core relational tables to maintain ACID consistency, zero transitive redundancy, and referential integrity.

### Entity Relationship Diagram

```
                    ┌────────────────┐
                    │      Zone      │
                    │   (Sector/Area)│
                    └────────┬───────┘
                             │ 1:N
                             │
                    ┌────────┴───────┐
                    │                │
                    ▼                ▼
            ┌──────────────┐  ┌──────────────────┐
            │WasteCollect. │  │  CitizenReport   │
            │  (Smart Bin) │  │  (Photo Uploads) │
            └──────┬───────┘  └──────────────────┘
                   │ 1:N
                   │
         ┌─────────┼─────────┐
         │                   │
         ▼                   ▼
    ┌──────────┐      ┌──────────────┐
    │WasteType │      │  Assignment  │
    │ (Material)     │ (Batch Route) │
    └────┬─────┘     └──────┬───────┘
         │ 1:N              │ N:1
         │                  │
         │          ┌───────┴────────┐
         │          │                │
         ▼          ▼                ▼
    ┌──────────────────────┐   ┌──────────────┐
    │ CompanyWasteType     │   │   Company    │
    │ (Capability Matrix)  │───│ (Recycler)   │
    └──────────────────────┘   └──────┬───────┘
                                      │ 1:N
                                      │
                                      ▼
                              ┌──────────────────┐
                              │   Product (DMP)  │
                              │ (Minted Assets)  │
                              └──────────────────┘
```

### Core Tables

| Table | Purpose | Key Fields |
| --- | --- | --- |
| `Zone` | Municipal sector/area division | `zone_id`, `zone_name`, `city`, `status` |
| `WasteType` | Material classification taxonomy | `waste_type_id`, `material_name`, `density_kg_m3` |
| `WasteCollection` | Smart bin deployment registry | `collection_id`, `zone_id`, `capacity_kg`, `location_gps` |
| `CitizenReport` | Public AI triage submissions | `report_id`, `collection_id`, `gemini_classification`, `priority` |
| `Company` | Recycling partners & processors | `company_id`, `name`, `capacity_kg`, `efficiency_score`, `is_active` |
| `CompanyWasteType` | Capability matrix (M:N junction) | `company_id`, `waste_type_id` |
| `Assignment` | Batch allocation ledger | `assignment_id`, `company_id`, `waste_type_id`, `status`, `assigned_date` |
| `Product` | Digital Material Passports | `product_id`, `company_id`, `material_output`, `co2_avoided_kg`, `certification` |

---

## ⚡ The Allocation Engine Query

At the core of the system is an optimized, parameter-safe declarative query executed by the database engine:

```sql
SELECT c.company_id,
       c.name,
       c.efficiency_score,
       c.capacity_kg,
       COUNT(a.assignment_id) AS active_load
FROM company c
JOIN companywastetype cwt 
     ON c.company_id = cwt.company_id
LEFT JOIN assignment a 
     ON c.company_id = a.company_id
     AND a.status IN ('Pending', 'In Progress')
WHERE cwt.waste_type_id = ?
  AND c.is_active = TRUE
GROUP BY c.company_id, c.name, c.efficiency_score, c.capacity_kg
ORDER BY active_load ASC, c.efficiency_score DESC
LIMIT 1;
```

**Query Logic:**
- Filters companies capable of processing the waste type
- Counts active assignments per company
- Prioritizes companies with lowest current load
- Uses efficiency score as secondary sort (higher is better)
- Returns the single best-fit recipient company

---

## 🛠️ Technical Architecture

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend Framework** | **Next.js 16 (App Router)** | Server & Client Components, Streaming SSR, API Routes |
| **Styling & UI** | **Tailwind CSS v4** | Clean, accessible, responsive SaaS interfaces |
| **Database** | **MySQL 8.0** | 3NF relational data store with foreign key cascades |
| **Database Driver** | **mysql2 / promise** | Raw parameterized SQL execution (No ORM overhead) |
| **AI Integration** | **Google Gemini Flash API** | Multimodal image triage & conversational analytics |
| **Charts & Metrics** | **Recharts** | Interactive collection trends & material distribution |
| **Icons & Alerts** | **lucide-react** & **sonner** | Standardized iconography and toast notifications |
| **Maps & GPS** | **Leaflet.js** | Interactive telemetry mapping and route visualization |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ 
- MySQL 8.0+
- Google Cloud Project with Gemini API enabled
- npm or yarn package manager

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/shahed-hassan-fz-rabbi/W2A-Intelligence.git
cd W2A-Intelligence
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Credentials (Local or Cloud MySQL)
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=w2a_intelligence
DB_PORT=3306

# Authentication Cookie Secret
SESSION_SECRET=your_super_secret_session_key_min_32_characters

# Google Gemini AI Key
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Database Initialization

Import the schema files into your MySQL server (via phpMyAdmin or MySQL CLI):

```bash
mysql -h 127.0.0.1 -u root -p w2a_intelligence < database/schema.sql
mysql -h 127.0.0.1 -u root -p w2a_intelligence < database/seed.sql
```

Or via phpMyAdmin:
1. Create database: `w2a_intelligence`
2. Import `database/schema.sql`
3. Import `database/seed.sql`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 🔑 Demo Credentials (1-Click Login)

| Portal / Role | Email | Password | Primary Permissions |
| --- | --- | --- | --- |
| 🛡️ **City Administrator** | `admin@w2a.com` | `Admin@123` | Full dashboard, fleet telemetry, auto-allocation, user management |
| 🚛 **Field Collector** | `rakib@w2a.com` | `collect123` | Log zone collections, weigh pickups, route review |
| 🏢 **Recycling Partner** | `green@w2a.com` | `company123` | Accept assigned batches, update process states, mint DMP assets |
| 🌍 **Public Citizen** | *No login required* | *Public Portal* | Transparency metrics, live video overview, AI waste triage |

---

## 📊 Key Features at a Glance

✅ **Automated Batch Allocation** — SQL-driven, capacity-aware routing without manual intervention  
✅ **Multimodal AI Triage** — Gemini Vision API classifies waste in real-time from citizen photos  
✅ **Live GPS Telemetry** — Track collection vehicles and smart bins across city zones  
✅ **Digital Material Passports** — Blockchain-ready audit trail for every recycled product  
✅ **Carbon Accounting** — Verified ESG metrics and CO₂ offset computations  
✅ **B2B Marketplace Ready** — Structured product data for circular supply chain integration  
✅ **3NF Database Design** — Enterprise-grade data integrity with zero redundancy  
✅ **Public Transparency Portal** — Citizens track environmental impact in real-time  

---

## 📁 Project Structure

```
W2A-Intelligence/
├── app/                          # Next.js 16 App Router
│   ├── (auth)/                  # Authentication routes
│   │   └── login/page.js
│   ├── admin/                   # City Admin Dashboard
│   ├── collector/               # Field Worker Portal
│   ├── company/                 # Recycler Partner Dashboard
│   ├── citizen/                 # Public Citizen Triage Portal
│   ├── products/                # DMP Marketplace
│   ├── companies/               # Green Recycler Leaderboard
│   └── api/                     # RESTful API Routes
├── lib/
│   ├── db.js                    # MySQL Connection Pool
│   ├── auth.js                  # Session Management
│   └── gemini.js                # Gemini AI Integration
├── components/
│   ├── DashboardLayout.jsx
│   ├── MapVisualization.jsx
│   └── AllocationTable.jsx
├── database/
│   ├── schema.sql               # Database DDL
│   └── seed.sql                 # Sample Data
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── package.json
└── README.md
```

---

## 🔐 Security Considerations

- **SQL Injection Prevention:** Parameterized queries via `mysql2/promise`
- **Session Security:** HttpOnly cookie-based sessions with rotating secret
- **CORS Protection:** Strict origin validation on API routes
- **Rate Limiting:** API endpoints throttled to prevent abuse
- **Data Privacy:** Multi-tenant zone isolation on all queries
- **AI Safety:** Gemini Vision API calls validated and rate-limited

---

## 👥 Academic & Project Credits

- **Institution:** Department of Computer Science and Engineering, Comilla University
- **Project Name:** W2A Intelligence: A Smart Waste-to-Assets Management System
- **Supervisor:** Associate Professor Partha Chakraborty
- **Lead Developer:** Md Rabbi Miah

---

## 📄 License

This project is open-sourced under the **MIT License**. See LICENSE file for details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support & Contact

For issues, feature requests, or inquiries:
- **Email:** shahed.hassan.fr@gmail.com
- **GitHub Issues:** [W2A-Intelligence Issues](https://github.com/shahed-hassan-fz-rabbi/W2A-Intelligence/issues)

---

**Last Updated:** August 2026  
**Status:** 🟢 Production (Vercel Deployment Active)