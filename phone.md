# Raipur Used & Refurbished Phone Marketplace
## Product Requirements & Operational Specification

**Document type:** Product Requirements Document (PRD)  
**Initial market:** Raipur, Chhattisgarh, India  
**Business model:** Multi-shop marketplace with optional paid home inspection  
**Platform model:** Asset-light marketplace; shops own inventory and complete sales

---

# 1. Product Overview

## 1.1 Problem Statement

Customers looking for second-hand or refurbished smartphones in Raipur generally discover available devices through:

- Instagram and social media pages
- WhatsApp groups and referrals
- Direct calls to individual mobile shops
- Visiting multiple shops physically

This makes it difficult to compare inventory, prices, device conditions, and shop offerings in one place.

Local shops also lack a centralized digital channel through which they can showcase their available used-phone inventory to potential customers.

## 1.2 Proposed Solution

Build a centralized marketplace where multiple second-hand and refurbished phone shops in Raipur can list their inventory.

Customers can:

1. Browse available phones from multiple shops.
2. Compare prices, specifications, condition, and shop details.
3. Contact a shop or visit it directly.
4. Book a paid home inspection for selected phones.
5. Inspect the phone through an authorized employee from the shop.
6. Purchase directly from the shop if satisfied.

The platform does not purchase, own, store, or resell phones.

## 1.3 Business Model

The platform has two primary services:

**A. Marketplace discovery — Free**

- Shops list their phones.
- Customers browse and compare inventory.
- Customers can contact shops.
- Customers can visit shops directly.
- No inspection fee is charged for direct shop visits.

**B. Home inspection — Paid**

- Customer selects one or multiple phones from the same shop.
- Customer pays an initial inspection fee of ₹299.
- Shop accepts or rejects the request based on availability.
- Shop assigns an authorized employee.
- Employee brings the selected phone(s) to the customer's address.
- Customer inspects the phones through a demonstration.
- If the customer purchases a phone, the ₹299 inspection fee is adjusted against the purchase price.

---

# 2. Finalized Business Decisions

| Decision | Final value |
|---|---|
| Initial market | Raipur |
| Marketplace access | Free |
| Home inspection | Paid |
| Starting inspection fee | ₹299 |
| Inspection scope | Demonstration |
| Fee adjustment | Adjusted against purchase if a purchase is completed |
| Inventory ownership | Participating shop |
| Inspection employee | Authorized shop employee |
| Maximum shops per booking | One |
| Multiple phones per booking | Allowed, from the same shop only |
| Phone purchase payment | Directly to the shop |
| Inspection payment | Through the platform |
| Platform inventory ownership | None |

## 2.1 Fee Adjustment Policy

The ₹299 is an inspection fee, not an additional purchase charge.

Example:

- Phone price: ₹12,000
- Inspection fee paid: ₹299
- Customer decides to purchase.
- Shop adjusts ₹299 against the phone price.
- Customer pays the shop the remaining ₹11,701.

If the customer does not purchase any phone, the inspection fee is retained as payment for the completed inspection service.

If the shop cannot fulfil the booking, the customer receives a full refund.

**Important implementation rule:** The platform must record the inspection fee adjustment and the final purchase outcome. The shop must not independently charge the customer the full phone price without accounting for the agreed adjustment.

The exact settlement mechanism between the platform and shop must be finalized in the shop agreement.

---

# 3. User Roles

The platform will have four main user roles.

## 3.1 Customer

Customers can:

- Register and log in using mobile OTP.
- Browse phones without logging in.
- Search and filter phones.
- View shop profiles.
- Save shortlisted phones.
- Compare multiple phones.
- Contact shops.
- Request home inspection.
- Pay the inspection fee.
- Track booking status.
- View inspection history.
- Submit reviews and report issues.

## 3.2 Shop Owner / Shop Manager

Shop users can:

- Register their business.
- Submit business verification documents.
- Manage shop details.
- Add, edit, and remove phone listings.
- Update phone availability and pricing.
- Receive inspection requests.
- Accept or reject requests.
- Assign an authorized employee.
- Manage inspection schedules.
- Confirm phone handover and return.
- Record purchase outcomes.
- View inspection fee settlements.
- Respond to customer complaints.

## 3.3 Shop Employee

Employees are authorized by a participating shop.

They can:

- View assigned inspection bookings.
- View customer address and appointment details for assigned bookings.
- Confirm device collection from the shop.
- Update journey and inspection statuses.
- Demonstrate the selected phone(s).
- Record the customer's decision for each phone.
- Confirm return of devices to the shop.

Employees cannot:

- Modify shop inventory or pricing.
- Accept bookings on behalf of the shop unless separately authorized.
- Access unrelated customer records.
- Independently change inspection fees.
- Mark a sale as completed without the required confirmation.

## 3.4 Platform Administrator

Administrators can:

- Approve or reject shop registrations.
- Manage users and permissions.
- Review listings.
- Manage categories and specifications.
- Configure inspection fees and service zones.
- Monitor bookings and payments.
- Handle refunds and disputes.
- Manage shop settlements.
- Suspend shops or listings.
- Review reports and complaints.
- View marketplace and operational analytics.

---

# 4. Customer Marketplace Requirements

## 4.1 Homepage

The homepage should provide:

- Search by phone model.
- Featured phones.
- Recently added phones.
- Popular phone brands.
- Verified participating shops.
- Home inspection service explanation.
- Location/service-area information.
- Clear CTA to browse available phones.

## 4.2 Phone Listing

Each phone listing should contain:

| Field | Requirement |
|---|---|
| Brand | Required |
| Model | Required |
| Storage | Required |
| RAM | Optional where relevant |
| Asking price | Required |
| Original/market reference price | Optional; must be clearly labelled |
| Condition | Required |
| Battery health | Optional, where applicable |
| Colour | Optional |
| Images | Minimum 3 recommended |
| Description | Required |
| Accessories included | Optional |
| Warranty | Optional; specify who provides it |
| Shop | Required |
| Location | Required |
| Availability | Required |
| Listing date | System generated |

Condition options:

- Like New
- Excellent
- Good
- Fair

Condition definitions must be documented so shops use them consistently.

Do not present a shop's stated condition as an independent platform certification.

## 4.3 Search and Filters

Customers should be able to filter by:

- Brand
- Model
- Price range
- Storage
- RAM
- Condition
- Battery health, where provided
- Shop
- Location
- Warranty availability
- Recently added

Sorting options:

- Price: low to high
- Price: high to low
- Recently added
- Relevant match

Search should support partial model names and common spelling variations.

## 4.4 Product Details Page

Display:

- Product images
- Model and specifications
- Asking price
- Condition and description
- Battery health, if provided
- Accessories and warranty information
- Shop details and location
- Last inventory confirmation
- Availability status

Primary actions:

1. Visit Shop
2. Contact Shop
3. Request Home Inspection

Only show the home inspection option when the listing belongs to an eligible shop and is within the supported service area.

## 4.5 Shop Profile

Each shop should have:

- Business name
- Shop photographs
- Address
- Map/location
- Contact details
- Business hours
- Verification status
- Available inventory
- Customer ratings and reviews
- Home inspection availability

---

# 5. Home Inspection Booking Requirements

## 5.1 Booking Rules

1. Customer must select phones belonging to one shop.
2. Multiple phones from the same shop can be included.
3. Phones from different shops cannot be combined into one booking.
4. The shop must confirm that selected phones are available.
5. The booking is not confirmed until the shop accepts it.
6. The customer must pay the ₹299 inspection fee.
7. Home inspection is available only within approved service zones.
8. A booking requires a supported date and time slot.
9. A shop must assign an authorized employee before dispatch.

## 5.2 Booking Flow

**Step 1 — Select phones**

Customer browses inventory and selects one or more phones from a single shop.

**Step 2 — Choose inspection**

Customer selects the home inspection option.

**Step 3 — Enter address**

Customer provides:

- Full name
- Mobile number
- Address
- Area/locality
- Landmark
- Pincode
- Preferred date
- Available time slot

**Step 4 — Review booking**

Display:

- Selected phone(s)
- Shop name
- Shop address
- Inspection address
- Appointment date and time
- Inspection fee: ₹299
- Fee adjustment policy
- Cancellation and refund policy

**Step 5 — Payment**

Customer pays ₹299 through the platform's payment gateway.

**Step 6 — Shop confirmation**

The shop receives the request and checks:

- Phone availability
- Pricing
- Employee availability
- Travel feasibility
- Appointment slot

The shop accepts or rejects the request.

**Step 7 — Employee assignment**

Shop assigns an authorized employee.

Customer receives booking confirmation and employee assignment details as appropriate.

**Step 8 — Device preparation**

Shop confirms that all selected phones are prepared and records their condition before dispatch.

**Step 9 — Employee dispatch**

Employee updates the booking status to On the Way.

**Step 10 — Home demonstration**

Employee arrives and demonstrates the selected devices.

The employee remains present throughout the demonstration.

**Step 11 — Customer decision**

For each phone, record one of:

- Interested
- Purchased
- Not interested
- Not available
- Inspection not completed

**Step 12 — Completion and return**

Employee returns the phones to the shop if they were not purchased.

Shop confirms that all unsold phones have been returned.

**Step 13 — Fee adjustment and settlement**

If a purchase is completed, ₹299 is adjusted against the purchase price according to the shop agreement.

The platform records the final booking outcome and inspection fee settlement.

---

# 6. Inspection Scope

## 6.1 Demonstration-Only Service

The initial service is a product demonstration, not an independent technical certification.

The shop employee should:

- Show the selected phone.
- Demonstrate basic functionality.
- Show the physical condition.
- Explain the available specifications.
- Demonstrate the camera, display, buttons, charging, speakers, and connectivity where practical.
- Show battery health or battery information where supported by the device.
- Explain accessories included.
- Explain the shop's warranty or return policy, if any.
- Answer reasonable product-related questions.

## 6.2 Explicit Exclusions

The initial service does not promise:

- Independent hardware certification.
- Internal component testing.
- Water-damage certification.
- Authenticity certification.
- Data recovery.
- Professional repair diagnostics.
- Guaranteed battery health.
- A platform-issued quality certificate.

If a customer wants a deeper technical inspection, the platform can introduce a separate service in a future version.

## 6.3 Customer Acknowledgement

Before completing the booking, customers must be informed that the service is a shop-operated demonstration.

Any claims about condition, warranty, battery health, or repairs are supplied by the shop unless separately verified by the platform.

---

# 7. Inspection Fee and Settlement

## 7.1 Initial Pricing

| Item | Amount |
|---|---:|
| Initial home inspection fee | ₹299 |
| Additional phone from the same shop | To be finalized |
| Distance surcharge | To be finalized |
| Multiple-shop booking | Not allowed |

The initial ₹299 is a pilot price. It should be validated against shop travel costs, employee time, customer conversion, and platform operating expenses.

## 7.2 Fee Adjustment

If the customer buys at least one phone from the booking:

- The ₹299 fee is adjusted against the purchase.
- The shop records the purchase.
- The shop and platform reconcile the adjustment.
- The customer should receive a receipt or digital confirmation of the adjustment.

If the customer purchases no phone after a completed demonstration:

- The inspection fee is retained.
- No phone purchase payment is collected by the platform.

If the shop rejects the booking or cannot provide the requested service:

- The customer receives a full refund.

If the employee fails to arrive or the service cannot be completed due to a shop-side issue:

- The customer receives a full refund.

Customer cancellations, late cancellations, rescheduling, and partial fulfilment require a clearly published policy before launch.

## 7.3 Settlement Model

The platform should maintain a separate inspection-fee ledger.

Record:

- Booking fee received
- Payment gateway charges
- Refund amount
- Shop share
- Platform share
- Fee adjustment amount
- Settlement status
- Settlement reference

Do not treat the entire ₹299 as platform revenue.

The final shop/platform split should be negotiated with participating shops based on the actual employee and travel costs.

---

# 8. Shop Onboarding and Verification

## 8.1 Shop Registration

Required information:

- Business name
- Owner/authorized manager name
- Mobile number
- Email
- Shop address
- GSTIN, if applicable
- Business registration or other appropriate business proof
- Bank account or settlement details
- Shop photographs
- Service zones
- Business operating hours

Verification requirements should be proportionate to the business type and applicable law.

## 8.2 Shop Approval

Admin reviews the submitted details.

Possible statuses:

- Draft
- Submitted
- Under Review
- Approved
- Rejected
- Suspended

Only approved shops can publish public listings.

## 8.3 Shop Agreement

Before activation, the shop must accept an agreement covering:

- Inventory accuracy
- Price accuracy
- Stock availability
- Device ownership and authorization to sell
- Employee authorization
- Inspection service standards
- Device custody and return
- Inspection-fee adjustment
- Shop/platform fee split
- Refund and cancellation rules
- Customer privacy
- Complaints and disputes
- Shop suspension and termination

The agreement should be reviewed by an Indian legal professional before launch.

---

# 9. Employee and Device Custody Operations

## 9.1 Employee Registration

The shop registers each authorized employee with:

- Full name
- Mobile number
- Photograph
- Employee ID, if available
- Identity verification details
- Shop assignment
- Active/inactive status

Collect identity documents securely and only to the extent necessary. Restrict access to authorized administrators.

## 9.2 Device Preparation

Before dispatch, the employee or shop records:

- Listing ID
- Device model
- Serial/IMEI reference (private, restricted access)
- Visible condition
- Existing scratches or damage
- Accessories
- Device photographs
- Shop handover timestamp
- Assigned employee

Full IMEI must never appear on public listings.

## 9.3 Handover Process

The system should record:

1. Shop prepares the phone.
2. Employee confirms receipt.
3. Employee confirms the device count.
4. Shop records the handover timestamp.
5. Employee starts the journey.
6. Customer receives an arrival update.

## 9.4 At Customer Location

- Employee confirms arrival.
- Customer verifies the selected devices.
- Demonstration begins.
- Customer's decision is recorded for each phone.
- Any purchase is documented.
- Unsold phones remain with the employee.
- Employee confirms departure and return to shop.

## 9.5 Return Confirmation

The shop confirms:

- Each unsold device returned.
- Condition checked against dispatch record.
- Accessories returned.
- Any discrepancy recorded.
- Return timestamp and employee identity.

Custody events must be append-only. Corrections should be stored as additional events, not by silently overwriting history.

---

# 10. Service Area and Scheduling

## 10.1 Service Zones

The initial service should be limited to selected Raipur areas.

Admin can configure:

- Eligible pincodes
- Locality/zone
- Service availability
- Distance or travel-time limits
- Service surcharge, if applicable
- Available days
- Daily booking capacity

Do not launch citywide until participating shops can fulfil bookings reliably.

## 10.2 Scheduling

Each shop should configure:

- Operating days
- Available inspection slots
- Employee availability
- Maximum bookings per slot
- Lead time before booking
- Same-day booking availability

The platform should prevent overlapping employee assignments.

## 10.3 Booking Capacity

A shop should not accept more bookings than its available employee capacity.

A slot is not finally confirmed until the shop accepts the booking.

---

# 11. Customer Support and Disputes

Customers should be able to report:

- Phone not as described
- Price mismatch
- Shop employee no-show
- Wrong phone delivered for demonstration
- Device damage during inspection
- Missing accessories
- Incorrect fee adjustment
- Misconduct
- Refund issues

Each complaint should have:

- Booking reference
- Customer details
- Shop details
- Employee details, where relevant
- Description
- Supporting photographs or documents
- Status
- Admin notes
- Resolution

Complaint statuses:

- Open
- Under Review
- Waiting for Shop
- Waiting for Customer
- Resolved
- Rejected

The platform must have a documented escalation process and response targets.

---

# 12. Technical Architecture

## 12.1 Recommended Application Structure

Build three interfaces backed by one shared backend:

1. Customer marketplace
2. Shop/employee dashboard
3. Admin dashboard

The initial release should be a responsive web application/PWA. A separate native mobile app is not necessary for the pilot.

## 12.2 Suggested Technology Stack

| Layer | Suggested technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| UI | Tailwind CSS |
| Backend | Node.js + NestJS or Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Mobile OTP |
| OTP provider | MSG91 |
| Payments | Razorpay or another suitable Indian payment gateway |
| Image storage | Cloudinary or S3-compatible storage |
| Maps | Google Maps or Mappls |
| Notifications | SMS, WhatsApp, email |
| Hosting | Managed cloud hosting |
| Error monitoring | Sentry or equivalent |
| Analytics | PostHog or equivalent |

Technology choices are recommendations, not mandatory requirements. Select the final stack based on development capacity, hosting cost, and operational needs.

## 12.3 Application Modules

### Customer frontend

- Authentication
- Homepage
- Search and filters
- Product listing
- Product details
- Shop profiles
- Compare phones
- Wishlist
- Enquiry management
- Inspection booking
- Address management
- Payment
- Booking tracking
- Reviews and complaints

### Shop dashboard

- Shop registration
- Verification status
- Inventory management
- Product image management
- Availability management
- Enquiry management
- Inspection requests
- Booking acceptance/rejection
- Employee assignment
- Device preparation
- Dispatch and return
- Purchase outcome
- Fee settlement
- Reports

### Employee interface

- Login
- Assigned inspections
- Booking details
- Device collection
- Journey status
- Demonstration checklist
- Customer decision
- Device return
- Return confirmation

### Admin dashboard

- User management
- Shop approval
- Employee management
- Listing moderation
- Category management
- Service-zone management
- Inspection fee configuration
- Booking monitoring
- Payment and refund management
- Settlement management
- Complaint handling
- Reports and analytics
- Audit logs

---

# 13. Database Requirements

The following entities are recommended for the first production-oriented version.

| Entity | Purpose |
|---|---|
| users | Customer, shop owner, employee, admin accounts |
| user_addresses | Customer inspection addresses |
| shops | Shop business information |
| shop_documents | Verification documents |
| shop_employees | Authorized shop employees |
| categories | Phone categories and brands |
| products | Phone listings |
| product_images | Product photographs |
| product_specifications | Structured device specifications |
| product_availability | Available, reserved, sold, inactive |
| enquiries | Customer enquiries |
| wishlists | Saved products |
| inspection_bookings | Main inspection booking |
| inspection_booking_items | Phones included in a booking |
| booking_status_history | Booking status history |
| employee_assignments | Employee allocation |
| device_custody_events | Device handover and return history |
| inspection_results | Customer decision for each phone |
| inspection_payments | Inspection fee transactions |
| fee_adjustments | Purchase-related fee adjustment |
| shop_settlements | Shop payment and settlement records |
| purchases | Recorded purchase outcomes |
| reviews | Customer ratings and feedback |
| complaints | Customer disputes |
| notifications | SMS, WhatsApp, and in-app notifications |
| audit_logs | Important system actions |

## 13.1 Important Database Constraints

- Every inspection booking must belong to exactly one shop.
- All booking items must belong to that same shop.
- A booking cannot contain sold or inactive products.
- A product cannot be reserved by conflicting confirmed bookings.
- A shop cannot assign an inactive employee.
- Payment transactions must have unique gateway references.
- Refunds and fee adjustments must be recorded separately.
- Custody events must not be silently overwritten.
- Financial records should use immutable transaction references and auditable status changes.

---

# 14. API Requirements

Suggested API groups:

## Authentication

- `POST /auth/send-otp`
- `POST /auth/verify-otp`
- `POST /auth/logout`
- `GET /auth/me`

## Marketplace

- `GET /products`
- `GET /products/:id`
- `GET /products/search`
- `GET /shops`
- `GET /shops/:id`
- `GET /shops/:id/products`

## Customer

- `GET /customer/profile`
- `PUT /customer/profile`
- `GET /customer/addresses`
- `POST /customer/addresses`
- `POST /customer/wishlist`
- `GET /customer/bookings`

## Shop

- `POST /shop/register`
- `GET /shop/profile`
- `PUT /shop/profile`
- `GET /shop/products`
- `POST /shop/products`
- `PUT /shop/products/:id`
- `PATCH /shop/products/:id/availability`
- `GET /shop/inspection-requests`
- `POST /shop/inspection-requests/:id/accept`
- `POST /shop/inspection-requests/:id/reject`
- `POST /shop/bookings/:id/assign-employee`

## Employee

- `GET /employee/assignments`
- `POST /employee/assignments/:id/collection`
- `POST /employee/assignments/:id/dispatch`
- `POST /employee/assignments/:id/arrival`
- `POST /employee/assignments/:id/inspection-result`
- `POST /employee/assignments/:id/return`

## Inspection booking

- `POST /inspection/bookings/quote`
- `POST /inspection/bookings`
- `GET /inspection/bookings/:id`
- `POST /inspection/bookings/:id/cancel`
- `GET /inspection/bookings/:id/status-history`

## Payments and settlements

- `POST /payments/create-order`
- `POST /payments/verify`
- `POST /payments/webhook`
- `POST /payments/:id/refund`
- `GET /shop/settlements`
- `GET /admin/settlements`

## Admin

- `GET /admin/shops`
- `PATCH /admin/shops/:id/status`
- `GET /admin/bookings`
- `GET /admin/complaints`
- `PATCH /admin/complaints/:id`
- `GET /admin/reports`

All APIs must enforce role-based authorization, input validation, rate limits, and audit logging for sensitive actions.

---

# 15. Booking State Management

## 15.1 Main Booking Statuses

1. Payment Pending
2. Awaiting Shop Confirmation
3. Confirmed
4. Employee Assigned
5. Devices Prepared
6. On The Way
7. Arrived
8. Inspection In Progress
9. Inspection Completed
10. Return Pending
11. Return Confirmed
12. Completed
13. Cancelled
14. Refund Pending
15. Refunded

The system must not allow arbitrary status changes. Each transition must have an authorized actor and valid preceding state.

## 15.2 Individual Phone Statuses

Each phone in a booking should have its own outcome:

- Requested
- Available
- Unavailable
- Prepared
- Collected
- Demonstrated
- Purchased
- Declined
- Returned
- Return Confirmed

This is important because a customer may purchase one phone and decline the others.

---

# 16. Security and Privacy

Required controls:

- OTP authentication with rate limiting.
- Role-based access control.
- Secure session/token management.
- Password hashing if password login is introduced.
- HTTPS across all environments.
- Private access to shop verification documents.
- Restricted access to IMEI and serial numbers.
- Payment gateway tokenization; do not store card details.
- Signed or otherwise verified payment webhooks.
- Audit logs for financial and custody events.
- Address visibility restricted to assigned employees and authorized shop staff.
- Customer data retention and deletion policies.
- Backups and disaster recovery.
- Protection against spam enquiries and fake bookings.

Collect only information necessary to provide the service. Establish privacy notices, consent, retention, and grievance processes consistent with applicable Indian data protection requirements.

---

# 17. Notifications

Send notifications for:

| Event | Recipient | Channel |
|---|---|---|
| OTP generated | Customer/shop/employee | SMS |
| Inspection request received | Shop | Dashboard/SMS |
| Booking accepted | Customer | SMS/WhatsApp |
| Booking rejected | Customer | SMS/WhatsApp |
| Employee assigned | Customer | SMS/WhatsApp |
| Employee dispatched | Customer | SMS/WhatsApp |
| Employee arrived | Customer | SMS/WhatsApp |
| Inspection completed | Customer/shop | SMS/WhatsApp |
| Device return confirmed | Shop | Dashboard |
| Refund initiated | Customer | SMS |
| Booking completed | Customer/shop | SMS/WhatsApp |
| Complaint updated | Customer | SMS/WhatsApp |

Notifications should contain booking references and relevant next steps, not unnecessary personal or device information.

---

# 18. Analytics and Business Reporting

## Marketplace metrics

- Total active shops
- Total active listings
- Listings by brand
- Listings by price range
- Product views
- Enquiries per product
- Enquiries per shop
- Listing-to-enquiry conversion
- Sold and expired listings

## Home inspection metrics

- Inspection requests
- Shop acceptance rate
- Booking confirmation time
- Employee assignment rate
- Fulfilment rate
- Employee no-show rate
- Cancellation rate
- Average inspection time
- Purchase conversion rate
- Average phones per booking
- Refund rate

## Financial metrics

- Inspection fee collection
- Payment gateway cost
- Refund amount
- Shop payout
- Platform revenue
- Contribution margin per booking
- Customer acquisition cost
- Repeat customer rate

The most important early metric is not total listings or website traffic. It is the percentage of customers who submit a serious enquiry or complete a fulfilled inspection and subsequently purchase.

---

# 19. MVP Scope and Release Plan

## Phase 1 — Marketplace Foundation

- Customer authentication
- Shop onboarding
- Admin shop approval
- Shop dashboard
- Product inventory management
- Public product listings
- Search and filters
- Shop profile
- Enquiry/contact flow
- Mark product sold or unavailable

**Release goal:** Customers can discover and contact participating Raipur shops.

## Phase 2 — Home Inspection

- Inspection service zones
- Address management
- Time-slot management
- Booking fee calculation
- Payment gateway
- Shop acceptance/rejection
- Employee assignment
- Booking tracking
- Demonstration checklist
- Purchase outcome
- Fee adjustment record
- Device return confirmation
- Refund handling

**Release goal:** Customers can book and complete a shop-operated home demonstration.

## Phase 3 — Trust and Operational Improvements

- Customer reviews
- Shop performance ratings
- Complaint management
- Device custody history
- Shop settlement reports
- Employee performance
- Booking analytics
- Automated reminders
- Inventory freshness reminders
- Better product comparison

## Phase 4 — Expansion

Only after the Raipur pilot demonstrates reliable demand:

- Additional localities and service zones
- More participating shops
- More product categories
- Advanced inspection services
- Independent inspection partners
- Native mobile apps, if justified
- Other cities

---

# 20. Pilot Launch Plan

Start with a controlled pilot instead of onboarding every shop in Raipur.

Suggested initial pilot:

| Item | Target |
|---|---:|
| Participating shops | 5 |
| Active phone listings | 50–100 |
| Shop-authorized employees | 2–3 initially, subject to shop capacity |
| Service area | Selected localities |
| Booking slots | Limited daily capacity |
| Pilot duration | 30 days |
| Starting inspection fee | ₹299 |

These are proposed operating targets, not estimates of actual market demand.

## Pilot success criteria

Evaluate:

- Are shops updating inventory regularly?
- Are listed phones actually available?
- Do customers contact shops?
- Are customers willing to pay ₹299?
- Can shops fulfil inspection requests consistently?
- Does the inspection fee cover employee and travel costs?
- Does fee adjustment create confusion at purchase time?
- What percentage of completed demonstrations lead to a purchase?
- Are customers satisfied with the experience?

Do not expand the service area until shop acceptance and fulfilment are reliable.

---

# 21. Business Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Fake or outdated listings | Inventory freshness reminders and automatic expiry |
| Shop rejects too many bookings | Acceptance-rate monitoring |
| Employee does not arrive | Assignment confirmation and no-show escalation |
| Phone damaged during inspection | Dispatch/return photographs and custody records |
| Phone sold before booking | Inventory reservation and shop confirmation |
| Customer books without serious intent | ₹299 advance inspection fee |
| Customer disputes condition | Clear demonstration scope and pre-dispatch photos |
| Shop refuses fee adjustment | Written agreement and digital purchase confirmation |
| Customer address misuse | Restricted role-based access |
| Low inspection profitability | Service zones, pricing tests, and cost tracking |
| Poor customer experience | Feedback and complaint resolution |

---

# 22. Decisions Still Requiring Validation

The following are not yet finalized and must be decided before development of the complete booking and settlement workflow:

1. **Adjustment mechanics:** Does the shop deduct ₹299 from the phone's agreed price and settle the corresponding amount with the platform, or does the platform credit the customer through a separate mechanism?
2. **Additional phones:** Will the ₹299 cover the first phone and a separate charge apply for each additional phone?
3. **Cancellation policy:** What happens when the customer cancels after the shop has dispatched its employee?
4. **Service zones:** Which Raipur localities and pincodes will be included in the pilot?
5. **Shop payout:** What percentage or fixed amount will the shop receive from the inspection fee?
6. **Purchase confirmation:** What evidence is required to mark a phone as purchased?
7. **Service capacity:** How many inspection bookings can each shop fulfil per day?
8. **Price accuracy:** How long should a listing remain valid before the shop must reconfirm its price and availability?

---

# 23. Recommended Launch Principle

Build the marketplace first and validate that customers actually discover and enquire about shop inventory.

Then launch home inspection with a small group of reliable shops.

Do not make the platform responsible for phone ownership, phone delivery, repairs, or technical certification in the first version.

The initial product should solve three problems exceptionally well:

1. **Discovery:** Find available second-hand phones across Raipur shops.
2. **Trust and transparency:** Understand the listed device, its condition, price, and seller.
3. **Convenience:** Arrange a paid home demonstration when visiting the shop is inconvenient.

This keeps the first version operationally manageable while leaving room to expand into a larger local refurbished-electronics marketplace.

=======================================================================================================================================================
Negative assessment
=======================================================================================================================================================


# Brutal assessment: the biggest risk is that you're solving a problem customers may not care enough to pay to solve.

Your marketplace sounds useful on paper: one place to compare used phones across Raipur shops, plus a ₹299 home demonstration service.

But there's a dangerous gap between "this would be convenient" and "people will change their buying habits and pay for it."

My current verdict: the marketplace is plausible; the home-inspection model is much less proven. The biggest threat isn't technology, competition, or even getting shops onboard. It's whether you can create enough customer demand and enough shop commitment to make the whole operation economically worthwhile.

Let's examine where it can break.

## 1. Your first major problem: the competition already exists

I checked the current online landscape, and there's something important you should know before investing in development.

[Best Phones Under ₹20,000 in 2025 | Top Budget Smartphones in India](https://images.openai.com/static-rsc-4/xfU5TyZANglyUAu9c1r-b2xQh6E6zIflA8FOpH4Uu9-MtggZu8jcYhqHZOQ8zwgX82Dg193WDTXQHjgg9yd3kvG8Drai6grE8oNPSs0_vBNv44Rge8X1FD-eUxahRLKs0bmfIavaBZh27ok1T1U5ZqRPFCkCLZiBLpAqo-EZRLg?purpose=inline)

Phoneo

Its website already advertises second-hand phones from local mobile shops. Its Raipur page currently shows 62 phones from one shop.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.phoneo.in\&sz=32)

Phoneo+1



[See Phoneo's Raipur listings](https://www.phoneo.in/raipur?utm_source=chatgpt.com)

[Designing the UI and Design System for OruPhones: A Comprehensive UI Design Approach | by Atirekverma | Medium](https://images.openai.com/static-rsc-4/aOZv1LkDlnC9b9vwbGSgzIX7yela2I4dL9g8J30VLKHjLw_HxMymkgyiFSwK6-xcw8KEBYQZ0UMGhuJkQK-6ddjmzM9sMD-bwsV45yNiRCWMFp9dKffpt4elT8e-Dp2ocnhw6SecHNB0O3A6-jSYMGzOfVrZJaWj6ytwnWPa9XM?purpose=inline)

ORUphones

It already has a Raipur used-phone marketplace page with listings and location filters.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.oruphones.com\&sz=32)

ORUphones Marketplace



[See ORUphones' Raipur listings](https://www.oruphones.com/buy-old-used-phones/location/chhattisgarh/raipur?utm_source=chatgpt.com)

This changes my assessment.

Your original idea was: "I'll bring local second-hand phone shops into one platform."

That is no longer a unique proposition. Other platforms are already attempting it.

And you should not assume their presence means they have won the Raipur market. The pages show that they have a presence, not their active customer numbers, sales volume, or market share. But they prove that the concept is not new.

Your differentiation must be stronger than having multiple shops on one website.

## 2. The biggest weaknesses, ranked



Critical

&#x20;Problem 1 — Your ₹299 home inspection proposition may not be compelling



Put yourself in the customer's position.

They want to buy a second-hand phone worth ₹8,000–₹25,000.

They can:

- Call the shop and ask about the phone.
- Visit the shop.
- Ask a friend or relative to accompany them.
- Negotiate directly with the shop.
- Find another seller closer to home.

Now you're asking them to pay ₹299 to have a shop employee bring a phone to their home.

The question is: What meaningful problem does this solve that the customer cannot solve for free?

For some customers, it absolutely could be convenient. But convenience alone may not be enough to generate frequent bookings.

There are three additional problems:

- Customers may distrust an unfamiliar employee entering their home.
- A demonstration is not the same as independent verification of the phone's condition.
- If the customer is serious enough to spend ₹15,000 on a phone, they may prefer visiting the shop and inspecting it themselves.

My verdict: Don't build your business around home inspection until real customers demonstrate willingness to pay for it.



Critical

&#x20;Problem 2 — The ₹299 fee adjustment has a financial contradiction



This is the biggest unresolved issue in your pricing model.

Suppose:

- Phone price: ₹15,000
- Customer pays you: ₹299
- Customer purchases the phone.
- Shop receives ₹14,701 because ₹299 is deducted.

Who receives the ₹299 that the customer already paid?

There are only a few possibilities:

| Model                                              | What happens                | Consequence                                       |
| -------------------------------------------------- | --------------------------- | ------------------------------------------------- |
| Shop absorbs discount                              | Shop receives ₹14,701       | Shop loses ₹299 and may resist                    |
| Platform transfers ₹299 to shop                    | Shop receives ₹15,000       | Platform earns nothing from that fee before costs |
| Platform pays shop from a separate sale commission | Shop receives agreed amount | More complicated accounting and contracts         |

If the shop is providing the employee, phone, and travel, why would it accept losing ₹299 on every successful purchase?

And if you transfer the fee to the shop, what is your revenue?

You cannot simply say "the fee is adjusted" without defining the money flow.

My recommendation: Treat ₹299 as an inspection-service payment, with a clearly agreed customer discount and shop/platform settlement mechanism. Don't promise a deduction until the shop has agreed in writing to fund or reimburse it.



Critical

&#x20;Problem 3 — Shops have very little incentive to cooperate



You need shops to do several things consistently:

- Maintain accurate inventory.
- Upload photographs.
- Update prices.
- Mark sold phones unavailable.
- Accept inspection requests.
- Reserve devices.
- Assign employees.
- Spend time travelling to customers.
- Handle disputes and fee adjustments.

What do they get in return?

You might say, "I'll bring them more customers."

But here's the catch: shops already have customers through walk-ins, referrals, Instagram, WhatsApp, and their existing local reputation.

Some established Raipur retailers already have substantial customer visibility and reviews. For example, MOBILE ADDA and Madhuram Mobile & Accessories operate in the Katora Talab area.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.google.com\&sz=32)

google.com+1



If your platform generates only a few enquiries per month, shops will stop updating inventory.

And once inventory becomes outdated, customers stop trusting your platform.

This creates a dangerous cycle:

Shops don't update inventory

Customers find unavailable phones

Customers lose trust and leave

Shops receive fewer enquiries

The marketplace becomes inactive

Problem 4 — You might become a free advertising platform for shops.

Imagine this:

1. Customer finds an iPhone on your platform.
2. Customer sees the shop's name and phone number.
3. Customer contacts the shop directly.
4. Customer negotiates and buys.
5. Your platform earns ₹0.

This is called disintermediation: the customer and seller meet through your platform, then complete the transaction outside it.

You cannot realistically prevent every customer from contacting a shop directly. Nor should you make that difficult.

But you need a revenue model that doesn't depend entirely on controlling the final transaction.

I'd test these options:

| Revenue stream            | My assessment                                                 |
| ------------------------- | ------------------------------------------------------------- |
| Monthly shop subscription | Good long-term possibility, but shops need proven leads first |
| Qualified enquiry fee     | Worth testing                                                 |
| Featured listings         | Possible additional revenue                                   |
| Sale commission           | Difficult to track when sales happen offline                  |
| Home inspection fee       | Useful supplementary revenue, but operationally expensive     |

I would not charge shops a subscription on day one.

Problem 5 — Your platform doesn't solve the biggest trust problem: is the phone actually good?

This is a serious issue.

A second-hand phone can look excellent externally and still have:

- A replaced display.
- A weak battery.
- A faulty charging port.
- A replaced camera.
- Water damage.
- Network issues.
- An iCloud or Google account lock.
- An unclear ownership history.

Your demonstration-only model shows customers the phone, but doesn't independently verify all of these things.

A shop employee has a commercial incentive to sell the phone. The customer may therefore see the employee as a salesperson, not an independent inspector.

This is particularly important because research on India's refurbished market identifies authenticity and warranty coverage as important consumer concerns.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://counterpointresearch.com\&sz=32)

Counterpoint Research+1



My recommendation: Your first real differentiator should be transparency, not home delivery.

Every listing should have a structured condition disclosure, including:

- Whether the display is original or replaced, if known.
- Battery health where available.
- Repair history, if known.
- Functional issues.
- Warranty terms.
- Accessories.
- IMEI/ownership verification status.

Don't claim a phone is certified unless you actually perform and document the certification.

## 3. Your operational costs may destroy your margins

Let's examine the ₹299 service.

Assume one booking involves:

- Employee travelling to the customer.
- Employee spending time demonstrating two phones.
- Employee travelling back.
- Shop managing the request.
- Platform coordinating the appointment.
- Payment gateway and customer support costs.

Even if the customer pays ₹299, that doesn't mean your business earns ₹299.

Here's an illustrative calculation, not actual Raipur operating data:

| Cost/revenue                              | Example |
| ----------------------------------------- | ------- |
| Customer inspection fee                   | ₹299    |
| Shop/employee/travel allocation           | ₹150    |
| Payment processing                        | ₹7      |
| Customer support and coordination         | ₹30     |
| Marketing/customer acquisition allocation | ₹50     |
| Remaining contribution                    | ₹62     |

₹0₹80₹160₹240₹320Inspection feeShop and travelPayment processingCoordinationMarketingRemaining

Now imagine the customer doesn't purchase anything.

You earn just ₹62 in this example, while having consumed employee time, shop capacity, and operational effort.

If the customer purchases a phone, the fee adjustment introduces the additional financial problem discussed above.

What if travel costs ₹200 instead of ₹150? What if the employee spends 90 minutes on one booking?

Your margin could disappear.

My recommendation: Start with limited service zones. Calculate travel time and actual employee costs before committing to a fixed ₹299 price across the city.

## 4. The marketplace has a chicken-and-egg problem

Your platform needs two groups:

- Shops with inventory.
- Customers looking for inventory.

But:

- Shops won't invest time until you have customers.
- Customers won't visit until you have enough shops and inventory.

You could launch a beautiful website with 30 shops registered, but if only five shops have updated listings, the marketplace will look empty.

And 100 listings aren't necessarily sufficient if 70 are outdated or overpriced.

Your marketplace needs fresh, available, competitively priced inventory, not simply a large listing count.

This is harder than building the frontend.

## 5. Your home-inspection service introduces risks that a normal marketplace doesn't have

You are creating a real-world interaction between strangers.

Consider these scenarios:

- Employee claims the phone was damaged by the customer.
- Customer claims the employee brought a different device.
- Employee fails to return a phone to the shop.
- Customer refuses to let the employee leave with the phone.
- Customer books multiple phones and refuses all of them.
- Shop sends an employee who is not authorized.
- Employee behaves inappropriately at the customer's home.
- Customer buys the phone but the shop disputes the ₹299 adjustment.

Your custody logs, photographs, employee verification and agreements reduce risk, but they don't eliminate it.

There are also insurance, liability, privacy and consumer-protection questions to resolve with legal advice.

Bluntly: you're adding a logistics and field-service business to a marketplace before you've proven that the marketplace itself works.

I would delay home inspection until the basic marketplace has demonstrated demand.

## 6. Is the market itself worth pursuing?

Market opportunity exists

I don't want you to misunderstand my criticism: the used-phone market is real.

Counterpoint Research reported that India's refurbished smartphone volumes grew 13% year-on-year in H1 2026, while organised channels accounted for around 20% of the market and unorganised channels around 80%.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://counterpointresearch.com\&sz=32)

Counterpoint Research



That suggests an opportunity to improve discovery and trust.

But a growing national market does not automatically mean a profitable local marketplace in Raipur.

The real questions are:

- How many people buy used phones in Raipur each month?
- How many shops sell them regularly?
- How many phones do those shops have available at any moment?
- How often do customers search online before visiting?
- How much are shops willing to pay for a qualified customer?
- How many customers actually want a home demonstration?

I haven't found reliable public data answering these Raipur-specific questions. You need primary research rather than assumptions.

## 7. What I would change in your business model

If I were investing my own money, I would not launch the original model exactly as proposed.

I would simplify it.

## My revised business model

Recommended direction

Stage 1 — Local used-phone discovery

[Catalog stylus.ua by Misha Mihail on Dribbble](https://images.openai.com/static-rsc-4/AxEyuaD84DjVA6l_op1bQDTFGgEu3Fpl_5-V0hkJNS2wrHxiMrd3r4hjDYSqCV1_zyRXJHIB5d8i1L522O5shUdZpmW7y8DLRfnIhWw92InNsaehwzgVOowinFc0g7zujyBbbiocTBN60sNLPOqvWPpT2NMpTXhLgC0imGeIdQ4?purpose=inline)

[dribbble.com](https://dribbble.com/shots/19787334-Catalog-stylus-ua?utm_source=chatgpt.com)

- Aggregate available phones from local shops.
- Show actual shop details and prices.
- Allow comparison.
- Enable WhatsApp enquiries and free shop visits.
- Keep inventory freshness visible.

Stage 2 — Trust and transparency

[A Practical Guide to Buying an iPhone 12 Refurbished with 1 Year Warranty in the UK](https://images.openai.com/static-rsc-4/qFtbHiZ0TmOlWUGe3S3Xh3exgrq2E79n3AvFrosp85aNmq07Wlr9p4VmcuSnk7Uiq9NdXGt4QjuqvZa6TKryQ8kuOZX3YQGM9i86F_vZNSYBudanDYLVEU7eElXG88uDNXp6eeiy-0V8qx62QPMgH6EPVrxfT1UPwxq7LM1IYOQ?purpose=inline)

[usedmobiles4u.co.uk](https://usedmobiles4u.co.uk/iphone-12-refurbished-with-1-year-warranty-uk/?utm_source=chatgpt.com)

- Standardized condition disclosures.
- Shop verification.
- Repair-history disclosure where known.
- Listing freshness and availability confirmation.
- Clearly documented shop warranty.

Stage 3 — Premium convenience

[Lava Started Demo@Home Phone Experience Service at Home](https://images.openai.com/static-rsc-4/gNXZ2oR57TgFv2k44mhbujaYH4CGGgNpdGe2e4ZCD-wylhChcgWp4A29jfE8wFgtIrMwezHEc7Q2aig2Tg91Tiy1cDGR_9IvxVOleg3J7uYexyxQOa2LYeaXOOuUrtAK7BGdHUmw9XneDwyV3hZjgwHk4vRgI-cN3iKTnBLxdCk?purpose=inline)

[hindi.gadgets360.com](https://hindi.gadgets360.com/mobiles/lava-started-demo-home-phone-experience-service-at-home-news-8430792?utm_source=chatgpt.com)

- Introduce ₹299 home demonstration.
- Limit it to participating shops.
- Keep the one-shop-per-booking rule.
- Measure actual booking and purchase conversion.
- Expand only when the service is profitable.

I would also make a significant change to your revenue strategy:

Don't make home inspection your only revenue source.

Test qualified customer leads and shop subscriptions after proving you generate sales opportunities.

## 8. How I would try to kill this idea before spending money

I would run a 30-day validation experiment without developing the full platform.

### Week 1 — Shop research

Visit or contact 15–20 Raipur used-phone shops.

Ask them:

1. How many used phones do you typically have available?
2. How do customers currently discover your inventory?
3. How often do you update your Instagram or WhatsApp inventory?
4. Would you provide updated inventory to a common marketplace?
5. Would you accept a paid home demonstration request?
6. Would you assign an employee and bear the travel cost?
7. What would make this service financially worthwhile for you?

Don't ask, "Would you use my idea?"

People often say yes to hypothetical ideas. Ask about their current behaviour and actual willingness to commit.

### Week 2 — Customer research

Speak with at least 30–50 people who have recently bought, or are actively considering buying, a used smartphone.

Ask:

- Where did you find your last used phone?
- How many shops did you contact?
- What made you trust the seller?
- What was your biggest concern?
- Would you prefer visiting a shop or having a phone demonstrated at home?
- Would you genuinely pay ₹299 for that convenience?

Don't lead them toward the answer you want.

### Week 3 — Run a manual marketplace

Use a simple landing page, catalogue, WhatsApp Business account, and spreadsheet.

Get 5 shops to provide real inventory.

Publish 50–100 available listings.

Track:

- Product views.
- Actual enquiries.
- Qualified enquiries.
- Shop responses.
- Shop visits.
- Confirmed sales.

Do not fabricate listings to make the website look populated.

### Week 4 — Test the ₹299 service

Don't just ask whether customers would pay.

Actually offer the service to interested customers, collect payment, fulfil the booking and observe what happens.

Measure the real cost of each visit.

### My proposed decision gates

These are validation targets I would set, not established industry benchmarks.

| Metric                                      | Suggested pilot target    |
| ------------------------------------------- | ------------------------- |
| Shops willing to participate                | 5+                        |
| Active, verified listings                   | 75+                       |
| Real customer enquiries                     | 30+                       |
| Shops consistently responding               | 80%+                      |
| Paid home inspection bookings               | 10+                       |
| Successfully fulfilled inspections          | 90%+                      |
| Recorded purchase outcomes                  | 100% of bookings          |
| Positive contribution per completed booking | Required before expansion |

If shops refuse to update inventory, customers don't enquire, or nobody pays for the home demonstration, don't respond by building more features. Reconsider the business model.

## 9. My final assessment

# Business viability assessment

My qualitative assessment based on the current model, not a statistically validated investment rating.

Used-phone marketplace

Promising

Real market, but existing competition.

Local shop onboarding

Difficult

Requires ongoing cooperation and accurate inventory.

₹299 home demonstration

Unproven

Willingness to pay and unit economics unknown.

Fee adjustment model

Needs redesign

Shop/platform/customer settlement is unresolved.

Operational scalability

Risky

Human coordination, travel, and custody create overhead.

Potential to expand

Promising

Could extend to other local second-hand categories after validation.

### The three things I would absolutely not do

1. I would not spend three months building the complete platform. Validate demand with a manual operation first.
2. I would not promise ₹299 fee adjustment until the financial settlement is agreed with shops.
3. I would not hire or manage a delivery/inspection workforce before proving the marketplace generates sufficient demand.

### The uncomfortable question I want you to think about

Imagine I remove the home inspection service completely.

Your business becomes:

A website where people can discover and compare second-hand phones from different shops in Raipur.

Would customers still have a strong reason to use it instead of Google Maps, Instagram, WhatsApp, Phoneo, or ORUphones?

If your answer is no, then home inspection is currently acting as a patch for a weak marketplace proposition.

If your answer is yes, explain exactly what makes your marketplace meaningfully better.

My recommendation: Prove that customers want your inventory marketplace first. Treat home inspection as an experiment, not the foundation of the business.

I would rather see you spend ₹5,000 validating actual customer behaviour than spend ₹2 lakh building a polished product nobody uses.