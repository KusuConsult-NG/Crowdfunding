# Pledge Tracking Implementation Plan

## Objective
Implement a system for donors to pledge a specific amount to a campaign to be paid at a later date. This allows campaigns to show "committed" funds separate from "received" funds.

## 1. Database Schema
- Create `Pledge` model:
  - `id`: PK
  - `amount`: Float
  - `currency`: String
  - `donorId`: Relation to User
  - `campaignId`: Relation to Campaign
  - `status`: Enum (PENDING, PARTIALLY_FULFILLED, FULFILLED, CANCELLED)
  - `dueDate`: DateTime (Optional)
  - `description`: String (Optional)
  - `createdAt`, `updatedAt`

## 2. API Endpoints
- `POST /api/pledges`: Create a new pledge.
- `GET /api/pledges`: Get pledges for the current user.
- `GET /api/campaigns/[id]/pledges`: Get pledges for a specific campaign (Admin/Creator only).
- `PATCH /api/pledges/[id]`: Update pledge status or details.

## 3. UI Components
- **Pledge Button**: On Campaign details page (secondary action).
- **Pledge Form**: Modal or separate page to enter pledge amount and date.
- **User Dashboard**: New tab or section for "My Pledges".
  - List active pledges.
  - "Fulfill Now" button (links to donation flow with pre-filled amount).

## 4. Integration
- Update `Campaign` statistics to include "Pledged Amount" (separate from "Raised Amount").
- When a donation is made, optionally link it to a pledge to mark it as fulfilled.

## 5. Notifications
- Email confirmation upon pledging.
- Reminder emails as due date approaches (Future scope).
