# Implementation Plan - Advanced Intelligence Layer for Cashly

This plan outlines the steps to transform Cashly into a predictive, automated, and trusted financial copilot for MSMEs.

## 1. Predictive Risk Intelligence
- [x] **Payment Delay Prediction**: 
    - [x] Create `PredictiveService.js` to analyze historical payment behavior.
    - [x] Implement `predictCustomerPaymentDelay` tool in `agent/tools.js`.
    - [ ] Update frontend to show "Probability of late payment" in Receivables.
- [x] **Expense Shock Forecasting**:
    - [x] Implement anomaly detection logic in `PredictiveService.js`.
    - [x] Create `predictExpenseSpikes` tool.
    - [ ] Add "Expense Warning" alerts to the dashboard.

## 2. Action Automation Engine (Opt-In)
- [x] **Smart Auto-Actions**:
    - [x] Add `AutomationRule` model.
    - [x] Implement backend logic to trigger WhatsApp/Email reminders (simulated for now).
    - [ ] Add "Approval Queue" in frontend for AI-suggested actions.
- [x] **Cash Buffer Enforcement**:
    - [x] Add `minCashBuffer` field to `Business` model.
    - [x] Implement logic to flag transactions that violate the buffer.

## 3. Deep MSME Integrations
- [x] **Bank Sync & Reconciliation**:
    - [x] Enhance `BankAccount` model to store transaction history.
    - [x] Implement basic reconciliation logic (matching uploads with bank records).
- [x] **GST-Aware Cash Planning**:
    - [x] Add GST calculation logic to `Sale` data processing.
    - [x] Show upcoming GST liabilities in the forecast.

## 4. Vendor & Customer Intelligence Graph
- [x] **Relationship Graph**:
    - [x] Create a React component to visualize the connection between Business, Customers (Receivables), and Vendors (Payables).
- [x] **Dependency Risk Index**:
    - [x] Calculate "Concentration Risk" metrics.
    - [ ] Display risk score on the Relationship Graph.

## 5. Strategic Decision Simulator
- [x] **Big Purchase Feasibility Engine**:
    - [x] Create a "What-If" simulator for large expenses.
    - [x] Add YES/NO/HIGH RISK verdict logic.
- [x] **Break-Even & Stabilization Timeline**:
    - [x] Calculate the "Cash-Positive Runway" and stabilization date.

## 6. Explainability & Trust Layer
- [x] **Confidence Bands**:
    - [x] Update forecasting logic to return Best/Worst/Avg cases.
    - [ ] Visualize shaded areas in the Forecast chart.
- [x] **Insight Transparency**:
    - [x] Add "Factors Considered" to all AI-generated insights.

## 7. Advanced Scenario Intelligence
- [x] **Scenario Comparison**:
    - [x] Build a tool to diff two scenarios.
- [x] **Reverse Scenario Solver**:
    - [x] "Goal-seeking" logic: "How much sales do I need to keep ₹50k buffer?"

## 8. Behavioral & Habit Intelligence
- [x] **Financial Discipline Score**:
    - [x] Track dashboard login frequency and alert response time.
- [x] **Cash Review Streaks**:
    - [x] Implement gamified streak tracker in the User profile.

## 9. Business Memory & Personalization
- [x] **Business Memory Engine**:
    - [x] Create `BusinessMemory` model to store seasonal trends and one-time events.
- [x] **Owner Decision Style**:
    - [x] Log user choices (aggressive vs conservative) to adapt AI tone.

## 10. Enterprise & Security
- [x] **Public API Layer**:
    - [ ] Implement API route with token-based authentication.
- [x] **Fraud & Manipulation Detection**:
    - [x] Add audit logs for all financial record edits to detect suspicious changes.

