# Project Structure - StayHub Vacation Rental Platform

```
stayhub/
├── client/                          # Frontend React Application
│   └── src/
│       ├── pages/                  # Page components
│       │   ├── Home.tsx           # Home page with featured properties
│       │   ├── Properties.tsx      # Properties listing with search
│       │   ├── PropertyDetail.tsx  # Individual property details
│       │   ├── Booking.tsx         # Booking flow (3-step)
│       │   ├── Payment.tsx         # Payment processing page
│       │   ├── AdminDashboard.tsx  # Admin panel with 7 features
│       │   ├── HostDashboard.tsx   # Host dashboard
│       │   ├── UserDashboard.tsx   # User dashboard
│       │   ├── Login.tsx           # Login page
│       │   ├── Register.tsx        # Registration page
│       │   ├── Favorites.tsx       # Saved properties
│       │   └── not-found.tsx       # 404 page
│       │
│       ├── components/
│       │   ├── ui/                 # Shadcn UI components (auto-generated)
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── form.tsx
│       │   │   ├── input.tsx
│       │   │   └── ... (20+ more)
│       │   │
│       │   ├── SquarePaymentForm.tsx      # Square payment integration
│       │   ├── DateRangeSelector.tsx      # Calendar date picker
│       │   ├── PropertyCard.tsx           # Property grid card
│       │   ├── PropertyGallery.tsx        # Image carousel
│       │   ├── SearchBar.tsx              # Advanced search
│       │   ├── AdminSeasonalPricing.tsx   # Seasonal pricing manager
│       │   ├── AdminAuditLog.tsx          # Audit log viewer
│       │   ├── AdminChatFiles.tsx         # Chat file management
│       │   ├── AdminCalendarSync.tsx      # iCal sync
│       │   ├── AdminPushNotifications.tsx # Notifications config
│       │   ├── AdminRoomBlocking.tsx      # Room blocking UI
│       │   ├── AdminUserImpersonation.tsx # Impersonation control
│       │   ├── ThemeToggle.tsx            # Dark/light mode
│       │   ├── LanguageSelector.tsx       # English/Spanish
│       │   ├── ImageWithFallback.tsx      # Lazy image loading
│       │   └── ... (more components)
│       │
│       ├── lib/
│       │   ├── queryClient.ts      # React Query configuration
│       │   ├── authUtils.ts        # Authentication helpers
│       │   ├── i18n.ts             # Internationalization
│       │   └── utils.ts            # Utility functions
│       │
│       ├── hooks/
│       │   └── use-toast.ts        # Toast notifications
│       │
│       ├── App.tsx                 # Main app with routing
│       ├── index.css               # Global styles & CSS variables
│       └── main.tsx                # Entry point
│
├── server/                          # Express Backend
│   ├── index.ts                    # Express server setup
│   ├── index-prod.ts               # Production build entry
│   ├── vite.ts                     # Vite dev server setup
│   ├── routes.ts                   # All 40+ API endpoints
│   ├── storage.ts                  # Data persistence layer
│   └── websocket.ts                # WebSocket chat setup
│
├── shared/                          # Shared Types & Schemas
│   └── schema.ts                   # Zod schemas + TypeScript types
│
├── public/                          # Static assets
│   ├── favicon.png
│   └── ...
│
├── dist/                            # Build output
│   ├── public/                      # Frontend bundle
│   └── index.js                     # Server bundle
│
├── Configuration Files
│   ├── package.json                # Dependencies & scripts
│   ├── tsconfig.json               # TypeScript config
│   ├── tailwind.config.ts          # Tailwind CSS config
│   ├── vite.config.ts              # Vite bundler config
│   ├── drizzle.config.ts           # Database config
│   └── .env.example                # Environment template
│
├── Documentation Files
│   ├── README.md                   # Main documentation
│   ├── SETUP_GUIDE.md              # Installation instructions
│   ├── API_DOCUMENTATION.md        # API endpoints & examples
│   ├── DEPENDENCIES.md             # All libraries & versions
│   ├── PROJECT_STRUCTURE.md        # This file
│   ├── SQUARE_SETUP.md             # Payment integration guide
│   ├── FINAL_CHECKLIST.md          # Feature completion
│   └── REQUIREMENTS_COMPLETION.md  # Requirements verification

```

## Key Directories Explained

### `/client/src/pages` - Page Components
- **Home.tsx** - Hero section, featured properties, featured carousel
- **Properties.tsx** - Property listing with advanced filters & search
- **PropertyDetail.tsx** - Property details, gallery, pricing panel
- **Booking.tsx** - 3-step booking flow: select dates → payment → confirmation
- **Payment.tsx** - Square payment form with card tokenization
- **AdminDashboard.tsx** - Master control panel with 7 feature tabs
- **HostDashboard.tsx** - Host property management
- **UserDashboard.tsx** - User bookings, stats, history

### `/client/src/components` - Reusable Components
- **UI Components** - Shadcn/Radix UI (20+ components)
- **SquarePaymentForm.tsx** - PCI-compliant payment processing
- **DateRangeSelector.tsx** - Calendar with date validation
- **SearchBar.tsx** - Location, category, price, type filters
- **Admin Features** - 7 feature modules with data tables

### `/server` - Backend Logic
- **index.ts** - Express server, middleware setup, static files
- **routes.ts** - 40+ API endpoints for all operations
- **storage.ts** - In-memory storage with database fallback
- **websocket.ts** - Real-time chat messaging

### `/shared` - Shared Definitions
- **schema.ts** - Database schemas (Drizzle ORM), Zod validation schemas, TypeScript interfaces

### `Database Schema` (PostgreSQL)
```sql
Tables:
- users (id, email, password, role, language, preferences)
- properties (id, title, location, description, pricePerNight, images, amenities, cleaningFee)
- bookings (id, propertyId, userId, checkIn, checkOut, status, totalPrice, paymentId)
- messages (id, senderId, receiverId, content, timestamp)
- auditLogs (id, userId, action, target, details, timestamp)
- seasonalPricingRules (id, propertyId, startDate, endDate, multiplier)
- chatFiles (id, messageId, filename, type, size, url)
- iCalCalendars (id, propertyId, calendarUrl, type)
- pushNotifications (id, userId, type, enabled)
- availability (id, propertyId, date, isAvailable)
- favorites (id, userId, propertyId)
- reviews (id, propertyId, userId, rating, comment)
```

## Build & Deployment

### Build Process
```bash
npm run build
# Output: ./dist/
#   - dist/public/          (Frontend bundle)
#   - dist/index.js         (Server bundle)
```

### Development
```bash
npm run dev
# Runs Vite dev server + Express with hot reload
# http://localhost:5000
```

### Environment Variables
```bash
# .env or environment configuration
DATABASE_URL=postgresql://...
VITE_SQUARE_APPLICATION_ID=your_id
VITE_SQUARE_LOCATION_ID=your_location
SQUARE_ACCESS_TOKEN=your_token
SESSION_SECRET=random_string
```

## Technology Stack

**Frontend:**
- React 18.2+ with TypeScript
- Tailwind CSS + Shadcn UI
- React Query v5 (data fetching)
- Wouter (routing)
- react-hook-form (forms)
- Framer Motion (animations)
- Embla Carousel (image gallery)
- Lucide Icons

**Backend:**
- Express.js
- PostgreSQL (Neon)
- Drizzle ORM
- Zod (validation)
- WebSocket (real-time chat)
- Bcrypt (password hashing)

**Build Tools:**
- Vite (frontend bundler)
- esbuild (server bundler)
- TypeScript (type safety)
- Tailwind CSS (styling)

**Payment:**
- Square Web Payments SDK
- PCI DSS compliant tokenization

## Installation & Setup

See `SETUP_GUIDE.md` for detailed installation instructions.

Quick Start:
```bash
npm install
npm run dev
# Visit http://localhost:5000
```

## API Endpoints

See `API_DOCUMENTATION.md` for complete endpoint documentation with examples.

Total: 40+ endpoints covering properties, bookings, payments, users, admin features.

## Deployment

See `SETUP_GUIDE.md` > "Deploy to Production" section.

Supports:
- Replit hosting
- Railway
- Vercel (frontend) + separate backend
- Traditional VPS/Cloud servers
