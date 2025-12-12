# StayHub Vacation Rental Platform

## Overview

StayHub is a full-stack vacation rental platform built with React, TypeScript, Express, and PostgreSQL. It provides a complete booking ecosystem with multi-role authentication (guest/host/admin), real-time messaging, payment processing via Stripe and Square, and comprehensive property management capabilities. The platform features 51+ production-ready features including seasonal pricing, ID verification, audit logging, and push notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state, React hooks for local state
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom theme system supporting light/dark modes
- **Build Tool**: Vite for fast development and optimized production builds
- **Design System**: Custom design guidelines with Inter font family, primary gradient (#E91E63 to #D91E6F), and premium aesthetics

**Key Frontend Decisions**:
- Lazy loading for admin/host pages to improve initial load performance
- Custom `ImageWithFallback` component handles missing images gracefully
- Theme provider supports light/dark/system modes with localStorage persistence
- Query client configured with `staleTime: Infinity` to minimize refetching
- Spanish language support built-in (i18n system with EN/ES translations)

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database queries
- **Session Management**: express-session with PostgreSQL session store (connect-pg-simple)
- **Authentication**: Dual strategy - local authentication (bcrypt) and OAuth (Replit OAuth/OpenID Connect)
- **API Design**: RESTful endpoints with role-based access control middleware

**Key Backend Decisions**:
- Separate dev (`index-dev.ts`) and production (`index-prod.ts`) entry points
- Development mode uses Vite middleware for HMR
- Production mode serves pre-built static files from `dist/public`
- Modular service architecture: `storage.ts` (database layer), `paymentService.ts`, `mediaService.ts`, `notificationService.ts`
- Role guard middleware (`rolesGuard.ts`) enforces RBAC on protected routes
- Verification middleware (`verificationMiddleware.ts`) requires ID verification for sensitive operations

### Database Architecture
- **Database**: PostgreSQL (supports both Neon serverless and standard PostgreSQL)
- **Connection**: Adaptive pool selection - NeonPool for Neon databases, standard pg Pool for Railway/other providers
- **Schema Management**: Drizzle Kit for migrations
- **Schema Design**: 
  - Multi-table architecture with relations defined via Drizzle ORM
  - Session storage table required for authentication
  - User profiles support guest/host/admin roles with verification status tracking
  - Properties have complex metadata (amenities, images, pricing rules)
  - Bookings track status, payments, and special requests
  - Conversations and messages for real-time chat with file upload support
  - Audit logs for compliance and tracking
  - Seasonal pricing rules, favorites, reviews, notifications

**Key Database Decisions**:
- UUIDs for primary keys using `gen_random_uuid()`
- JSONB columns for flexible metadata (amenities, images, custom fields)
- Cascading deletes where appropriate
- Index on session expiry for performance
- Separate tables for seasonal pricing rules and calendar sync (iCal)

### Authentication & Authorization
- **Local Auth**: Email/password with bcrypt hashing (10 rounds)
- **OAuth**: OpenID Connect via Replit (configurable issuer URL)
- **Session Strategy**: Server-side sessions stored in PostgreSQL (7-day TTL)
- **Role-Based Access Control**: Three roles (guest, host, admin) enforced via middleware
- **Verification System**: ID verification required for booking and hosting features

**Security Considerations**:
- CSRF protection via session cookies
- SQL injection prevention through parameterized queries (Drizzle ORM)
- XSS protection via React's built-in escaping
- Passwords never stored in plain text
- Session secrets required via environment variables

### Payment Processing
- **Primary Gateway**: Stripe with React Stripe.js integration
- **Secondary Gateway**: Square SDK support
- **Payment Flow**: 
  1. Create booking with pending status
  2. Generate payment intent/token
  3. Process payment client-side
  4. Webhook confirms payment server-side
  5. Finalize booking and update availability
- **Compliance**: PCI DSS Level 1 compliant (uses hosted payment fields)
- **Features**: Supports payment intents, refunds, commission calculation, host payouts

**Key Payment Decisions**:
- Webhook route registered BEFORE `express.json()` middleware to preserve raw body
- Payment finalization validates amount matches booking total
- Commission calculated as percentage (15% default)
- Host payout tracking with earnings dashboard
- Audit logging for all payment events

### Real-Time Features
- **Chat System**: Messages stored in database with conversation threads
- **File Uploads**: Chat file attachments supported (images, documents)
- **Typing Indicators**: Client-side simulation (no WebSocket overhead)
- **Push Notifications**: Database-backed notification system with optional SMS via Twilio

**Key Real-Time Decisions**:
- No WebSocket implementation (reduces infrastructure complexity)
- Polling-based updates via React Query's refetch intervals
- Notification service can integrate with external push providers

### Media & Storage
- **Current Implementation**: In-memory file storage with mock URLs (MVP)
- **Production Ready**: Service layer designed for S3/Google Cloud Storage integration
- **Image Handling**: Fallback system for missing/broken images
- **File Types**: Images (property photos), videos, documents (ID verification, chat files)

**Extensibility**:
- `mediaService.ts` provides abstraction layer for storage backends
- URLs stored in database, actual files can be migrated to cloud storage
- Image optimization and CDN integration can be added without schema changes

## External Dependencies

### Payment Providers
- **Stripe**: Requires `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` environment variables
- **Square**: Optional, uses Replit connector or environment variables
- **Webhook Endpoints**: `/api/stripe/webhook` for payment confirmations

### Database
- **PostgreSQL**: Required, supports Neon serverless and standard PostgreSQL
- **Connection String**: `DATABASE_URL` environment variable
- **Version**: PostgreSQL 12+ recommended
- **Extensions**: None required (uses standard SQL features)

### Authentication Services
- **Replit OAuth**: Optional, configured via `ISSUER_URL` and `REPL_ID`
- **Local Auth**: Always available as fallback
- **Session Storage**: Requires `SESSION_SECRET` environment variable

### Third-Party Integrations
- **Twilio** (Optional): SMS notifications via `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- **iCal Sync** (Implemented): External calendar integration for Airbnb/VRBO availability sync
- **Google Fonts**: Preconnect to fonts.googleapis.com for Inter font family

### Development Tools
- **Vite**: Dev server and build tool with Replit-specific plugins
- **Drizzle Kit**: Database migrations and schema push
- **TypeScript**: Full type safety across frontend and backend
- **ESLint/Prettier**: Code quality (configured via package.json scripts)

### Deployment Platforms
- **Vercel**: Supported via `vercel.json` configuration (serverless functions)
- **Replit**: Native support with Replit-specific plugins and connectors
- **Railway/Render**: Standard Node.js deployment compatible
- **AWS/GCP/Azure**: Compatible with any Node.js hosting environment

### Environment Variables Required
```
DATABASE_URL=postgresql://...
SESSION_SECRET=random-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NODE_ENV=production|development
```

### Optional Environment Variables
```
ISSUER_URL=https://replit.com/oidc
REPL_ID=replit-app-id
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Build & Deployment
- **Production Build**: `npm run build` creates optimized bundle in `dist/`
- **Database Setup**: `npm run db:push` applies Drizzle schema to database
- **Start Production**: `npm start` runs compiled server from `dist/index.js`
- **Static Assets**: Served from `dist/public` in production mode

## Payment Integration Setup

### Stripe Setup (Primary Gateway)

1. **Create Stripe Account**: Sign up at https://dashboard.stripe.com/register

2. **Get API Keys**:
   - Go to Dashboard → Developers → API keys
   - Copy `Publishable key` (starts with `pk_test_` or `pk_live_`)
   - Copy `Secret key` (starts with `sk_test_` or `sk_live_`)

3. **Set Environment Variables**:
   ```
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   ```

4. **Configure Webhook** (for payment confirmations):
   - Go to Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events: `payment_intent.succeeded`, `checkout.session.completed`
   - Copy webhook secret and set: `STRIPE_WEBHOOK_SECRET=whsec_your_secret`

5. **Test Mode**: Use test keys for development. Test card: `4242 4242 4242 4242`

### Square Setup (Secondary Gateway)

1. **Create Square Developer Account**: Sign up at https://developer.squareup.com

2. **Create Application**:
   - Go to Applications → Create Application
   - Copy Application ID and Access Token

3. **Set Environment Variables**:
   ```
   SQUARE_ACCESS_TOKEN=your_access_token
   SQUARE_APPLICATION_ID=your_application_id
   SQUARE_LOCATION_ID=your_location_id
   SQUARE_ENVIRONMENT=sandbox (or production)
   ```

4. **Get Location ID**:
   - Go to Square Dashboard → Locations
   - Copy the Location ID for your business

5. **Sandbox Testing**: Use sandbox credentials for development before going live

### Payment Flow

1. Guest selects property and dates
2. System creates booking with `pending` status
3. Payment form collects card details (Stripe Elements)
4. Payment intent created and processed
5. On success, booking status updates to `confirmed`
6. Host receives notification of new booking
7. Commission (15% default) calculated and tracked

### Refund Processing

Refunds are handled through the admin dashboard or can be triggered via the API:
- Full refunds: Original payment amount returned
- Partial refunds: Specify amount to refund
- Cancellation fees can be configured per property