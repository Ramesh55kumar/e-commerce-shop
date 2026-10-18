# Morrow — e-commerce starter

A clean, editorial storefront starter using **Next.js + Bootstrap 5**, **Java 25 (LTS) + Spring Boot 4 + JWT**, and **MySQL**.

## Project structure

- `frontend/` — responsive Next.js storefront; API-backed product catalog, filters, search, local cart, account sign-in, and demo-only test-card checkout.
- `backend/` — Spring Boot REST API; product listing, registration/login, BCrypt passwords, stateless JWT-protected account endpoint.
- `docker-compose.yml` — local MySQL 8.4 service.

## Preview the storefront

Requires Node.js 24 LTS or later. In PowerShell, use Corepack with the checked-in pnpm lockfile:

```powershell
Set-Location frontend
corepack.cmd pnpm install --frozen-lockfile
corepack.cmd pnpm run dev
```

Open http://localhost:3000. Start the API and database to load the seeded products. Checkout is a UI demo only: it uses a displayed test card, does not collect card details, and does not process or charge a payment.

## Run the API and database

In the project root, start MySQL:

```powershell
docker compose up -d mysql
```

Then start Spring Boot in another terminal:

```powershell
cd backend
mvn spring-boot:run
```

Requires Maven 3.6.3 or later and Java 25 (LTS). The API listens on http://localhost:8080.

### API routes

- `GET /api/products` — public product list
- `GET /api/products/{id}` — public product detail
- `POST /api/auth/register` — create account; JSON `{ "email": "you@example.com", "password": "at-least-8-chars" }`
- `POST /api/auth/login` — returns a signed bearer token
- `GET /api/account/me` — protected; send `Authorization: Bearer <token>`

For a real deployment, set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and a private random Base64 `JWT_SECRET` (at least 256 bits). Replace `ddl-auto: update` with schema migrations, add rate limits and refresh-token/logout handling, configure production CORS, and connect checkout to a payment provider. The included DB and JWT defaults are only for local development.
