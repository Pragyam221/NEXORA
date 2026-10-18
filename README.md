# NEXORA — Business Intelligence Suite

A comprehensive, production-grade enterprise SaaS Business Intelligence & Analytics dashboard for monitoring business performance across Leads, Quotations, Deals, Revenue, Fulfillment Orders, and Payments.

Built with **React 18**, **TypeScript**, **Tailwind CSS**, **Recharts**, **React Router v6**, and **date-fns**.

---

## 🚀 Live Deployment Instructions

The project is fully pre-configured for zero-config 1-click deployment on **Vercel** or **Netlify**:

### Option 1: Deploy with Vercel (Recommended)
1. Push this repository to your GitHub account:
   ```bash
   git remote add origin https://github.com/<your-username>/nexora-bi-suite.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Framework Preset: **Vite** (auto-detected).
4. Build Command: `npm run build` (auto-detected).
5. Output Directory: `dist` (auto-detected).
6. Click **Deploy**. Vercel will build and provide your public hosted URL (e.g., `https://nexora-bi-suite.vercel.app`).
   *(SPA route fallback is already configured in `vercel.json`)*.

### Option 2: Deploy with Netlify
1. Connect your repository at [app.netlify.com](https://app.netlify.com).
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Click **Deploy Site**.
   *(SPA route fallback is already configured in `public/_redirects`)*.

---

## 🛠 Local Development & Testing

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run production build (TypeScript check + Vite bundler)
npm run build

# Preview production build locally
npm run preview
```

---

## 💎 Design & Visual Architecture

- **Palette**:
  - Dark Navy Canvas: `#0B1020`
  - Elevated Cards & Drawers: `#11182A` & `#151B2E`
  - Primary Violet Accent: `#7C5CFC`
  - Secondary Electric Blue: `#4F8CFF`
  - Positive Indicators: `#20D6A0`
  - Negative Indicators: `#FF647C`
  - Warning Indicators: `#F5B942`
- **Typography**: Inter with JetBrains Mono for monetary identifiers.
- **Micro-Interactions**: Real hover states, smooth transitions, toast alerts, confirmation dialogs, and slide-over drawers.

---

## 📊 Core Features

### 1. Shared Reporting Date Filter System
- Options: **Today**, **Last 7 Days**, **Last 30 Days**, and **Custom Date Range**.
- **Comparison Logic**:
  - *Today* compares against the prior day.
  - *Last 7 Days* compares against the preceding 7-day period.
  - *Last 30 Days* compares against the preceding 30-day period.
  - *Custom Range* compares against the preceding period of identical duration.
- Changing the date range immediately recalculates all KPI cards, comparisons, and charts.

### 2. Strict Revenue Recognition Standard
- **Total Deal Value**: Represents contracted commercial pipeline.
- **Collected Revenue**: Solely derived from confirmed `Successful` payments.
- **Outstanding Balance**: Won deals value minus collected revenue (preventing double counting).
- **Quote-to-Deal Conversion**: Accepted proposals divided by eligible non-draft quotations.

### 3. Complete Module Suite
- **Overview**: 10 executive KPI cards, current vs. previous revenue area chart, conversion funnel, revenue by service category donut, acquisition channels, deal priorities, recent activity stream, and dynamic AI business insights.
- **Lead Analytics**: Searchable, sortable, filterable lead table with drawer detail, status workflow, and CSV export. Includes "Create Lead" modal.
- **Quotations**: Proposal pipeline, validity dates, linked deals, and "Create Quotation" modal referencing existing leads.
- **Deals & Revenue**: Pipeline stages (New, Proposal, Negotiation, Won, Lost), priority indicators, owner breakdown, and "Create Deal" modal.
- **Orders**: Fulfillment progress bars (0-100%), delivery milestones, status updates, and "New Order" modal.
- **Payments**: Reconciled cash ledger across UPI, RTGS/NEFT, corporate cards, and "Record Payment" modal.
- **Reports**: 6 comprehensive business reports with interactive charts, CSV export, and print formatting (`window.print()`).
- **Settings**: Dark/Light theme toggle, comfortable/compact density, date formatting standards, and factory reset dialog.
