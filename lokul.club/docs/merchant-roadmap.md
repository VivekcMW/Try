# Merchant Implementation Roadmap

This document defines the merchant rollout plan for all merchant categories and workflow profiles supported by the app.

## 1. Merchant categories and workflow profiles

### Retail
- kirana
- pharmacy
- paan_shop
- bakery
- dairy
- meat
- vegetables
- gift_shop
- stationery
- electronics
- hardware
- clothing
- footwear
- toys
- jewellery
- mobile
- nursery
- water

### Food
- restaurant
- cafe
- tiffin
- sweet_shop
- juice_bar
- catering

### Appointments / service
- salon
- beauty_parlour
- spa
- clinic
- dental
- dentist
- physio
- gym
- fitness
- yoga
- yoga_studio
- ayurveda

### Home services
- plumber
- electrician
- carpenter
- painter
- ac_repair
- cleaning
- laundry
- tailor
- car_wash
- pest_control
- appliance
- repair
- packers
- courier
- security
- cycle

### Subscriptions
- newspaper
- milk_delivery
- water_can

### Events / experience
- events
- realestate
- travel
- photography
- decorator
- caterer_events

---

## 2. Shared merchant foundation (Phase 1)

This is the mandatory base layer for all merchant types.

### Shared features
- Merchant login with phone OTP and email/password
- Merchant session and auth guard
- Merchant profile object and workflow resolution
- Dashboard shell and sidebar navigation
- Merchant-specific layout and role access control
- Logout and session invalidation
- Merchant data fetch helpers
- Error, empty, and loading states
- Common stats cards and navigation patterns
- Shared merchant API conventions

### Current relevant files
- src/app/merchant/login/page.tsx
- src/app/merchant/layout.tsx
- src/app/merchant/page.tsx
- src/lib/merchant-auth.ts
- src/lib/merchant-profile-context.tsx
- src/lib/merchant-profiles.ts
- src/types/merchant-categories.ts

### Acceptance criteria
- Every merchant can sign in
- Every merchant sees a role-aware dashboard
- Protected pages redirect to login when unauthenticated
- Every merchant type resolves to a workflow profile correctly
- Session and logout work reliably

---

## 3. Retail and food workflows (Phase 2)

### Core features
- Catalog / menu management
- Add, edit, delete items
- Inventory and stock tracking
- Product or menu item variants
- Price, unit, and duration fields
- Veg / non-veg and food metadata
- Offers and coupons
- Orders list and order detail
- Status updates and fulfillment workflow
- Customer records and order history
- Earnings and payout summary
- Broadcast to customers
- Analytics dashboard

### Working pages
- src/app/merchant/catalog/page.tsx
- src/app/merchant/offers/page.tsx
- src/app/merchant/coupons/page.tsx
- src/app/merchant/orders/page.tsx
- src/app/merchant/orders/[id]/page.tsx
- src/app/merchant/customers/page.tsx
- src/app/merchant/earnings/page.tsx
- src/app/merchant/analytics/page.tsx

### Must-finish work
- Validate real API connect for catalog, offers, and orders
- Complete CRUD for all item types
- Add stock low-alert logic
- Add delivery and pickup status states
- Wire dashboard stats to real merchant data

---

## 4. Appointment and service merchant workflows (Phase 3)

### Core features
- Service catalog
- Time-slot scheduling
- Weekly calendar or slot setup
- Booking list and detail view
- Reschedule and cancellation flow
- Client check-in and status tracking
- Service notes and follow-up
- Pricing with duration
- Automatic reminders
- Staff assignment (if needed)

### Working pages
- src/app/merchant/slots/page.tsx
- src/app/merchant/bookings/page.tsx
- src/app/merchant/bookings/[id]/page.tsx
- src/app/merchant/catalog/page.tsx
- src/app/merchant/analytics/page.tsx

### Must-finish work
- Confirm slot creation, editing, deletion, and timezone logic
- Ensure booking status transitions are consistent
- Add real customer contact details and reminders
- Verify appointment-specific analytics and payouts

---

## 5. Home service merchant workflows (Phase 4)

### Core features
- Service listing and specialties
- Incoming job requests / requests page
- Job management and assignment
- Quote and estimate flow
- Status lifecycle: new, assigned, in progress, done, cancelled
- Customer communication and notes
- Location and service area handling
- Ratings and complaint follow-ups
- Technician / crew tracking

### Working pages
- src/app/merchant/requests/page.tsx
- src/app/merchant/jobs/page.tsx
- src/app/merchant/jobs/[id]/page.tsx
- src/app/merchant/catalog/page.tsx
- src/app/merchant/settings/page.tsx
- src/app/merchant/branches/page.tsx

### Must-finish work
- Convert request intake to workflow states
- Add assignment and worker management
- Add quotes and estimates with pricing rules
- Validate different home-service categories share same job flow

---

## 6. Subscription merchant workflows (Phase 5)

### Core features
- Plan creation and management
- Pricing, duration, and unit rules
- Subscribers list and status
- Payment and renewal tracking
- Pause, resume, cancel handling
- Delivery schedule management
- Delivery logs and completion flow
- Analytics for churn and retention

### Working pages
- src/app/merchant/plans/page.tsx
- src/app/merchant/subscribers/page.tsx
- src/app/merchant/deliveries/page.tsx
- src/app/merchant/analytics/page.tsx

### Must-finish work
- Add billing lifecycle and recurring status logic
- Support plan variation by merchant type
- Connect delivery schedule to subscriber fulfillment
- Add retention and renewal analytics

---

## 7. Events and experience merchant workflows (Phase 6)

### Core features
- Package management
- Enquiry capture and follow-up
- Booking and calendar management
- Event package pricing
- Event scheduling and staffing
- Payment deposits and confirmation
- Post-event review and customer follow-up

### Working pages
- src/app/merchant/catalog/page.tsx
- src/app/merchant/requests/page.tsx
- src/app/merchant/jobs/page.tsx
- src/app/merchant/bookings/page.tsx
- src/app/merchant/settings/page.tsx

### Must-finish work
- Distinguish event packages from product listings
- Add event-specific inquiry and booking states
- Add payment deposit and confirmation flows
- Connect calendar and schedule to event operations

---

## 8. Cross-cutting merchant features (Phase 7)

These features are required across all merchant categories:

### Common platform features
- Notifications and reminders
- Broadcast messages
- Customer communication
- Analytics and dashboard metrics
- Orders / jobs / bookings summary
- Merchant earnings and transfer status
- Branch management
- Business profile and verification
- Ratings and feedback management
- In-app support and disputes

### Shared UX requirements
- Empty states
- Loading states
- Error handling
- Filters and search
- Modal patterns
- Confirmation dialogs
- Consistent card layouts
- Consent / policy flows

---

## 9. Implementation order by priority

### Priority 1
- Merchant auth + session
- Merchant profile + workflow mapping
- Dashboard shell
- Catalog / product management
- Orders / bookings / jobs
- Offers and coupons

### Priority 2
- Customers and communication
- Earnings and analytics
- Branch management
- Settings and onboarding

### Priority 3
- Subscription logic
- Event workflows
- Advanced automation
- Delivery tracking
- Payout and reconciliation

---

## 10. Definition of done

A merchant workflow is considered complete only when all of these are true:

- Merchant can log in and stay authenticated
- Merchant sees correct workflow-specific navigation
- Merchant can create, edit, and delete the core objects for that workflow
- Merchant can process and update statuses end-to-end
- Merchant can view analytics and earnings
- Merchant can manage customers and communications
- Merchant can handle empty, loading, and error states
- Flow is validated against real data and not just static fixtures

---

## 11. Execution recommendation

The correct execution path is:

1. Finish shared merchant foundation
2. Finish Retail + Food as the base product workflows
3. Finish Service / Appointments and Home Services
4. Finish Subscriptions and Events
5. Finish cross-cutting features and hardening

This keeps the product architecture consistent and avoids building category-specific logic before the common core is stable.
