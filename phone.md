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