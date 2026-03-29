# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0

## Must-Haves (from SPEC)
- [ ] Role-based JWT authentication
- [ ] Safe, transactional sales processing preventing overselling
- [ ] Inventory management with automated deduction
- [ ] Analytics dashboard & background jobs
- [ ] AI-driven demand forecasting

## Phases

### Phase 1: Foundation & Authentication
**Status**: ⬜ Not Started
**Objective**: Setup React + Node.js boilerplate, configure PostgreSQL, Redis, and build JWT Authentication.
**Requirements**: REQ-01

### Phase 2: Core Inventory System
**Status**: ⬜ Not Started
**Objective**: Build models and APIs for products, categories, and track stock quantity. Build UI for management.
**Requirements**: REQ-02

### Phase 3: Sales & Transaction Engine
**Status**: ⬜ Not Started
**Objective**: Implement point of sale APIs with DB transactions. Reduce stock on successful sales. Add UI for sales.
**Requirements**: REQ-03

### Phase 4: Analytics, Background Jobs, and Caching
**Status**: ⬜ Not Started
**Objective**: Develop analytics dashboard. Connect Redis caching for endpoints. Add BullMQ for daily data aggregation.
**Requirements**: REQ-04, REQ-05

### Phase 5: AI Forecasting Integration
**Status**: ⬜ Not Started
**Objective**: Connect OpenAI API to analyze sales data via scheduled jobs. Display AI recommendations in the UI.
**Requirements**: REQ-06

### Phase 6: Gap Closure
**Status**: ⬜ Not Started
**Objective**: Address gaps from milestone audit

**Gaps to Close:**
- [ ] Connect real AI Provider to aiService.ts (OpenAI API integration)
- [ ] Implement pagination or infinite scroll on POS interface product grid
