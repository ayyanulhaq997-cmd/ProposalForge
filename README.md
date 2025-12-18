# StayHub - Property Rental Platform

A full-stack property rental platform built with React, Express.js, and PostgreSQL.

## 📁 Project Structure

```
stayhub/
├── frontend/              # React + Vite frontend
│   ├── src/
│   ├── index.html
│   ├── vite.config.ts
│   └── README.md
├── backend/               # Express.js backend
│   ├── routes.ts
│   ├── storage.ts
│   ├── shared/           # Shared types/schemas
│   └── README.md
├── package.json           # Root dependencies
└── README.md             # This file
```

## 🎯 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd stayhub
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database and API credentials
```

4. **Initialize database**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🏗️ Architecture

### Frontend (`/frontend`)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with shadcn/ui
- **State Management**: TanStack React Query
- **Forms**: React Hook Form
- **Routing**: Wouter
- **Language**: TypeScript

### Backend (`/backend`)
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas
- **Authentication**: Passport.js with local and OAuth strategies
- **Language**: TypeScript

### Shared (`/backend/shared`)
- **schema.ts**: Centralized data models and Zod schemas
- Used by both frontend and backend for type safety

## 🔄 Data Flow

```
Browser Request
    ↓
Frontend (React Component)
    ↓
API Call to /api/*
    ↓
Backend (Express Route)
    ↓
Validation (Zod)
    ↓
Storage Layer
    ↓
Database (PostgreSQL)
    ↓
Response → Browser
```

## 🚀 Available Scripts

### Development

```bash
npm run dev              # Start dev server (frontend + backend)
npm run dev:client       # Frontend only
npm run dev:server       # Backend only
```

### Database

```bash
npm run db:push          # Apply schema changes
npm run db:generate      # Generate migration
npm run db:studio        # Open Drizzle Studio
```

### Production

```bash
npm run build            # Build for production
npm run start            # Start production server
```

## 📚 Features

- **Property Listings**: Browse and search properties
- **Bookings**: Reserve properties with date selection
- **Host Dashboard**: Manage listings and bookings
- **User Authentication**: Secure login/signup
- **Payment Processing**: Stripe and Square integration
- **User Profiles**: Edit profile and verification
- **Admin Panel**: Manage users and content
- **Multilingual**: English and Spanish support

## 🔐 Security

- Password hashing with bcrypt
- Session-based authentication
- CSRF protection
- Input validation with Zod
- SQL injection prevention via ORM
- Environment variables for secrets

## 💳 Payment Integration

Supports Stripe and Square payment gateways:
- Set environment variables: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
- Or configure Square API credentials

## 📱 Responsive Design

Mobile-first responsive design supporting:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🌐 Internationalization

- English (default)
- Spanish

Switch languages using the theme toggle in the app header.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

[Add your license here]

## 📞 Support

For support, contact: support@stayhub.com

## 🎓 API Documentation

For detailed API documentation, see `backend/README.md`

## 📦 Dependencies

See `package.json` for complete dependency list including:
- Frontend UI libraries
- Backend utilities
- Database tools
- Authentication libraries
- Payment processing libraries
