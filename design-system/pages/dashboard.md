# Dashboard Design Specifications - Page Override

Page-specific override specs for the Main Dashboard view.

## 1. Structure
- **Bento Grid**: 3 to 4 column dynamic layout summarizing overall ESG KPIs.
  - Card 1: Org-level ESG Score Hero Number (Radial Circular display).
  - Card 2: Environmental Scope 1 & 2 progress.
  - Card 3: Social CSR Engagement score.
  - Card 4: Governance Static Audit status.
- **Charts Section**: 2-column or full-width grid containing:
  - Recharts Bar Chart showing per-department ESG scoring comparison.
- **Data Tables**:
  - Employee Leaderboard Table (ranked by XP).
  - Activity Feed: A dense chronological feed showing updates from all modules.

## 2. Interaction
- Recalculate Score: An ESG Admin button to trigger live recalculation of department scores. Displays a loader state and updates the bento cards.
- Hover Effects: Subtle scaling/shadow effects on cards without changing spacing boundaries.
