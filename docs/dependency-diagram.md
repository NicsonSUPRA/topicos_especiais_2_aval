# Dependency Diagram — Travel Request Processing

## Architecture Overview

```mermaid
graph TD
    subgraph "Entry Point"
        MAIN["src/main.ts<br/>processTravelRequest()"]
    end

    subgraph "Application Layer"
        UC["ProcessTravelRequestUseCase"]
        UC_IF["UseCase&lt;Input, Output&gt;<br/>(interface)"]
        REPO_IF["TravelRequestRepository<br/>(interface)"]
        DTO["ProcessTravelRequestInput<br/>ProcessTravelRequestOutput<br/>(DTOs)"]
        APP_ERR["ApplicationError"]
    end

    subgraph "Domain Layer"
        TRA["TravelRequestAnalyse<br/>(entity)"]
        TP["TravelPeriod<br/>(value object)"]
        PRICES["DAILY_PRICES<br/>(business constants)"]
    end

    subgraph "Infrastructure Layer"
        PG_REPO["PostgresTravelRequestRepository"]
        POOL["ConnectionPool<br/>getPool() / closePool()"]
    end

    subgraph "External"
        DB[("PostgreSQL<br/>travel_requests")]
    end

    MAIN --> UC
    MAIN --> PG_REPO
    UC -.implements.-> UC_IF
    UC --> REPO_IF
    UC --> TRA
    UC --> DTO
    TRA --> TP
    TRA --> PRICES
    PG_REPO -.implements.-> REPO_IF
    PG_REPO --> POOL
    POOL --> DB

    style MAIN fill:#4a90d9,color:#fff
    style UC fill:#f5a623,color:#fff
    style UC_IF fill:#f5a623,color:#fff
    style REPO_IF fill:#f5a623,color:#fff
    style DTO fill:#f5a623,color:#fff
    style APP_ERR fill:#f5a623,color:#fff
    style TRA fill:#7ed321,color:#fff
    style TP fill:#7ed321,color:#fff
    style PRICES fill:#7ed321,color:#fff
    style PG_REPO fill:#d0021b,color:#fff
    style POOL fill:#d0021b,color:#fff
    style DB fill:#9013fe,color:#fff
```

## Dependency Direction

- **main.ts** → Application (UseCase) + Infrastructure (Repository instance)
- **Application** → Domain (entities, value objects)
- **Application** defines interfaces (contracts)
- **Infrastructure** implements Application interfaces
- **Domain** has NO external dependencies
- Dependencies point **inward** (Dependency Inversion Principle)
