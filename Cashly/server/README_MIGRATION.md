# Supabase Migration Notes

## Overview
The backend has been migrated from MongoDB (Mongoose) to Supabase.

## Changes
- **Database**: All data is now fetched from Supabase tables (`sales`, `expenses`, `receivables`, `inventory`, `businesses`, `alerts`, `scenarios`).
- **Authentication**: Backend middleware now verifies Supabase Auth tokens.
- **AI Agent**: The `CashlyAgent` tools have been refactored to query Supabase directly.

## Stubbed Services
To ensure core stability during this transition, the following advanced modules have been temporarily stubbed/disabled and will return "Upgrade in progress" messages:
- **Fraud Detection** (`detectFraud`)
- **Bank Reconciliation** (`reconcileBank`)
- **GST Planning** (`getGSTPlanning`)
- **Relationship Graph** (`getRelationshipGraph`)
- **Dependency Risk** (`getDependencyRisk`)
- **Scenario Comparison** (`compareScenarios`)

## Next Steps for Full Feature Types
To re-enable the advanced services, they need to be refactored to use Supabase queries similar to `PredictiveService` and `SimulatorService`.

## Running
Ensure your `.env` file contains `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
