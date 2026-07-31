# 🚀 EcoSphere: The Ultimate Backend & DBMS Interview Cheat Sheet

This is your **all-in-one interview cheat sheet**. You do not need to read the source code; memorizing the concepts in this document will allow you to answer any Backend or Database Management System (DBMS) question an interviewer throws at you regarding this project.

---

## 🏗️ PART 1: SYSTEM ARCHITECTURE & NODE.JS

### 1. Why did you choose Node.js over Java, Python, or Go?
**Answer:** "Node.js uses a single-threaded, non-blocking, event-driven I/O model (the Event Loop). An ESG platform is heavily I/O bound—it constantly reads/writes to the database for carbon logs, validations, and cron jobs. Node.js handles thousands of concurrent I/O requests incredibly efficiently without the memory overhead of spawning a new OS thread for every request."

### 2. How did you structure your Express backend?
**Answer:** "I used a **Modular (Domain-Driven) Architecture** instead of the traditional MVC. Every feature (Auth, Gamification, Environmental) has its own folder containing its `routes`, `controller`, and `service`. 
*   **Routes**: Defines the endpoints and attaches validation/auth middleware.
*   **Controller**: Extracts data from the HTTP request (`req.body`, `req.params`) and passes it to the service.
*   **Service**: Contains 100% of the raw business logic and database calls. This keeps the code decoupled and highly testable."

### 3. How did you handle asynchronous code and errors?
**Answer:** "I used `async/await` everywhere to avoid callback hell. To prevent the server from crashing due to unhandled promise rejections, I wrote a custom `asyncHandler` wrapper for all controllers. If any error is thrown in a service, the `asyncHandler` catches it and passes it to a **Centralized Error Middleware**, which formats the error into a consistent JSON response for the frontend."

### 4. What is Event-Driven Architecture and how did you use it?
**Answer:** "To keep modules loosely coupled, I used Node's built-in `EventEmitter`. For example, when the Social Module approves a volunteering request, it shouldn't be responsible for calculating badges. Instead, it emits a `points.updated` event. The Gamification Module listens for this event in the background and evaluates badge unlock rules. This adheres perfectly to the **Single Responsibility Principle**."

---

## 🗄️ PART 2: DATABASE MANAGEMENT SYSTEMS (DBMS)

### 5. Why PostgreSQL instead of MongoDB (NoSQL)?
**Answer:** "Initially, NoSQL might seem faster to build with, but ESG data is fundamentally relational and requires financial-grade accuracy. 
1.  **Data Integrity:** We need strict Foreign Keys. If a department is deleted, we can't have orphaned carbon transactions floating in the DB.
2.  **ACID Transactions:** Redeeming gamification rewards requires strict transactional safety to prevent double-spending points.
3.  **Complex Queries:** Calculating a leaderboard requires aggregating points across multiple tables, which is incredibly difficult and slow in NoSQL but native to SQL."

### 6. What is Normalization and how is your schema normalized?
**Answer:** "Normalization eliminates data redundancy and prevents insert/update/delete anomalies. My database is in **3rd Normal Form (3NF)**:
*   **1NF (Atomic values):** Every column holds a single value (no comma-separated strings).
*   **2NF (No partial dependencies):** All non-key attributes depend on the entire primary key.
*   **3NF (No transitive dependencies):** I don't store `departmentName` on the `Employee` table. I store `departmentId` (a Foreign Key). If a department changes its name, I only update it in the `Department` table, and all employees instantly reflect the change."

### 7. Explain ACID properties and how you implemented them.
**Answer:** "ACID ensures database reliability during transactions. I used Prisma's `$transaction` API for the Reward Redemption system.
*   **Atomicity (All or nothing):** When redeeming a reward, the system deducts user points AND decrements reward stock. If deducting points succeeds but decrementing stock fails, the *entire* transaction rolls back.
*   **Consistency:** Database-level constraints (like stock `> 0`) are checked. The transaction takes the DB from one valid state to another valid state.
*   **Isolation:** If two users try to buy the last coffee mug at the exact same millisecond, the database isolates the transactions. One will succeed, the other will read the new stock (0) and fail.
*   **Durability:** Once the transaction commits, it is written to the disk permanently, even if the server loses power a second later."

---

## 🚀 PART 3: ADVANCED SQL & OPTIMIZATIONS

### 8. How did you handle the Gamification Points System?
**Answer:** "I did **not** store a simple `totalPoints` integer on the `Employee` table. Doing so is vulnerable to race conditions (if two requests add points simultaneously, one might overwrite the other). Instead, I used an **Append-Only Ledger** called `PointsTransaction`. Earning points adds a positive row; spending adds a negative row. To get a user's balance, the backend executes `SELECT SUM(amount) FROM PointsTransaction WHERE employeeId = ?`. It guarantees 100% auditability."

### 9. How did you optimize the Leaderboard query?
**Answer:** "Sorting thousands of aggregated points in Node.js would crash the server's memory. Instead, I pushed the computation to the database using **SQL Window Functions**. 
I wrote a raw SQL query using `RANK() OVER (ORDER BY SUM(amount) DESC)`. The Postgres engine efficiently groups the points, ranks the users, and returns only the top 20 rows over the network. It operates in $O(1)$ network transfer time."

### 10. What are Indexes and where did you use them?
**Answer:** "Indexes are B-Tree data structures that allow the database to find rows in $O(\\log n)$ time instead of scanning the entire table $O(n)$. 
I added composite indexes to tables that are heavily queried by cron jobs. For example, on the `CarbonTransaction` table, I added `@@index([departmentId, date])` because the scoring engine constantly queries 'Get all transactions for Department X between Date Y and Z'."

### 11. How does the Scoring Engine handle duplicate data? (Idempotency)
**Answer:** "The engine recalculates department ESG scores every night. To prevent it from inserting a new row every time it runs, I used a composite unique key: `@@unique([departmentId, period])` (e.g., Engineering, 2026-07). I used an **Upsert** (ON CONFLICT DO UPDATE). If the row doesn't exist, it creates it. If it does, it overwrites the old score. This makes the cron job **idempotent**—it can run 100 times a night and the database state remains perfectly consistent."

---

## 🔒 PART 4: SECURITY & VALIDATION

### 12. How is Authentication and Authorization handled?
**Answer:** 
*   **Authentication (Who are you?):** When a user logs in, I compare their password against a bcrypt hash. If valid, I issue a **JSON Web Token (JWT)** signed with a server-side secret. The client sends this token in the `Authorization: Bearer` header on subsequent requests.
*   **Authorization (What can you do?):** I built a Role-Based Access Control (RBAC) middleware (`requireRole`). A user with the `EMPLOYEE` role can view their profile, but if they try to hit the `POST /api/governance/policies` route, the middleware blocks them because it requires the `ESG_ADMIN` role.

### 13. How do you protect the database from bad data?
**Answer:** "I strictly follow the **Fail-Fast Principle** using `Zod` (a schema validation library).
I created schemas for every API endpoint. Before the controller even runs, a validation middleware checks the request body. If a user tries to send a string instead of a number for `quantity`, Zod intercepts it and returns a `400 Bad Request` instantly. This ensures malicious or malformed data never touches the database."

### 14. What security middlewares are you using?
**Answer:**
*   **Helmet.js:** Automatically sets secure HTTP headers (like X-XSS-Protection and Content-Security-Policy).
*   **CORS:** Cross-Origin Resource Sharing is configured to only allow requests from our specific frontend domain.
*   **Express-Rate-Limit:** Applied to sensitive routes (like `/login` and `/redeem-reward`) to prevent brute-force and DDoS attacks.

---

## ⏰ PART 5: AUTOMATION & BACKGROUND JOBS

### 15. How do you handle tasks that need to run daily?
**Answer:** "I used `node-cron` to spawn background workers within the Node process. 
For example, the **Overdue Checker** cron job is scheduled as `0 6 * * *` (6:00 AM daily). It executes a single, highly optimized bulk update query: `UPDATE ComplianceIssue SET status = 'OVERDUE' WHERE status = 'OPEN' AND dueDate < NOW()`. 
By running this as a background job during off-peak hours, it doesn't block the main event loop, keeping the API fast for active users."
