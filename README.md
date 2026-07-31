# 🌍 EcoSphere: Real-Time B2B ESG Management Platform

🔗 **Live Hackathon Demo**: [https://esg-management-platform-ashen.vercel.app/](https://esg-management-platform-ashen.vercel.app/)

**EcoSphere** is a premium, real-time Environmental, Social, and Governance (ESG) management platform designed to integrate sustainability directly into everyday B2B ERP operations. It transforms disconnected spreadsheet-based ESG metrics into automated ledger entries, gamified employee experiences, and data-driven executive forecasts.

---

## 🚀 Key Features & Modules

### 🍀 1. Environmental (Carbon Accounting)
*   **Automated Carbon Ledger**: Automatically tracks and converts operational logs (Expenses, Fleet travel, Manufacturing operations) into exact carbon equivalence using custom emission factors.
*   **Dynamic Emission Factors**: Allows configuration of custom emission coefficients (e.g., Grid Electricity, Diesel fuel, Domestic Flights) per activity unit.
*   **Sustainability Targets**: Monitors organizational progress toward Scope 1 & 2 reduction targets with real-time target calculators.

### 🤝 2. Social (CSR & Engagement)
*   **CSR Campaign Registry**: Registers volunteering drives and green office campaigns.
*   **Verified Employee Participation**: Requires verified photographic/file proof uploads (when evidence requirement toggle is active) before awarding XP.
*   **Volunteering Approvals**: Provides department heads with a dashboard to approve or reject employee volunteer records.

### ⚖️ 3. Governance (Policies & Audits)
*   **EsgPolicy Tracker**: Publishes governance policies (Code of Conduct, Privacy acts) and registers user digital acknowledgements in real time.
*   **Audit Registers**: Schedules internal/external audits for specific departments.
*   **Compliance Issue Board**: Tracks active compliance issues, flags overdue milestones, and assigns dedicated compliance owners.

### 🏆 4. Gamification (XP & Reward Shop)
*   **Eco Challenges**: Complete challenges (Draft $\to$ Active $\to$ Under Review $\to$ Completed lifecycle) to earn XP.
*   **Auto Badge Engine**: Monitors employee milestones and automatically issues badges (e.g., *Eco Starter*, *Sustainability Champion*) when thresholds are met.
*   **Redeemable Reward Shop**: Spend points to claim premium eco-rewards (e.g., *Bamboo Coffee Mugs*, *National Park Passes*) with automatic stock tracking.
*   **Live Leaderboard**: Real-time rank calculation across departments based on active sustainability XP.

### 🔮 5. ML ESG Trend Predictor (Hackathon Highlight!)
*   **Time-Series Forecasting**: Integrated a deterministic linear regression engine to fit historical score trajectories.
*   **Category Predictors**: Individually forecasts environmental, social, and governance score movements to identify exact downward-trending metrics.
*   **Org-Wide Aggregator**: Aggregates forecasts using a **headcount-weighted average** across all departments, applying the global ESG config weights for the unified organization index.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), React Query (TanStack), Axios, Recharts (Modern charts), Lucide icons, Premium HSL Tailored CSS Styling (Glassmorphism & animations).
*   **Backend**: Node.js, Express, JavaScript (ES Modules), Zod (Comprehensive request schema validation).
*   **Database**: PostgreSQL, Prisma v7 Client (Optimized Wasm-first database engine with Pg driver adapters).
*   **Machine Learning**: `regression` (Linear regression fitting library).
*   **Testing**: Custom CommonJS verification scripts for schemas and ML predictors.

---

## 📐 Data Model Architecture

The database is built on a clean relational schema modeled via Prisma:

```mermaid
erDiagram
    %% Master Data
    DEPARTMENT {
        String id PK
        String name
        String code UK
        String headId FK "Unique"
        String parentId FK
        Int employeeCount
        String status
    }
    
    EMPLOYEE {
        String id PK
        String name
        String email UK
        String passwordHash
        Enum role "EMPLOYEE, DEPT_HEAD, ESG_ADMIN"
        String departmentId FK
        String status
    }

    CATEGORY {
        String id PK
        String name
        Enum type "CSR_ACTIVITY, CHALLENGE"
        String status
    }

    EMISSION_FACTOR {
        String id PK
        String activity
        String unit
        Float factorValue
        String status
    }

    ESG_POLICY {
        String id PK
        String title
        String content
        Int version
        String status
    }

    BADGE {
        String id PK
        String name
        String description
        Json unlockRule
        String icon
    }

    REWARD {
        String id PK
        String name
        String description
        Int pointsRequired
        Int stock
        String status
    }

    ESG_CONFIG {
        String id PK
        Float envWeight
        Float socialWeight
        Float govWeight
        Boolean autoEmissionCalc
        Boolean evidenceRequired
        Boolean badgeAutoAward
    }

    %% Environmental & Goals
    CARBON_TRANSACTION {
        String id PK
        String departmentId FK
        String emissionFactorId FK
        Enum sourceType
        String sourceId
        Float quantity
        Float co2Amount
        DateTime date
    }

    ENVIRONMENTAL_GOAL {
        String id PK
        String title
        String departmentId FK
        Float targetValue
        Float currentValue
        String unit
        DateTime periodStart
        DateTime periodEnd
    }

    %% Social (CSR) & Challenges
    CSR_ACTIVITY {
        String id PK
        String title
        String description
        String categoryId FK
        String departmentId FK
        DateTime date
        String status
    }

    EMPLOYEE_PARTICIPATION {
        String id PK
        String employeeId FK
        String activityId FK
        Enum approvalStatus "PENDING, APPROVED, REJECTED"
        Int pointsEarned
        DateTime completionDate
    }

    CHALLENGE {
        String id PK
        String title
        String categoryId FK
        String description
        Int xp
        String difficulty
        Boolean evidenceRequired
        DateTime deadline
        Enum status "DRAFT, ACTIVE, COMPLETED"
    }

    CHALLENGE_PARTICIPATION {
        String id PK
        String challengeId FK
        String employeeId FK
        Int progress
        String proofUrl
        Enum approvalStatus
        Int xpAwarded
    }

    %% Governance & Audits
    POLICY_ACKNOWLEDGEMENT {
        String id PK
        String employeeId FK
        String policyId FK
        DateTime acknowledgedAt
    }

    AUDIT {
        String id PK
        String departmentId FK
        DateTime date
        String auditor
        String status
    }

    COMPLIANCE_ISSUE {
        String id PK
        String auditId FK
        Enum severity
        String description
        String ownerId FK
        DateTime dueDate
        Enum status "OPEN, OVERDUE, RESOLVED"
    }

    %% Gamification Ledger
    POINTS_TRANSACTION {
        String id PK
        String employeeId FK
        Enum sourceType
        String sourceId
        Int amount
        DateTime createdAt
    }

    REDEMPTION {
        String id PK
        String employeeId FK
        String rewardId FK
        Int pointsSpent
        DateTime createdAt
    }

    EMPLOYEE_BADGE {
        String id PK
        String employeeId FK
        String badgeId FK
        DateTime awardedAt
    }

    %% Scoring Snapshot
    DEPARTMENT_SCORE {
        String id PK
        String departmentId FK
        Float environmentalScore
        Float socialScore
        Float governanceScore
        Float totalScore
        String period UK
    }

    %% Relationships
    DEPARTMENT ||--o{ EMPLOYEE : "has employees"
    DEPARTMENT |o--o| EMPLOYEE : "has head"
    DEPARTMENT |o--o{ DEPARTMENT : "parent-child"
    DEPARTMENT ||--o{ CARBON_TRANSACTION : "generates"
    DEPARTMENT ||--o{ CSR_ACTIVITY : "organizes"
    DEPARTMENT ||--o{ AUDIT : "undergoes"
    DEPARTMENT ||--o{ DEPARTMENT_SCORE : "receives"
    
    EMPLOYEE ||--o{ EMPLOYEE_PARTICIPATION : "participates in CSR"
    EMPLOYEE ||--o{ CHALLENGE_PARTICIPATION : "enters challenge"
    EMPLOYEE ||--o{ POINTS_TRANSACTION : "earns/spends"
    EMPLOYEE ||--o{ REDEMPTION : "redeems"
    EMPLOYEE ||--o{ EMPLOYEE_BADGE : "earns"
    EMPLOYEE ||--o{ POLICY_ACKNOWLEDGEMENT : "acknowledges"
    EMPLOYEE ||--o{ COMPLIANCE_ISSUE : "owns issue"
    
    CATEGORY ||--o{ CSR_ACTIVITY : "categorizes"
    CATEGORY ||--o{ CHALLENGE : "categorizes"
    
    EMISSION_FACTOR ||--o{ CARBON_TRANSACTION : "multiplies"
    
    CSR_ACTIVITY ||--o{ EMPLOYEE_PARTICIPATION : "contains"
    CHALLENGE ||--o{ CHALLENGE_PARTICIPATION : "contains"
    
    ESG_POLICY ||--o{ POLICY_ACKNOWLEDGEMENT : "receives"
    
    AUDIT ||--o{ COMPLIANCE_ISSUE : "finds"
    
    REWARD ||--o{ REDEMPTION : "is redeemed"
    BADGE ||--o{ EMPLOYEE_BADGE : "is awarded"
```

---

## ⚡ Quickstart Setup

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL running locally

### 1. Database Setup
1.  Initialize database schema and seed mock data:
    ```bash
    cd BACKEND
    # Create .env from template
    copy .env.example .env
    # Install dependencies
    npm install
    # Apply database migrations
    npx prisma db push
    # Populate comprehensive mock seed data (employees, scores, transactions)
    npx prisma db seed
    ```

### 2. Run the Backend API Server
```bash
cd BACKEND
npm run dev
# The API will run on http://localhost:5000
```

### 3. Run the Frontend React Application
```bash
cd FRONTEND
npm install
npm run dev
# The frontend will run on http://localhost:3000
```

---

## 🧪 Running Verification Test Suites

Verify validation layers and ML forecasting logic by executing our test suites:
```bash
cd BACKEND
# Test Zod schema validation rules
node scratch/test_validations.cjs
# Test ML linear regression trends and clamping math
node scratch/test_predictions_logic.js
```
