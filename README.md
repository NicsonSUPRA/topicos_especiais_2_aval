# TEC2 Final Assessment — Travel Request Processing

### Equipe / Aluno:
* **Nicson Costa Antunes**

---

This is the refactored solution for the final assessment of Tópicos Especiais em Computação II.

The official assignment statement is available at [`docs/tec2-aval.md`](docs/tec2-aval.md). This README is an operational guide and does not replace the assignment statement.

## Architecture Overview

The solution follows a **Clean Architecture** approach with three layers:

```
src/
  original/              # Legacy code (preserved, untouched)
  domain/                # Business rules and entities
    TravelPeriod.ts      # Value object for date validation and day calculation
    TravelRequestAnalyse.ts  # Domain entity with all business rules
  application/           # Use case orchestration and contracts
    contracts/           # Interfaces (UseCase, TravelRequestRepository)
    dtos/                # Input/Output type definitions
    errors/              # Application-level error class
    usecases/            # ProcessTravelRequestUseCase
  infra/                 # External dependencies implementation
    database/            # PostgreSQL repository + connection pool
  main.ts                # Public contract entry point
```

### Key Design Decisions

1. **Dependency Inversion**: The `TravelRequestRepository` interface is defined in the application layer. The infrastructure layer (`PostgresTravelRequestRepository`) implements it, allowing the domain and application layers to remain independent of database details.

2. **Synchronous Public Contract**: The original `processTravelRequest()` function is synchronous. The refactored solution preserves this by performing database persistence in the background (fire-and-forget with error logging), ensuring test compatibility.

3. **Domain Encapsulation**: All business rules (validation, daily amount calculation, status determination, warning evaluation) are encapsulated in `TravelRequestAnalyse` and `TravelPeriod`, with no external dependencies.

4. **Value Object Pattern**: `TravelPeriod` is a value object that handles date validation and travel day calculation, separating this concern from the main analysis entity.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` for local development:
```bash
cp .env.example .env
```

## Type Checking

```bash
npm run typecheck
```

## Running Tests

Run all tests:
```bash
npm test
```

Run only the original behavior preservation tests:
```bash
npm run test:original
```

## Database

The project uses PostgreSQL provided via Docker Compose.

### Prerequisites
- Docker and Docker Compose installed

### Starting the Database

```bash
npm run db:up       # Start PostgreSQL container
npm run db:init     # Create the travel_requests table
```

### Stopping the Database

```bash
npm run db:down     # Stop and remove the container + volume
```

### Database Connection

The application connects via the `DATABASE_URL` environment variable:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/travel_requests
```

### Database Schema

The `travel_requests` table stores processed travel request analyses:

| Column                  | Type    | Description                        |
|-------------------------|---------|------------------------------------|
| id                      | TEXT    | Primary key (requestId)            |
| requester_name          | TEXT    | Name of the requester              |
| requester_type          | TEXT    | Type: student/employee/professor/manager |
| destination             | TEXT    | Travel destination                 |
| departure_date          | TEXT    | Departure date (YYYY-MM-DD)        |
| return_date             | TEXT    | Return date (YYYY-MM-DD)           |
| reason                  | TEXT    | Travel justification               |
| status                  | TEXT    | approved/pending-review/rejected   |
| travel_days             | INTEGER | Inclusive day count                 |
| daily_amount_in_cents   | INTEGER | Daily allowance in cents           |
| subtotal_in_cents       | INTEGER | travelDays × dailyAmount           |
| transport_cost_in_cents | INTEGER | Transport cost in cents            |
| total_amount_in_cents   | INTEGER | subtotal + transport cost          |
| created_at              | TEXT    | ISO timestamp of creation          |

## Test Structure

```
tests/
  original/              # Behavior preservation tests (DO NOT MODIFY)
  domain/                # Unit tests for domain entities
    TravelPeriod.test.ts
    TravelRequestAnalyse.test.ts
  application/           # Use case tests with mocked repository
    usecases/
      process-travel-request-usecase.test.ts
  infra/                 # Infrastructure tests with mocked pg
    postgres-travel-request-repository.test.ts
```

## Dependency Diagram

The dependency diagram is available at:
- [`docs/dependency-diagram.pdf`](docs/dependency-diagram.pdf) — PDF version
- [`docs/dependency-diagram.html`](docs/dependency-diagram.html) — HTML/SVG version (open in browser, print to PDF)
- [`docs/dependency-diagram.md`](docs/dependency-diagram.md) — Mermaid source

To generate the PDF from the HTML version:
1. Open `docs/dependency-diagram.html` in a browser
2. Press `Ctrl+P` (or `Cmd+P` on macOS)
3. Select "Save as PDF"
4. Save as `docs/dependency-diagram.pdf`

## AI Usage Documentation

### Tools Used
- **Gemini (Google Deepmind)** — AI coding assistant used throughout the development process

### How AI Was Used
- **Code Analysis**: AI analyzed the legacy code in `src/original/process-travel-request.ts` to understand the existing business rules before refactoring
- **Refactoring Guidance**: AI suggested the Clean Architecture structure (domain/application/infra layers) and helped implement the separation of concerns
- **Test Writing**: AI helped write comprehensive unit tests covering normal flows, edge cases, and error scenarios
- **Documentation**: AI generated the dependency diagram and helped structure this README

### Suggestions Accepted
- Clean Architecture layer separation (domain → application → infra)
- Value Object pattern for `TravelPeriod`
- Repository pattern with interface in application layer
- Background persistence to maintain synchronous public contract
- Comprehensive test coverage including mocked infrastructure tests

### Suggestions Rejected/Modified
- AI initially suggested making `processTravelRequest()` async, but this was rejected to maintain backward compatibility with the original behavior tests
- Overly complex error handling abstractions were simplified to keep the codebase straightforward

### Validation of AI Responses
- All refactored code was validated against the original behavior preservation tests (`npm run test:original`)
- Type safety verified with `npm run typecheck` (strict mode enabled)
- Business rules manually compared between original and refactored implementations to ensure identical behavior
- Edge cases tested with dedicated unit tests for domain entities

## Verification Checklist

```bash
# 1. Install dependencies
npm install

# 2. Verify type checking passes
npm run typecheck

# 3. Run all tests (original + custom)
npm test

# 4. Run only behavior preservation tests
npm run test:original

# 5. (Optional) Start database and verify persistence
npm run db:up
npm run db:init
# ... run application ...
npm run db:down
```

## Student Delivery

Students must create their own public GitHub repositories from this base code and submit only their repository link in SIGAA.

Do not submit changes to the professor's base repository. Do not replace the official assignment statement with this README.
