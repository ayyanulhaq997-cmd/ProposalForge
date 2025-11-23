# Design Guidelines: StayHub Vacation Rental Platform

## Design Philosophy
**Vibrant. Professional. Human-Centered.**

StayHub combines professional minimalism with vibrant energy. The platform feels modern and trustworthy through clean layouts, generous spacing, and purposeful color accents. Every interaction is smooth and delightful, creating confidence without corporate coldness.

---

## Brand Identity

**Name:** StayHub
**Logo:** Rounded icon with elegant wordmark - displays in header and admin sidebar
**Language:** Spanish throughout (Inicio, Propiedades, Favoritos, Mensajes, Reservas, etc.)
**Voice:** Professional, welcoming, trustworthy

---

## Color System

**Primary Pink:** #E91E63 (vibrant magenta)
- Primary CTAs, active states, highlights
- Use confidently on buttons and key interactions
- Never diluted or muted

**Secondary Purple:** #9C27B0
- Admin sidebar navigation
- Active navigation items
- Secondary accents and backgrounds

**Neutrals:**
- Background: Pure white (#FFFFFF)
- Cards: White with subtle shadow
- Text: Charcoal gray (#2C2C2C)
- Borders: Light gray (#E5E5E5)
- Disabled: Medium gray (#9E9E9E)

**Supporting Colors:**
- Success green for confirmations
- Warning amber for alerts
- Error red for validations
- Info blue for notifications

---

## Typography

**Font Family:** Inter (clean, modern, readable)

**Hierarchy:**
- Hero: text-5xl md:text-6xl, font-bold
- Page Headers: text-4xl, font-semibold
- Section Headers: text-2xl md:text-3xl, font-semibold
- Card Titles: text-xl, font-semibold
- Body: text-base, font-normal, leading-relaxed
- Small Text: text-sm, font-medium
- Metadata: text-xs, font-regular

---

## Layout & Spacing

**Spacing Scale:** Tailwind units 2, 4, 6, 8, 12, 16, 20

**Container Widths:**
- Public pages: max-w-7xl mx-auto px-4 md:px-8
- Admin dashboard: max-w-screen-2xl with purple sidebar
- Forms: max-w-2xl mx-auto

**Section Padding:**
- Public pages: py-12 md:py-20
- Dashboard sections: py-8 md:py-12
- Cards: p-6

**Grids:**
- Property listings: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
- Dashboard stats: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4

---

## Component Design

### Cards
- Background: White
- Border: 1px solid #E5E5E5
- Rounded: rounded-lg (8px)
- Shadow: shadow-sm (subtle elevation)
- Hover: shadow-md + scale-101 (200ms ease-in-out)
- Padding: p-6

### Buttons
**Primary (Pink):**
- Background: #E91E63
- Text: White, font-semibold
- Padding: px-6 py-3 (h-12)
- Rounded: rounded-lg
- Hover: brightness increase + shadow-md
- Active: slight scale-down

**Secondary (Outlined):**
- Border: 2px solid #E91E63
- Text: #E91E63, font-semibold
- Background: transparent
- Hover: background pink with white text

**Hero Buttons (on images):**
- Background: rgba(255,255,255,0.9) with backdrop-blur-md
- Text: #2C2C2C, font-semibold
- No special hover states (button inherits default)

### Property Cards
- Image: aspect-video, rounded-t-lg, object-cover
- Content padding: p-4
- Title: text-lg font-semibold, truncate
- Location: text-sm text-gray-600 with map pin icon
- Rating: Yellow stars (★★★★☆) + number (4.8)
- Price: text-xl font-bold + "€/noche" in text-sm
- Favorite icon: Heart outline, top-right absolute position

### Forms & Inputs
- Height: h-12
- Border: 1px solid #E5E5E5
- Rounded: rounded-lg
- Padding: px-4
- Focus: ring-2 ring-pink-500
- Placeholder: text-gray-400

### Search Bar (Homepage Hero)
- Large centered component
- Rounded-full or rounded-lg
- White background with shadow-lg
- Internal sections: Ubicación | Fechas | Huéspedes | Search button
- Dividers: Subtle vertical lines
- Search button: Pink background with icon

---

## Admin Interface

### Purple Sidebar Navigation
- Background: #9C27B0
- Width: 240px on desktop, collapsible on mobile
- Logo: StayHub branding at top
- Navigation items: White text with icons (Lucide)
- Active item: Lighter purple background (#B44AC0) with white text
- Hover: Subtle white overlay (rgba(255,255,255,0.1))
- Icons: h-5 w-5, aligned left with text

### Stat Cards
- Grid layout across top of dashboard
- Colored icon backgrounds (pink, purple, blue, green circles)
- Large number display (text-3xl font-bold)
- Label below (text-sm text-gray-600)
- White background, shadow-sm

---

## Images

**Homepage Hero:**
- Full-width image showcasing beautiful vacation rental
- Overlay: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.1))
- Centered search bar with blurred button backgrounds
- Height: 60vh to 80vh

**Property Images:**
- High-quality photography of rentals
- Aspect ratio: 16:9 (aspect-video)
- Rounded corners on cards
- Gallery view: Grid of 4-6 images, lightbox on click

**Placeholder Images:**
- Soft gradient background with house icon when missing
- Never broken image states

---

## Interactions & Animations

**Standard Transitions:** 200ms ease-in-out

**Hover Effects:**
- Cards: scale-101 + shadow-md
- Buttons: brightness-110
- Links: underline appears
- Images: zoom-105 (overflow-hidden on container)

**Micro-Interactions:**
- Favorite heart: Scale bounce when toggled
- Notifications: Slide from top-right
- Loading: Skeleton pulse animation
- Success states: Checkmark with fade-in

**Scroll Animations:**
- Elements fade up as they enter viewport (subtle)
- Parallax on hero image (minimal, 0.5 speed)

---

## Responsive Behavior

**Mobile (<768px):**
- Single column layouts
- Sidebar becomes bottom nav or hamburger
- Stack all grids vertically
- Touch targets minimum 44px
- Reduced padding (py-8 instead of py-12)

**Tablet (768px-1024px):**
- 2-column property grids
- Sidebar collapses to icons only
- Moderate spacing

**Desktop (>1024px):**
- Full multi-column layouts
- Persistent sidebar navigation
- Maximum component widths enforced
- Generous spacing throughout

---

## Accessibility

- WCAG AA contrast compliance
- Focus states: 2px ring in pink
- Screen reader labels in Spanish
- Keyboard navigation throughout
- Alt text on all images
- Form validation with clear messaging

---

## Technical Specifications

- Icons: Lucide React (outline style)
- Shadows: Layered, never harsh (shadow-sm, shadow-md, shadow-lg)
- Border radius: rounded-lg (8px) standard
- Transitions: GPU-accelerated transforms
- Z-index scale: 10, 20, 30, 40, 50 (modals highest)