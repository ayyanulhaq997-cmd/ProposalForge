# StayHub Backend

Express.js backend API for the StayHub property rental platform.

## 📁 Structure

```
backend/
├── index-dev.ts           # Development entry point
├── index-prod.ts          # Production entry point
├── app.ts                 # Express app setup
├── db.ts                  # Database connection
├── routes.ts              # API route definitions
├── storage.ts             # Data layer/storage
├── shared/                # Shared types and schemas
├── services/              # Business logic
│   └── notificationService.ts
├── localAuth.ts           # Local authentication
├── replitAuth.ts          # Replit auth integration
├── paymentService.ts      # Payment processing
├── mediaService.ts        # Image/file handling
└── drizzle.config.ts      # Database ORM config
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create .env file (see .env.example)
cp .env.example .env

# Run database migrations
npm run db:push

# Start development server
npm run dev

# Build for production
npm run build
```

## 📦 Key Technologies

- **Express.js** - Web framework
- **PostgreSQL** - Database (via Neon)
- **Drizzle ORM** - Type-safe database queries
- **Zod** - Schema validation
- **TypeScript** - Type safety
- **Passport.js** - Authentication

## 🗄️ Database

Uses PostgreSQL with Drizzle ORM. Database schema is defined in `../shared/schema.ts`.

### Migrations

```bash
# Create migration
npm run db:generate

# Apply migrations
npm run db:push

# Force push (careful!)
npm run db:push -- --force

# View database studio
npm run db:studio
```

## 🔐 Authentication

Supports:
- Local username/password authentication
- Replit OAuth integration
- Session-based auth with postgres-session-store

## 💳 Payment Processing

Integrated with:
- Stripe
- Square

Set `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` environment variables to enable.

## 🗂️ API Endpoints

All endpoints are under `/api/` prefix:

- `GET /api/auth/user` - Get current user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/properties` - List properties
- `POST /api/properties` - Create property (host)
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- And many more...

See `routes.ts` for complete API documentation.

## 🔄 Data Flow

1. Client sends request to `/api/*`
2. Route handler validates request with Zod
3. Storage layer performs CRUD operations
4. Database transaction executed
5. Response sent back to client

## 📨 Email & Notifications

Uses `notificationService` for:
- Email notifications
- SMS alerts
- Push notifications

## 🌍 Deployment

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host/dbname

# Authentication
SESSION_SECRET=your-secret-key

# Stripe (optional)
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...

# Replit Auth (optional)
REPLIT_CLIENT_ID=...
REPLIT_CLIENT_SECRET=...
```

### Production Build

```bash
npm run build
npm run start
```

The app runs on port 5000 by default.
