# StayHub Frontend

React + Vite frontend for the StayHub property rental platform.

## 📁 Structure

```
frontend/
├── src/
│   ├── pages/           # Page components (routed)
│   ├── components/      # Reusable UI components
│   │   └── ui/         # shadcn/ui components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and API client
│   ├── i18n/           # Translations (Spanish/English)
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML template
└── vite.config.ts      # Vite configuration
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Key Technologies

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **React Query** - Data fetching
- **React Hook Form** - Form handling
- **Wouter** - Lightweight router

## 🔑 Features

- Property search and filtering
- User authentication
- Booking management
- Host dashboard
- Profile management
- Payment integration (Stripe/Square)
- Spanish language support

## 🔗 API Communication

The frontend communicates with the backend via REST API at `/api/*` endpoints. The development server proxies requests to the backend automatically.

## 🎨 Theming

- Light/Dark mode support
- Tailwind CSS with custom color scheme
- Responsive design

## 🌐 Internationalization

Spanish translations are managed in `src/i18n/translations.ts`. Switch languages using the theme toggle.
