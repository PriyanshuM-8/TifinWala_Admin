# GharKaSwad – Admin Application

GharKaSwad is a homemade food marketplace that connects customers with local HomeChefs. The Admin Application is the central management system used to monitor, manage, and control the platform's operations.

It provides administrators with tools to manage customers, approve HomeChefs, monitor food listings, oversee orders and subscriptions, track financial transactions, and manage platform earnings.

The main objective of the Admin Application is to maintain transparency, operational control, and financial accountability across the GharKaSwad platform.

## Features

### 1. Admin Authentication
- Secure Admin login using email and password.
- JWT-based authentication.
- Protected Admin routes.
- Persistent authentication across page refreshes.
- Secure logout functionality.

### 2. Admin Dashboard
- View overall platform statistics.
- Total registered customers.
- Total registered HomeChefs.
- Pending HomeChef approval requests.
- Total orders and subscriptions.
- Completed, pending, and cancelled orders.
- Platform earnings overview.
- Recent transactions.
- Financial performance charts.

### 3. Customer Management
- View all registered customers.
- Search customers by name, email, or available details.
- View complete customer profiles.
- Check customer order history.
- View subscription information.
- Manage customer account status.
- Access customer-related information for platform operations.

### 4. HomeChef Management
- View registered HomeChefs.
- Review new HomeChef registration requests.
- Approve or reject HomeChef applications.
- View HomeChef profile and kitchen details.
- Monitor HomeChef account status.
- View HomeChef food listings.
- Monitor HomeChef orders and subscriptions.
- Access HomeChef earnings and commission information.

### 5. Food & Category Management
- Create food categories.
- Update category information.
- Upload category images.
- Activate or deactivate categories.
- View food listings.
- Review food information.
- Manage food availability and moderation where supported.

### 6. Order Management
- View all customer orders.
- Search and filter orders.
- View complete order details.
- Monitor order statuses.
- Check customer and HomeChef information.
- View food items and order amounts.
- Monitor payment methods.
- Track COD and online orders.
- Access order-related financial information.

### 7. Subscription Management
- View all customer subscriptions.
- Monitor subscription status.
- View scheduled Breakfast, Lunch, and Dinner meals.
- Track subscription activity.
- Check customer and assigned HomeChef information.
- Monitor completed, skipped, cancelled, and pending meals.

### 8. Financial Dashboard

The Financial Dashboard provides an overview of platform financial activities.

**Financial Overview:**
- Total commission revenue.
- COD handling fee revenue.
- Total customer collections.
- HomeChef earnings.
- Online payment collections.
- COD collections.
- Online discount expenses.
- Refund amounts.
- Payment gateway charges.
- Pending financial liabilities.
- Platform net contribution.
- Total withdrawals.

**Important:** Accounting net contribution and actual withdrawable cash balance are different. The system must calculate withdrawable funds using verified collections, settled expenses, liabilities, and withdrawal reservations.

### 9. Recent Transactions

The Admin Dashboard includes a Recent Transactions section displaying the latest 10 orders.

Each transaction should show:

| Field | Description |
|---|---|
| Order ID | Unique order identification |
| Food Price | Original food amount |
| Customer Paid | Actual amount paid by customer |
| HomeChef Received | HomeChef payable amount |
| Admin Commission | Commission earned by platform |
| Discount | Applied customer discount |
| Admin Net Contribution | Contribution after applicable expenses |

Additional functionality:
- View all transactions.
- Search by Order ID or customer details.
- Filter by payment method and date.
- Pagination.
- View complete transaction details.
- Responsive table and mobile card layouts.

Historical transactions must use the financial records stored at the time of the order. They must not recalculate old commission using the current commission rate.

### 10. Admin Earnings Wallet

The Admin Earnings Wallet provides a financial overview of platform earnings and available withdrawal funds.

**Wallet Information:**
- Total commission earnings.
- COD fee earnings.
- Other platform revenue.
- Promotional expenses.
- Refunds.
- Gateway charges.
- Pending liabilities.
- Pending withdrawals.
- Total successful withdrawals.
- Available withdrawal balance.

The Admin Earnings Wallet must remain separate from HomeChef Earnings Wallet and HomeChef Commission Wallet.

### 11. Bank Account Management
- Add a bank account.
- Update bank account information.
- View saved bank accounts.
- Set a default withdrawal account.
- Verify bank account details through the supported provider.
- Display masked account numbers.
- Manage account verification status.

Bank details must be handled securely and should not be exposed in frontend logs or unnecessary API responses.

### 12. Admin Withdrawal System
- Request withdrawal of available platform earnings.
- Select a verified bank account.
- Enter withdrawal amount.
- View applicable charges, if any.
- View final payable amount.
- Track withdrawal status.
- View withdrawal history.

**Withdrawal Statuses:**
- Pending
- Processing
- Successful
- Failed
- Reversed
- Cancelled

Actual status names and transitions depend on the configured payout provider.

Withdrawals must use a verified payout integration. The frontend must never display a successful withdrawal unless the backend confirms it through verified provider responses or webhooks.

### 13. Reviews & Complaints Management
- View customer reviews.
- Monitor food ratings.
- View customer complaints.
- Review reported issues.
- Manage complaints according to available platform workflows.

### 14. Reports & Analytics
- Daily and monthly order reports.
- Customer growth reports.
- HomeChef performance reports.
- Commission revenue reports.
- COD and online payment reports.
- HomeChef earnings reports.
- Subscription reports.
- Financial transaction reports.
- Withdrawal reports.

### 15. Audit Logs
- Track important Admin actions.
- Monitor approval and rejection activities.
- Track financial operations.
- Maintain administrative activity history.
- Review important changes for accountability.

## Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Development server and build tool |
| Tailwind CSS | Responsive UI styling |
| React Router DOM | Application routing |
| Axios | Backend API communication |
| Lucide React | Icons |
| Node.js | Backend runtime |
| Express.js | Backend framework |
| MongoDB | Database |
| JWT | Authentication |
| Cloudinary | Image storage |
| Socket.IO | Real-time communication, where supported |

## Project Structure

```text
Admin/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │
│   ├── pages/
│   │   ├── Authentication/
│   │   ├── Dashboard/
│   │   ├── Customers/
│   │   ├── HomeChefs/
│   │   ├── FoodManagement/
│   │   ├── Categories/
│   │   ├── Orders/
│   │   ├── Subscriptions/
│   │   ├── Transactions/
│   │   ├── FinancialDashboard/
│   │   ├── EarningsWallet/
│   │   ├── BankAccounts/
│   │   ├── Withdrawals/
│   │   ├── Reviews/
│   │   ├── Reports/
│   │   └── AuditLogs/
│   │
│   ├── components/
│   ├── layouts/
│   ├── routes/
│   ├── services/
│   ├── context/
│   ├── hooks/
│   ├── utils/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── .gitignore
├── index.html
├── package.json
└── README.md
```

*Note: The folder structure may vary according to the actual implementation.*

## Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_ADMIN_REPOSITORY_URL
```

### 2. Navigate to Admin Folder

```bash
cd Admin
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the Admin project root.

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Replace the API URL with your deployed backend URL when deploying the application.

Never expose database credentials, JWT secrets, payout provider secret keys, or private payment credentials in frontend environment variables.

### 5. Start Development Server

```bash
npm run dev
```

Open the local URL displayed in the terminal, usually:

```text
http://localhost:5173
```

### 6. Create Production Build

```bash
npm run build
```

### 7. Preview Production Build

```bash
npm run preview
```

## UI Theme & Design

The Admin Application follows the same GharKaSwad brand identity used in Customer and HomeChef applications.

| Color | Hex Code |
|---|---|
| Primary Green | `#14513F` |
| Primary Orange | `#F6A23A` |
| Cream White | `#FFFDF8` |
| Dark Text | `#27352F` |
| Secondary Text | `#737B76` |
| Light Background | `#F7F8F5` |
| Border | `#E8ECE7` |

### Design Principles
- Clean and professional Admin Dashboard.
- Consistent light theme.
- Fixed sidebar navigation on desktop.
- Responsive navigation on mobile.
- Professional charts and financial cards.
- Clear transaction tables.
- Responsive layouts for mobile, tablet, and desktop.
- No unnecessary horizontal scrolling.

## Important Financial Rules

- First accepted eligible order has a 0% commission benefit.
- Subsequent eligible orders are charged 10% commission.
- COD handling fee is ₹20.
- Online orders receive an eligible ₹20 discount.
- HomeChef Earnings Wallet and HomeChef Commission Wallet are separate.
- Online and COD collections must be accounted for separately.
- Online discount is a platform-funded expense.
- COD commission and COD fee follow the Chef Commission Wallet settlement rules.
- Reward coupon meals follow their separate earning policy.
- Historical financial records must remain unchanged.
- Financial operations must be recorded using reliable, idempotent ledger transactions.
- Admin withdrawal balance must be based on actual eligible funds, not merely accounting profit.

## Security & Data Integrity

- Only authenticated Admin users can access protected routes.
- Sensitive operations must be validated by the backend.
- Financial calculations must never rely solely on frontend values.
- Bank and payout information must be protected.
- Payment and payout success must be verified by the backend.
- Duplicate financial transactions must be prevented.
- Important administrative actions should be auditable.

## Responsive Support

The Admin Application is designed for:

- Mobile phones
- Tablets
- Laptops
- Desktop screens

## Project

**GharKaSwad – Homemade Food, Made with Love.**

A platform built to connect customers with local HomeChefs while providing transparent management and financial control.