# E-Commerce SaaS Platform

A microservice-based E-Commerce SaaS backend built with **Express 5**, **TypeScript**, and **Nx** monorepo tooling.

## Architecture Overview

```
                    ┌─────────────────────┐
                    │      Clients        │
                    └─────────┬───────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │    API Gateway       │
                    │    (port 8080)       │
                    │  ┌───────────────┐  │
                    │  │ Rate Limiter  │  │
                    │  │ CORS / Logs   │  │
                    │  │ Proxy Router  │  │
                    │  └───────────────┘  │
                    └─────────┬───────────┘
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
       ┌──────────────────┐      ┌──────────────────┐
       │  Auth Service     │      │  ... (future)    │
       │  (port 6001)      │      │                  │
       └──────────────────┘      └──────────────────┘
```

All services share reusable packages from the `packages/` directory.

---

## Tech Stack

| Layer             | Technology                                                     |
| ----------------- | -------------------------------------------------------------- |
| **Language**      | TypeScript 5.9                                                 |
| **Runtime**       | Node.js (LTS)                                                  |
| **Framework**     | Express 5                                                      |
| **Monorepo**      | Nx 23                                                          |
| **Build**         | esbuild (auth-service) · Webpack (api-gateway)                 |
| **Testing**       | Jest 30 + SWC                                                  |
| **Linting**       | ESLint 9 + Prettier                                            |
| **Containerization** | Docker (multi-stage via `@nx/docker`)                       |
| **API Docs**      | Swagger UI Express                                             |

---

## Project Structure

```
E-Commerce-SaaS/
├── apps/
│   ├── api-gateway/          # Central API gateway (Express + Webpack)
│   ├── api-gateway-e2e/      # E2E tests for the API gateway
│   ├── auth-service/         # Authentication microservice (Express + esbuild)
│   └── auth-service-e2e/     # E2E tests for the auth service
├── packages/
│   ├── error-handler/        # Shared error classes & Express error middleware
│   └── middlewares/          # Shared middleware utilities (WIP)
├── nx.json                   # Nx workspace configuration
├── tsconfig.base.json        # Shared TypeScript configuration
├── jest.config.ts            # Root Jest configuration
├── eslint.config.mjs         # Root ESLint configuration
└── package.json              # Root dependencies & workspace definition
```

---

## Apps

### API Gateway (`apps/api-gateway`)

The single entry point for all client requests. It handles cross-cutting concerns before proxying traffic to downstream services.

- **Port:** `8080` (configurable via `PORT` env var)
- **Features:**
  - CORS configuration
  - Request logging with [Morgan](https://github.com/expressjs/morgan)
  - Rate limiting — 100 req/15 min (anonymous), 1 000 req/15 min (authenticated)
  - Cookie parsing
  - Request body parsing (up to 100 MB)
  - Reverse proxy to downstream services via [express-http-proxy](https://github.com/villadora/express-http-proxy)
  - Swagger UI integration (ready for API documentation)
- **Health check:** `GET /gateway-health`
- **Build tool:** Webpack

### Auth Service (`apps/auth-service`)

Handles user authentication and authorization.

- **Port:** `6001` (configurable via `PORT` env var)
- **Features:**
  - CORS configuration
  - Centralized error handling via shared `@packages/error-handler`
  - Docker support with auto-generated Dockerfile
- **Build tool:** esbuild

---

## Packages

### `@packages/error-handler`

A shared error handling library providing typed error classes and an Express error middleware.

**Error Classes:**

| Class              | HTTP Status | Default Message                              |
| ------------------ | ----------- | -------------------------------------------- |
| `AppError`         | (custom)    | Base error class                             |
| `NotFoundError`    | 404         | Resource not found                           |
| `ValidationError`  | 400         | Invalid request data                         |
| `AuthError`        | 401         | Unauthorized access                          |
| `ForbiddenError`   | 403         | Invalid permissions                          |
| `ServerError`      | 500         | Internal Server Error                        |
| `RateLimitError`   | 429         | Too many requests, please try again later    |

**Usage:**

```typescript
import { AuthError } from '@packages/error-handler';
import { errorMiddleware } from '@packages/error-handler/error-middleware';

// Throw a typed error in any route/controller
throw new AuthError('Token expired');

// Register the middleware (must be last)
app.use(errorMiddleware);
```

### `@packages/middlewares`

Placeholder for shared middleware utilities — currently empty, ready for future additions.

---

## Getting Started

### Prerequisites

- **Node.js** — LTS version (v20+)
- **npm** — v10+
- **Docker** — *(optional, for containerized deployment)*

### Installation

```bash
# Clone the repository
git clone https://github.com/Kruskal892/E-Commerce-SaaS.git
cd E-Commerce-SaaS

# Install dependencies
npm install
```

### Development

```bash
# Start all services concurrently
npm run dev

# Or start individual services
npx nx serve api-gateway
npx nx serve auth-service
```

| Service       | URL                          |
| ------------- | ---------------------------- |
| API Gateway   | http://localhost:8080         |
| Auth Service  | http://localhost:6001         |

### Building

```bash
# Build all projects
npx nx run-many --target=build --all

# Build a specific service
npx nx build auth-service
npx nx build api-gateway
```

### Testing

```bash
# Run all unit tests
npx nx run-many --target=test --all

# Run tests for a specific project
npx nx test auth-service

# Run e2e tests
npx nx test auth-service-e2e
npx nx test api-gateway-e2e
```

### Linting

```bash
# Lint all projects
npx nx run-many --target=lint --all

# Lint a specific project
npx nx lint auth-service
```

---

## Docker

The auth service includes a Dockerfile for containerized deployment.

```bash
# Build the Docker image
npx nx docker:build auth-service

# Run the container
npx nx docker:run auth-service -p 3000:3000
```

---

## Nx Workspace Commands

```bash
# Visualize the project dependency graph
npx nx graph

# See available targets for a project
npx nx show project auth-service

# List installed Nx plugins
npx nx list
```

---

## Contributing

1. Create a feature branch from `master`
2. Follow the [Pull Request Template](./PULL_REQUEST_TEMPLATE.md)
3. Ensure builds, types, and lint pass before opening a PR

---

## License

This project is licensed under the [MIT License](./package.json).
