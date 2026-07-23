# GooPayRecon 🏦

**Nền tảng đối soát tài chính thông minh** — A full-stack automated transaction entry, reconciliation, and financial balance tracking platform.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Table Engine | TanStack Table v8 (sticky header, resizable, draggable columns) |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| State | Zustand (with persist) |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (RS256) + Role-based Access Control |
| Excel | SheetJS (xlsx) |

---

## 🗂️ Project Structure

```
goopayrecon/
├── backend/           # Node.js + Express + Prisma API
│   ├── prisma/        # Schema + Seed
│   └── src/           # Routes, Services, Middleware
└── frontend/          # React + Vite SPA
    ├── public/
    │   └── templates/ # Excel download templates
    └── src/
        ├── components/ # DataBoard, Layout, UI primitives
        ├── pages/      # 9 module pages
        ├── api/        # Axios API layer
        ├── store/      # Zustand auth store
        ├── types/      # Shared TypeScript types
        └── utils/      # Formatters, column definitions
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- npm or pnpm

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL connection string

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed demo data
npm run db:seed

# Start development server (port 3001)
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server (port 3000)
npm run dev
```

Then open: **http://localhost:3000**

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@goopayrecon.com | Admin123! |
| **Editor** | editor@goopayrecon.com | Editor123! |
| **Viewer** | viewer@goopayrecon.com | Viewer123! |

---

## 📋 Modules

| Module | Path | Description |
|---|---|---|
| 1a | /partners | Partner CRUD + tree hierarchy view |
| 1b | /connectors | Connector CRUD (hard-delete guard) |
| 2 | /thu | THU transaction upload & inline edit |
| 3 | /chi | CHI transaction upload & inline edit |
| 4 | /quyet-toan | Settlement upload + payable formula |
| 5 | /balance | Cumulative opening/closing balance |
| 6 | /reconciliation | System vs Actual diff + Lock/Unlock |
| 7 | /dashboard | Monthly summary + RBAC Excel export |

---

## 🔒 Role Permissions

| Action | VIEWER | EDITOR | ADMIN |
|---|---|---|---|
| View all modules | ✅ | ✅ | ✅ |
| Upload / Edit / Delete | ❌ | ✅ | ✅ |
| Export Excel | ❌ | ✅ | ✅ |
| Lock period | ❌ | ✅ | ✅ |
| Unlock period | ❌ | ❌ | ✅ |

---

## 📊 Business Formulas

```
Payable     = Σ(THU) - Σ(CHI) - Σ(QUYET_TOAN)
Opening (D) = Σ all transactions before date D
Closing (D) = Opening(D) + THU(D) - CHI(D) - QUYET_TOAN(D)
Next Opening = Previous Closing
```

---

## 📁 Excel Templates

Templates are available at `/public/templates/`:
- `template_danh_muc_doi_tac.xlsx` — Partner import template
- `template_phat_sinh_thu.xlsx` — THU transaction import template
- `template_phat_sinh_chi.xlsx` — CHI transaction import template
- `template_quyet_toan.xlsx` — Settlement import template
