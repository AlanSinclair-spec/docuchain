# DocuChain

**Vendor Document Management & Compliance Tracking SaaS**

<!-- Force redeploy -->

DocuChain streamlines vendor document management and compliance tracking for businesses. Never miss an expiry date again with automated alerts and comprehensive compliance scoring.

## Features

- **Vendor Management**: Complete vendor lifecycle management with risk scoring
- **Document Tracking**: Upload, organize, and track vendor documents with expiry alerts
- **Compliance Monitoring**: Real-time compliance scoring and automated alerts
- **Stripe Billing**: Integrated subscription billing with Foundation ($79/mo) and Professional ($249/mo) plans
- **Multi-tenant Architecture**: Secure organization-based data isolation
- **Modern UI**: Built with Next.js 14, TypeScript, and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Payments**: Stripe
- **UI Components**: Radix UI, shadcn/ui
- **Deployment**: Vercel

## Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/AlanSinclair-spec/docuchain.git
cd docuchain
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Copy `.env.example` to `.env.local` and configure your Supabase and Stripe keys.

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Setup Guide

See `SETUP.md` for detailed configuration instructions for Supabase and Stripe integration.

## License

MIT License
