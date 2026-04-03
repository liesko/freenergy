# Zdieľaná Elektrina Platform

This is the monorepo for the Zdieľaná Elektrina platform, using Next.js (Frontend), NestJS (Backend), and Prisma (ORM).

## Project Structure

- `apps/web`: Next.js frontend application (App Router, properly structured with `RootLayout` and metadata).
- `apps/api`: NestJS backend application.
- `packages/database`: Shared database package containing the Prisma schema, client, and seeds.

## Prerequisites

- Node.js (v18+)
- pnpm (v9+)
- Pre-existing PostgreSQL database (`zdielana_energia`).

## Environment Setup

The platform centrally loads the environment variables from the root folder to ensure safe separation of concerns.

1. Ensure the root `.env` file is created according to `.env.example`.
2. The Database requires the following connection string inside your `.env`:
   `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zdielana_energia?schema=public"`
3. The platform uses HTTPOnly JWT cookies for local auth, requiring:
   `JWT_SECRET="super-secret-local-key"`
   `FRONTEND_URL="http://localhost:3000"`

## Authentication & App Shell Dashboard

The project uses a lightweight, secure custom JWT via HttpOnly cookies strategy:
- `POST /auth/register`: Create a new user (email, password).
- `POST /auth/login`: Issue an HttpOnly cookie holding the JWT.
- `POST /auth/logout`: Clears the cookie.
- `GET /auth/me`: Fetches the authenticated user (requires cookie).

For production resilience and seamless cross-site cookie handling, the Frontend operates as a **Proxy Bridge**. A Next.js API rewrite intercepts `/api/*` traffic and safely offloads it to the Railway/NestJS backend domain, fully preserving strict SameSite cookie policies without preflight CORS blocks.

### App Shell Architecture
The global Next.js Application utilizes a powerful App Shell decoupling mechanism:
- **Guests:** See the standard root `RootLayout` structure featuring a full-width informational Landing Page, and top-bar navigation linking to Login/Registration models.
- **Authenticated Users:** The global root intercepts the stored JWT footprint and transforms the physical DOM layout. Setting rendering states exclusively into a persistent **Left Sidebar** layout. Logged-in owners receive fully private modules containing `Skupiny`, `Pripojené miesta`, `Pozvánky`, `Dokumenty`, and `Reporting` entirely disconnected from public landing-page visuals.

### Document Management (Pripravuje sa)
A distinct administrative route securely hosting mandatory validation contracts (e.g., Zmluva o zdieľaní, Všeobecné obchodné podmienky) and regulatory filings. Currently initialized as a structural UI placeholder routing inside the authenticated App Shell.

## Protected Groups Foundation

A protected business entity known as `Group` exists representing an energy-sharing group explicitly owned by a Single User. This framework is expanded with a `Membership` model enabling multiple users to belong to the same group globally while persisting strict role segregation (`OWNER`, `MEMBER`). Furthermore, a `GroupInvitation` domain exists where owners can prospect and invite existing registered users securely.

**Exclusivity Rule Update:** Previously, users were limited to a single membership globally. This restriction is **now removed**. A user can create and own multiple Groups simultaneously, and maintain active `OWNER` or `MEMBER` roles across various groups securely. The exclusivity restriction now strictly applies to the **Asset layer**: a `MeteringPoint` (EIC) may belong to max ONE group at a time.
- **Endpoints:**
  - `POST /groups`: Create a group automatically attaching the JWT caller as the designated `ownerId` and generating an `OWNER` standard `Membership` record concurrently.
  - `GET /groups`: List all groups where the JWT caller exists actively inside the `Membership` array.
  - `GET /groups/:id`: Fetches a single group detail. Throws 404 cleanly if caller fails ID/membership access checks.
  - `GET /groups/:id/members`: Returns a curated profile list holding basic identity contexts for all established members attached to the specific group.
  - `POST /groups/:id/invitations`: Dispatches an internal invitation towards an existing user email (actionable only by OWNER).
  - `GET /invitations`: Fetches pending invitations addressed securely to the caller's JWT ID.
  - `POST /invitations/:id/accept` | `POST /invitations/:id/reject`: Resolves an invitation state atomically. **Note:** Acceptance drops a transaction-safe error if the user already holds any active membership globally, safely preserving the pending invitation.
- **Frontend Views:**
  - `/groups`: A protected RSC loading user groups with a fallback client-form for creation.
  - `/groups/[id]`: Protected detail component rendering metadata, exact membership list, and a conditionally exposed "Invite User Form" purely restricted to OWNERS.
  - `/invitations`: Dedicated action-view processing inbound requests natively. Shows readable business rules errors on restricted overlaps.
- **Future Preparations:** This explicitly lays down the framework to implement EIC-based hardware 'Join Requests' natively, decoupling users from their endpoints.
- **Intentionally Excluded:** Join requests, Discoverable/Public Groups, Configurable Pricing, Routing Search limits, advanced role management, and OKTE integration are explicitly bypassed in this iteration.

## Metering Points (EIC) Foundation & Asset Aggregation

A `MeteringPoint` fundamentally represents a physical energy asset on the platform identified by a globally unique 16-character EIC code.
- **What it represents:** Hardware endpoints classified as either `PRODUCTION` (Výrobné miesto) or `CONSUMPTION` (Odberné miesto).
- **Relation to User:** Each asset is currently strictly owned and isolated per `User`. A User can independently model multiple MeteringPoints.
- **Group Aggregation:** `Group` entities literally aggregate these physical `MeteringPoints` (via a nullable `groupId` link). This allows one hardware point to safely belong to max 1 active Group, while the Group natively collects inputs across boundaries.
- **Access Flow vs Asset Flow (Crucial Distinction):** Existing `Membership` purely grants user-level READ/INVITE access into the group. `MeteringPoint` assignment adds their actual hardware throughput into the shared collective.
- **Setup & Migrations:** If a new model version is pulled, developers must run `pnpm --filter database run migrate:dev --name add-group-metering-point-assignment` followed by `add-eic-based-join-requests`.
- **Local Testing:**
  1. Boot servers (`pnpm dev`).
  2. Map an EIC by navigating to `/metering-points` from the homepage.
  3. Create a Group or go to an existing managed `/groups/[id]` route.
  4. At the bottom of the group view, find the strictly controlled "Assign Asset" UI. Select the mapped EIC and verify it embeds into the Group, safely dropping from your available pool.

## Discoverability & Asset Intake Controls (Join Requests & Removals)

A Group can toggle its visibility on the network. Exploring discoverable groups unlocks the declarative EIC Join flow:
- Group Owners can toggle their Group explicitly as `PUBLIC (DISCOVERABLE)` or `PRIVATE` directly from their structural header UI.
- A user discovers a public group in the `Groups > Discover Public Groups` portal (`/groups/discover`).
- The user can select one of their *unassigned* and *non-pending* `MeteringPoints` to push as an official application logic via `POST /groups/:id/join-requests`.
- **Note:** If a `MeteringPoint` has an active pending request, it becomes completely unavailable for new requests to prevent ghost duplication states.
- The sender can transparently track their outgoing requests on their `/metering-points` page, which explicitly renders `PENDING IN: [Group]` or `ASSIGNED` badges directly.
- **Cancellation:** If an asset owner changes their mind, they can explicitly **CANCEL** their pending request directly from their `/metering-points` dashboard.
- The target Group's OWNER receives an asynchronous Request (visible inline on the detailed Group page).
- The transaction-safe `Approve` operation (`POST /join-requests/:id/approve`) officially assigns the targeted MeteringPoint into their platform structure and explicitly **CANCELLES** any other cross-domain pending requests or invitations for that exact hardware code.
- **Group-to-Asset Invitations:** Group Owners can proactively invite any existing, unassigned `MeteringPoint` (by submitting its EIC) into their group directly from the `/groups/[id]` interface (via `POST /groups/:id/metering-point-invitations`). 
- The Asset Owner will see these invitations in their dedicated Inbox (`/metering-point-invitations`) where they can accept or reject them. Acceptance securely binds the hardware to the Group and drops other pending requests.
- **Voluntary Leave:** Asset owners retain definitive control over their deployed hardware. They can freely click the `Leave Group` action located on their `/metering-points` page to unbind their origin instantly.
- **Evictions:** Conversely, Group Owners possess reciprocal power to aggressively remove/evict any foreign established `MeteringPoint` residing in their group immediately.
- **Group Policies:** Group owners can restrict asset onboarding natively by modifying operational policies (`PATCH /groups/:id/policies`) via the UI form inside their Group Details.
  - Controls include `isActive` (global operations toggle), `acceptsJoinRequests`, `acceptsInvitations`, and `acceptedMeteringPointTypes` (`BOTH`, `PRODUCTION_ONLY`, `CONSUMPTION_ONLY`).
  - Active and Type policies evaluate at the moment an explicitly inbound request or outbound invitation is created, blocking structural violations before they ever become `PENDING`.
- **Note:** This Asset Intake process runs in absolute parallel separation to standard User-only Email `Invitations` which provide standard Membership read/write scoping accesses!

## UI/UX Design Layer

The platform utilizes a lightweight, reusable design system built entirely on top of TailwindCSS, aiming for psychological engagement focusing on "Trust, Control, and Value".

- **Design Aesthetic:** Dark mode gradients featuring Glassmorphism cards (`backdrop-blur`). Colors are strictly mapped: Green (Energy/Assigned), Cyan/Blue (Tech/Available), Yellow (Pending), Red (Danger/Leave).
- **Reusable Components:**
  - `Card`: A fundamental container with `bg-white/5` and subtle borders.
  - `Badge`: Used extensively for tracking states (`AVAILABLE`, `PENDING`, `ASSIGNED`, `PUBLIC`).
  - `SectionHeader`: Structured typography with dynamic action areas and icons.
  - `Button`: Standardized action triggers (`primary`, `danger`, `outline`).

### Localization (Slovak)
The platform user interface (`apps/web`) and API error feedback (`apps/api`) are translated natively to Slovak.
- "Metering Point" is translated as **"Pripojené miesto"**.
- "EIC" remains natively **"EIC"** referencing standard identifiers.
All future frontend templates and API error returns should correspond to Slovak.

**Note on Prisma Workflow:**
By default, Prisma CLI expects an `.env` file locally. In this monorepo, we utilize `dotenv-cli` in `packages/database` to reliably load the root `.env`.

**Local Development Workflow:**
- `pnpm db:generate` - Generates Prisma client inside local `./node_modules`.
- `pnpm db:migrate` - Maps to `prisma migrate dev`. Used locally to generate new SQL migrations from `schema.prisma` changes and apply them to your database.
- `pnpm db:seed` - Seeds the local database idempotently (safe to re-run).

**CI/CD Deployment Workflow:**
- `pnpm db:deploy` - Maps to `prisma migrate deploy`. Used inside the deployment pipeline to safely apply pre-generated migrations without resetting data or checking for drifts.

### Historical Group Memberships Backfill

When the `Group` model transitioned from a simple `ownerId` architecture to a many-to-many `Membership` model, older existing group records lost visibility because they lacked an associated `Membership` row.
To safely fix this, a dedicated one-off backfill script is included.

- **What problem it fixes:** Restores visibility of historical groups to their original owners inside membership-based queries.
- **Why this cleanup exists:** Ensures data consistency without breaking existing applications running prior schema shapes.
- **How to run it:** 
  ```bash
  pnpm --filter database run backfill:memberships
  ```
- **Idempotency:** The script is completely safe to run multiple times. It exclusively adds an `OWNER` membership row only if one does not already explicitly exist for the exact `[userId, groupId]` pair in question.
- **When it should be used:** Immediately after deploying the Membership architecture to a database holding legacy Groups.

## Local Startup

1. **Install dependencies:**
    ```bash
    pnpm install
    ```

2. **Generate Prisma Client and Initialize Database:**
    ```bash
    pnpm db:generate
    pnpm db:migrate
    ```

3. **Start the Development Servers:**
    ```bash
    pnpm dev
    ```
    This command relies on `pnpm --parallel -r dev` to concurrently boot:
    - Web (Next.js) at `http://localhost:3000`
    - API (NestJS) at `http://localhost:3001`

    If you wish to run services individually:
    - `pnpm --filter web dev`
    - `pnpm --filter api dev`

## CI/CD Foundation

This repository contains a baseline `.gitlab-ci.yml` file supporting:
- Linting
- Application Building (Next.js cache & Dist API)
- Test Placeholders
- Database Migrations

## Intentionally Excluded

As this is purely the technical foundation, the following features are not yet implemented:
- External integrations (OKTE).
- Aggregated financial tracking and specific Notification events.
