# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
An AI-Powered Smart Inventory & Sales Intelligence System designed to help small retail stores transition from manual tracking to data-driven operations, preventing stockouts, forecasting demand, and providing actionable insights.

## Goals
1. Provide robust inventory management with reorder thresholds and auto-deduction.
2. Handle sales transactions securely with proper database consistency to prevent overselling.
3. Deliver analytics dashboards with sales trends, inventory turnover, and LLM-powered AI insights for restocking.
4. Build a scalable, production-ready backend demonstrating clean architecture, caching, and background jobs.

## Non-Goals (Out of Scope)
- Multi-store support (initially single-store only).
- Payment gateway integration.
- Real-time systems (e.g., WebSockets for instant updates).

## Users
- **Admin**: Full system control (manage users, products, analytics).
- **Manager**: Manage inventory, process sales, view analytics and AI insights.
- **Staff**: Process sales transactions only.

## Constraints
- **Technical**: Minimal UI, focus on backend. Must use Node.js, Express, PostgreSQL (raw SQL), Redis, BullMQ, React, TypeScript.
- **Strategic**: Focused on backend strength for technical interview demonstration.

## Success Criteria
- [ ] Users can log in with role-based JWT authentication.
- [ ] Inventory can be tracked, updated, and warns on low stock.
- [ ] Sales transactions safely deduct stock using database transactions.
- [ ] Analytics dashboard displays accurate revenue, trends, and top products.
- [ ] Background jobs aggregate data and prepare low stock alerts daily.
- [ ] AI feature successfully forecasts demand and generates restocking recommendations via OpenAI.
