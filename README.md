# 🏆 BetixPro -  Betting Management System

**BetixPro** is a comprehensive, end-to-end sports betting and management platform designed for private use. It features a modern, high-performance web interface, a robust backend with automated sports data synchronization, and integrated payment gateways.

---

## 🚀 Tech Stack

### Frontend (`/client`)
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Routing**: [TanStack Router](https://tanstack.com/router/latest)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Real-time**: [Socket.io Client](https://socket.io/)

### Backend (`/server`)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: JWT (JSON Web Tokens) + Cookie-based sessions
- **Validation**: [Zod](https://zod.dev/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Mailing**: [SendGrid](https://sendgrid.com/)

---

## 📂 Project Structure

```text
BetixPro/
├── client/           # React frontend application
├── server/           # Express backend API & Prisma schema
├── render.yaml       # Deployment configuration for Render
└── vercel/           # Deployment configuration for Vercel
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **pnpm** (Package manager)
- **PostgreSQL** instance

### 1. Clone the Repository
```bash
git clone <repository-url>
cd BetixPro
```

### 2. Backend Setup (`/server`)
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`.
   - Fill in the required values (Database URL, JWT secrets, API keys).
4. Initialize the database:
   ```bash
   pnpm prisma:migrate
   pnpm prisma:seed
   ```
5. Start development server:
   ```bash
   pnpm dev
   ```

### 3. Frontend Setup (`/client`)
1. Navigate to the client directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`.
   - Set `VITE_API_URL` to your backend URL.
4. Start development server:
   ```bash
   pnpm dev
   ```

---

## 💎 Key Features

- **Automated Sports Data**: Real-time synchronization with [TheOddsAPI](https://the-odds-api.com/) for various sports.
- **Wallet & Payments**: Integrated with **M-Pesa (Safaricom)** and **Paystack** for deposits and withdrawals.
- **Comprehensive Betting**: Support for standard and custom events, multiple market types, and real-time odds updates.
- **Admin Dashboard**: Advanced management of users, bets, financial reports, and platform settings.
- **Risk Management**: Automated risk alerts, suspicious pattern detection, and account status controls.
- **2FA Security**: Multi-factor authentication for administrative accounts.
- **Real-time Notifications**: Instant alerts for bet results, deposits, and system events via WebSockets.

---

## 📜 Maintenance

- **Database Migrations**: Always use `pnpm prisma:migrate` when updating the schema.
- **Odds Sync**: The system includes automated jobs for fetching latest odds. Monitor `api_sync_logs` in the admin dashboard.
- **Logs**: Backend uses `morgan` for request logging and custom audit logs for bets and admin actions.

---

## 🔒 License

 All rights reserved.
