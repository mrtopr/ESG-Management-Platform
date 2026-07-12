# EcoSphere: Enterprise ESG Management Platform

Welcome to **EcoSphere**, a comprehensive, real-time ESG (Environmental, Social, and Governance) Management Platform. Designed for modern corporate structures, EcoSphere integrates sustainability metrics directly into operational workflows, gamifies employee environmental participation, tracks compliance red flags, and compiles auditable disclosure reports.

This document serves as a detailed guide to the architecture, core modules, business rules, and technical implementation of the platform for submission.

---

## 🚀 Key Modules & Architecture

EcoSphere is built on an enterprise-grade stack configured for speed, reliability, and security:
- **Backend Service:** Node.js with **Express** (ESM syntax) and **Prisma ORM (v7)**.
- **Database Engine:** PostgreSQL hosted on **Neon Serverless Cloud** utilizing pooled connection adapters.
- **Frontend Dashboard:** **React** powered by **Vite** and styled with a customized, premium dark-mode theme utilizing **Tailwind CSS**.
- **Data Visualizations:** Dynamic charts rendered with **Recharts**.
- **State Management & Caching:** **TanStack React Query** for robust cache invalidation and server synchronization.

```mermaid
graph TD
    A[ERP & Operational Inputs] --> B(Carbon Transactions Ledger)
    C[Volunteering & CSR Logs] --> D(Employee Participation)
    E[Inspections & Audits] --> F(Compliance Tracker)
    
    B --> G[ESG Scoring Engine]
    D --> G
    F --> G
    
    G --> H[Consolidated Org Index]
    G --> I[Custom Reports Builder]
    G --> J[Gamification Engine]
    
    J --> K(Points Ledger & Leaderboards)
    J --> L(Badge Auto-Awards)
```

---

## 1. Core Modules Breakdown

### 🍀 Environmental Module
- **Carbon Accounting Ledger:** Automatically or manually logs carbon transactions originating from purchases, manufacturing facilities, fleet logistics, or facilities expense entries.
- **Emission Factor Coefficient Registry:** Organizes activity factor values (e.g., Grid Electricity at `0.85 kg CO2e / kWh` or Diesel Fuel at `2.68 kg CO2e / Litre`) to convert quantity logs into equivalent $CO_2$ impact.
- **Sustainability Goals:** Displays target values, current values, and progress metrics for corporate emission reduction targets.

### 🤝 Social Module
- **CSR Campaigns:** Allows administrators to register CSR activities (e.g., E-Waste Recycling or Beach Cleanup Drives).
- **Volunteering Tracker:** Employees log participation with optional evidence files (images/documents) to receive points and XP bonuses upon approval.

### 🛡️ Governance Module
- **ESG Policies Dashboard:** Publishes legal guidelines (e.g., Code of Environmental Conduct) and registers employee e-signatures (acknowledgements) to trace corporate alignment.
- **Audit & Inspections Calendar:** Tracks compliance checks conducted by external or internal inspectors.
- **Compliance Red Flags:** Identifies active warning infractions, assigns owners, sets deadlines, and automatically tracks status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `OVERDUE`).

### 🏆 Gamification Module
- **Active Corporate Challenges:** Promotes environmental habits (e.g., "Bike to Work" or "Digital Clean-up") with levels of difficulty and deadline targets.
- **XP Leaderboards:** Ranks employees dynamically based on total earned XP points to encourage friendly internal competition.
- **Redemption Store:** Offers vouchers for sustainable items (e.g., Reusable Bamboo Mug, National Park Pass) which automatically verify stock counts and deduct points from the user's wallet.
- **Unlocked Badges:** Auto-assigns milestone achievements when an employee crosses an XP threshold or challenge completion count.

---

## 2. Business Workflows & Configurations

EcoSphere features a control panel (**Settings Page**) to modify behavior parameters dynamically:

### Proportional Department Scoring
Weights assigned to the three ESG pillars are configurable. By default, they are:
- **Environmental Weight:** 40%
- **Social Weight:** 30%
- **Governance Weight:** 30%

The overall organizational ESG index is a weighted average of individual department scores based on employee headcount.

### Toggles & Automation Toggles
1. **Auto-Calculate Carbon Outputs:** 
   - **Enabled:** Users log an activity quantity (e.g., `1000 Litres` of Diesel). The system automatically multiplies it by the matched factor coefficient value to commit the final $CO_2$ weight.
   - **Disabled:** Users enter the $CO_2$ equivalent weight manually.
2. **Audit Evidence Files Required:** If active, CSR volunteering requests cannot be marked as `APPROVED` by administrators unless a proof link is submitted.
3. **Badge Automations Auto-Award:** The system listens for point changes and automatically awards badges the moment an employee satisfies the unlock criteria.
4. **Compliance Overdue Cron:** Runs daily to sweep warning records and flag unresolved issues as `OVERDUE` if they pass their deadlines.
5. **Notification Control:** Configures settings to toggle **In-App Alerts** and **Email Digests** for compliance issues, approvals, badge achievements, and sign reminders.

---

## 3. Real-Time Analytics & Reports

### ESG Summary & Custom Reports Builder
The reports panel features a dynamic builder letting users compile disclosures by configuring parameters:
- **Department Scope:** Scope metrics for the entire organization or limit to single branches (e.g., Engineering, Sales).
- **Date Range Bounds:** Select start and end thresholds to audit specific cycles.
- **Modules Included:** Check/uncheck Environmental, Social, or Governance blocks to compile targeted narrative summaries.
- **Downloads:** Exports verified data tables to **CSV**, **Excel (.xls)**, or formatted **PDF summary (.txt)** templates fetched directly from the backend stream.

### Predictive Intelligence Trend
Under the hood, the platform integrates a **predictive forecasting engine** utilizing the `regression` package:
- Analyzes historical department score records.
- Computes trend directions (`improving`, `stable`, or `declining`) using **linear regression** slope indicators.
- Forecasts target quarters (e.g., Q4) to allow proactive ESG compliance.

---

## 4. Quick Start: Run Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- A PostgreSQL Instance or Neon Project Connection

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd BACKEND
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   JWT_SECRET="YOUR_SECRET_KEY_MIN_32_CHARS"
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```
4. Generate the Prisma client & seed the initial mock registry:
   ```bash
   npx prisma generate
   node prisma/seed.js
   ```
5. Launch the backend dev server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../FRONTEND
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite server:
   ```bash
   npm run dev
   ```
4. Access the platform at `http://localhost:3000`. Use the switch testing persona dropdown in the navbar to test different roles (ESG Admin, Department Head, Employee).
