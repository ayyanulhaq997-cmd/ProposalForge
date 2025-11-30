# Design Guidelines: StayHub Vacation Rental Platform

## Design Philosophy
**Modern. Smooth. Premium.**

StayHub features smooth transitions, premium aesthetics, and modern interactions inspired by contemporary service platforms. Every element flows naturally with elegant animations, clean spacing, and purposeful design that builds trust and encourages bookings.

---

## Brand Identity

**Name:** StayHub  
**Logo:** Rounded icon with elegant wordmark - premium placement in header  
**Language:** Spanish throughout (Inicio, Propiedades, Favoritos, Mensajes, Reservas, etc.)  
**Voice:** Professional, welcoming, premium yet approachable

---

## Color System

**Primary Gradient:** #E91E63 to #D91E6F (vibrant magenta)
- Primary CTAs and interactive elements
- Use with confidence on buttons and key interactions
- Gradient overlays for hero sections

**Secondary Purple:** #9C27B0
- Admin sidebar navigation
- Secondary accents and highlights
- Active navigation states

**Neutrals:**
- Background: Pure white/off-white (#FFFFFF)
- Cards: White with premium shadow
- Text: Charcoal gray (#2C2C2C)
- Borders: Soft gray (#E8E8E8)
- Disabled: Light gray (#BDBDBD)

**Gradients:**
- Hero overlay: rgba(0,0,0,0.2) to rgba(0,0,0,0.05)
- Accent: Linear gradient from primary to secondary
- Background wash: Subtle gradient 135° with primary at 2-3% opacity

---

## Typography

**Font Family:** Inter (modern, highly readable, premium feel)

**Hierarchy:**
- Hero: text-5xl md:text-6xl lg:text-7xl, font-bold, letter-spacing-tight
- Page Headers: text-4xl font-bold
- Section Headers: text-2xl md:text-3xl font-semibold
- Card Titles: text-lg font-semibold
- Body: text-base font-normal, leading-relaxed
- Small Text: text-sm font-medium
- Metadata: text-xs font-regular

**Line Heights:** Generous for premium feel (relaxed on body, tight on headers)

---

## Layout & Spacing

**Spacing Scale:** 4, 8, 12, 16, 20, 24, 32px

**Container Widths:**
- Public pages: max-w-7xl mx-auto px-4 md:px-8
- Admin dashboard: max-w-screen-2xl with purple sidebar
- Forms: max-w-2xl mx-auto

**Section Padding:**
- Public hero: py-16 md:py-28 lg:py-36
- Public sections: py-12 md:py-20 lg:py-28
- Dashboard sections: py-8 md:py-12
- Cards: p-6 md:p-8

**Grids:**
- Property listings: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
- Dashboard stats: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- Features: grid-cols-1 md:grid-cols-3 gap-8

---

## Component Design

### Hero Sections
- Full-width with background image
- Overlay: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)
- Centered search/CTA components
- Height: 60vh to 70vh on desktop
- Smooth scroll fade-out effect

### Cards
- Background: White with premium shadow
- Border: 1px solid #E8E8E8
- Rounded: rounded-xl (12px for premium feel)
- Shadow: shadow-sm normally, shadow-lg on hover
- Hover: scale(1.02) + shadow-lg + smooth 300ms transition
- Padding: p-6 md:p-8
- Hover Effects: Smooth lift with shadow increase

### Buttons
**Primary (Pink Gradient):**
- Background: Linear gradient from #E91E63 to #D91E6F
- Text: White, font-semibold
- Padding: px-8 py-3 (h-12)
- Rounded: rounded-lg
- Hover: brightness(1.1) + shadow-lg
- Active: scale(0.98)
- Transition: 300ms cubic-bezier(0.4, 0, 0.2, 1)

**Secondary (Outlined):**
- Border: 2px solid #E91E63
- Text: #E91E63, font-semibold
- Background: transparent with hover to pink/10
- Hover: bg-pink-50 + border-pink-600
- Transition: 250ms ease-in-out

**Tertiary (Ghost):**
- No border, transparent background
- Text: #2C2C2C or primary color
- Hover: bg-gray-100
- Transition: 200ms

### Property Cards
- Image: aspect-video, rounded-t-xl, object-cover
- Content padding: p-6
- Title: text-lg font-semibold, truncate
- Location: text-sm text-muted-foreground with icon
- Rating: Gold stars (★★★★☆) + number (4.8)
- Price: text-xl font-bold + "€/noche" in text-sm
- Favorite icon: Heart outline, absolute top-right with 16px padding
- Hover: scale(1.03) + shadow-xl + smooth 300ms

### Forms & Inputs
- Height: h-12
- Border: 2px solid #E8E8E8
- Rounded: rounded-lg
- Padding: px-4
- Focus: border-primary, box-shadow with primary color
- Placeholder: text-muted-foreground
- Transition: border-color 200ms, box-shadow 200ms
- Background: white with subtle hover state (bg-gray-50)

### Search Bars
- Large, prominent component
- White background with shadow-lg
- Divided sections with vertical separators
- Search button: Pink gradient background
- Rounded: rounded-lg or rounded-full
- Height: h-14 md:h-16

---

## Admin Interface

### Purple Sidebar Navigation
- Background: #9C27B0 with subtle gradient
- Width: 240px on desktop, collapsible on mobile
- Navigation items: White text, font-medium
- Active item: bg-white/10 with rounded-md + left border accent
- Hover: bg-white/5 smooth transition
- Icons: h-5 w-5, aligned left with 12px spacing
- Transition: All 200ms ease-in-out

### Dashboard Cards
- Clean white cards with subtle borders
- Grid layout for stats
- Icon backgrounds: Gradient circles (pink, purple, blue, green)
- Large numbers: text-3xl font-bold
- Padding: p-6
- Hover: shadow-lg + scale(1.01)

---

## Animations & Transitions

**Standard Duration:** 300ms cubic-bezier(0.4, 0, 0.2, 1) (smooth easing)

**Fade-in:** 400ms opacity 0 to 1
**Slide-up:** 400ms transform translateY(20px) to translateY(0)
**Scale:** 300ms transform scale(1) to scale(1.02)
**Hover lift:** 250ms shadow-sm to shadow-lg

**Loading States:**
- Pulse animation on skeletons
- Spinner rotation smooth 1.5s

**Success/Error:**
- Toast notifications slide from top-right
- Success: Green checkmark with fade-in
- Error: Red icon with shake animation (light)

**Micro-interactions:**
- Favorite heart: Scale 1 to 1.2 on toggle
- Notification badge: Scale pulse on new message
- Button: Slight scale-down on press (0.95)

---

## Responsive Behavior

**Mobile (<768px):**
- Single column layouts
- Hero height: 50vh
- Section padding: py-8
- Card padding: p-4
- Touch targets: minimum 44px
- Sidebar: Bottom navigation or hamburger

**Tablet (768px-1024px):**
- 2-column property grids
- Sidebar collapses to icons
- Moderate spacing: py-12
- Card padding: p-6

**Desktop (>1024px):**
- Full multi-column layouts (3-4 columns)
- Persistent sidebar navigation
- Generous spacing: py-20 to py-28
- Maximum widths enforced
- Premium spacing throughout

---

## Visual Consistency

**Depth System:**
- Level 1: No shadow (text, icons)
- Level 2: shadow-sm (cards in context)
- Level 3: shadow-md (hovered cards)
- Level 4: shadow-lg (modals, dropdowns)
- Level 5: shadow-2xl (floating actions)

**Border Radius Scale:**
- Small elements: rounded-md (6px)
- Normal elements: rounded-lg (8px)
- Large elements: rounded-xl (12px)
- Buttons: rounded-lg (8px)

**Icon Style:** Lucide React outline icons, consistent 24px sizing

---

## Accessibility

- WCAG AA contrast compliance (minimum 4.5:1)
- Focus states: 2px ring in primary color
- Screen reader labels in Spanish
- Keyboard navigation throughout
- Alt text on all images
- Form validation with clear messaging
- Motion: Respects prefers-reduced-motion

---

## Modern Design Principles

1. **Whitespace:** Generous spacing creates premium feel
2. **Smooth Transitions:** All interactions flow naturally (300ms default)
3. **Hierarchy:** Clear visual distinction between elements
4. **Consistency:** Repeat patterns build recognition
5. **Premium Feel:** High contrast, clean lines, quality shadows
6. **Performance:** Smooth 60fps animations, GPU-accelerated
