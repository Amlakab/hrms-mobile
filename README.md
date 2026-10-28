# 📱 HRMS Mobile App (React Native & Expo)

A real estate and property rental mobile application built with **React Native (Expo SDK)**, **TypeScript**, and ultra-premium modern mobile UI aesthetics.

Directly integrated with the existing HRMS Node.js/Express backend (`hrms-backend`) without requiring any backend modifications. **100% functional parity with the Next.js web frontend (`hrms-frontend`)**.

---

## 🌟 Complete Feature Matrix (100% Web Parity)

### 1. 🔐 Authentication & Security
- **Multi-Method Login**: Phone + Password authentication and Phone + OTP verification (`VerifyOtpScreen`).
- **Role-Based Access Control (RBAC)**: Support for Customer, Landlord/Owner, Real Estate Agent, Property Manager, Accountant, and Administrator.
- **Registration**: Direct account registration with role selection.
- **Dedicated Settings (`SettingsScreen`)**: In-app Password Change (`/api/auth/change-password`), Profile Info updates, Notification preferences, and Offline Cache clearing.
- **JWT Persistence**: Secure token storage with Axios authorization interceptors.

### 2. 🏠 Property Discovery & Search
- **Explore Feed**: Featured properties, purpose filters (*For Rent*, *For Sale*, *Short Stay*), search bar, and verified badges.
- **Advanced Filters Sheet**: Filter by property type (*Apartment*, *Villa*, *Condo*, *House*, *Land*), minimum bedrooms, and price range in ETB.
- **Geospatial Map Search (`MapScreen`)**: Interactive map with real-time price markers and bottom preview sheet.
- **Side-by-Side Property Comparison (`PropertyCompareModal`)**: Compare multiple listings on price, bedrooms, bathrooms, area, and amenities.
- **Favorites & Wishlist (`FavoritesScreen`)**: Bookmarking with offline persistence.

### 3. 📄 Customer Tenancy Portal & Workflows
- **6-Tab Tenancy Hub (`CustomerPortalScreen`)**:
  1. **Active Leases**: Inspect digital tenancy contracts, sign with legal consent (`LeaseAgreementModal`), view rent schedule, and pay monthly rent.
  2. **Rental Applications**: Track application review status, manager notes, and move-in dates.
  3. **Purchase Bids & Milestone Tracking**: Submit purchase offers (`PurchaseOfferModal`), pay installment milestones with platform bank accounts (`PurchaseMilestonePaymentModal`), and inspect/share official sales receipts (`PurchaseReceiptModal`).
  4. **Viewing Tours**: Schedule in-person or virtual tours (`AppointmentModal`), view confirmation dates, and time slots.
  5. **Maintenance Tickets**: Submit repair requests with categories and urgency (`MaintenanceModal`), and track technician resolution notes.
  6. **Payment Ledger Shortcut**: Direct link to comprehensive payment history.
- **My Orders (`OrdersScreen`)**: Filter by Pending, Under Review, Approved, Completed, or Rejected with cancel action.
- **Customer Payment History (`CustomerPaymentsScreen`)**: Full transaction history with search, status filters, and detailed receipt inspection.

### 4. 💬 Real-Time Messaging & Notifications
- **Live Chat (`ChatListScreen` & `ChatDetailScreen`)**: Real-time communication via **Socket.io** with optimistic UI updates and listing reference banners.
- **Notification Center (`NotificationCenterModal`)**: Top header notification bell with dynamic unread badge, categorized alerts (Tours, Offers, Leases, Repairs), and one-tap "Mark all as read" (`PATCH /workflows/notifications/read-all`).

### 5. 💳 Virtual Escrow Wallet & Disbursements
- **Escrow Card (`WalletScreen`)**: Gradient-styled virtual card with available ETB balance.
- **Deposit Top-up**: Simulated Chapa deposit workflow with amount presets.
- **Bank Transfers & Slips (`PaymentModal`)**: Telebirr, CBE Bank Transfer, and Bank Slip reference code submission with copy-to-clipboard.

### 6. 🛡️ Admin & Manager Governance
- **Metrics Dashboard (`AdminDashboardScreen`)**: Platform KPIs (total users, active properties, pending approvals, gross platform volume).
- **Listing Approval Queue (`ApproveHousesScreen`)**: Moderation queue with 1-tap Approve/Reject and Title Deed Verification badge toggle.
- **User Governance (`AdminUsersScreen`)**: Search users, toggle Block/Active status, and modify user roles.
- **Escrow Approvals (`AdminTransactionsScreen`)**: Review and settle pending customer bank transfers and deposits.
- **Workflow Hub (`AdminWorkflowsScreen`)**:
  - Reschedule or confirm viewing tours.
  - Review rental applications with admin decision notes.
  - Inspect leases and create tenancy agreements.
  - Accept, reject, or deliver Counter-Offers to buyers.
  - Dispatch technicians to repair requests with estimated and actual costs.
  - Investigate and dismiss listing violation reports.
- **Financial Audit & Reports (`TransactionReportsScreen`)**: Aggregate transaction volumes, property purchases vs deposits breakdown, and report sharing.
- **Platform Bank Accounts (`AccountantsScreen`)**: Manage platform disbursement and receiving bank profiles (CBE, Awash, Telebirr) with active/block toggling.
- **Property Loan Tracker (`LoanTrackerScreen`)**: Track loans taken/given with repayments.
- **Feedback & Complaints Manager (`FeedbackScreen`)**: Resolve customer inquiry tickets.
- **Platform & Property QR Code Hub (`QRCodeScreen`)**: Generate QR codes for platform and individual properties with copy and share features.

### 7. 🏢 Host & Agent Tools
- **Manage Listings (`MyListingsScreen`)**: View all managed properties with status indicators, one-tap delete, and edit triggers.
- **Add Property (`CreateHouseScreen`)**: Publish new listings with images, specs, price, and amenities.
- **Edit Property (`EditHouseScreen`)**: Comprehensive editing of title, description, property type, price, security deposit, bedrooms, bathrooms, area, furnished status, amenities, and virtual 3D tour link.

### 8. 📚 Information & Academy
- **Knowledge & Video Academy (`ResourcesScreen`)**:
  - Cybersecurity standards and official property management PDF guidelines.
  - Video masterclasses and tutorials with direct playback links.
- **Company Information (`AboutScreen`)**, **Services Directory (`ServicesScreen`)**, and **Support Contact Form (`ContactScreen`)**.

### 9. 🎨 Design Aesthetics & Localization
- **Curated Themes**: Space Navy Dark Mode (`#070D18`) and Clean Light Mode (`#F8FAFC`).
- **Full Bilingual Localization**: Native support for **English** and **Amharic (አማርኛ)** across every screen, button, and notification.
- **Adaptive Backend Host**: In-app switcher in Profile to toggle between `localhost`, `10.0.2.2` (Android emulator), or physical LAN IP.

---

## 🚀 Running the App Locally

### 1. Start the Backend
Ensure your MongoDB instance is running, then start the Node.js backend:
```bash
cd hrms-backend
npm run dev
# Server running on http://localhost:3001
```

### 2. Start the Mobile App
```bash
cd hrms-mobile
npm start
```

### 3. Open on Device / Emulator
- **Physical Device**: Open the **Expo Go** app on your phone (Android or iOS) and scan the QR code displayed in the terminal.
- **Android Emulator**: Press `a` in the terminal (ensure Android Studio is running).
- **iOS Simulator**: Press `i` in the terminal (macOS only).
- **Web Preview**: Press `w` in the terminal.

---

## 📦 Tech Stack
- **Framework**: React Native 0.88 with Expo SDK 58
- **Language**: TypeScript
- **Navigation**: React Navigation 7 (Native Stack & Bottom Tabs)
- **Networking**: Axios with JWT Interceptors & AsyncStorage
- **Real-Time**: Socket.io Client
- **Design System**: Curated HSL Space Navy & Cyber Cyan Design System with Amharic / English Localization
# hrms-mobile
