# DocuChain Setup Guide

## 🚀 Quick Start

Follow these steps to get DocuChain running with your Supabase credentials:

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Go to **Settings** → **API** in your Supabase dashboard

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```bash
# Copy this template and fill in your actual values
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 3. Set Up Database Schema

In your Supabase dashboard, go to **SQL Editor** and run this schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (companies using DocuChain)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'foundation', 'professional', 'enterprise')),
  api_key UUID DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vendor_type TEXT,
  tax_id TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address JSONB,
  compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'approved', 'expired', 'rejected')),
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  expiry_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'expiring_soon', 'archived')),
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Types Configuration
CREATE TABLE document_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  expiry_required BOOLEAN DEFAULT false,
  default_expiry_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- Compliance Checks Log
CREATE TABLE compliance_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB,
  checked_by TEXT,
  api_call BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('expiry_warning', 'expired', 'missing_document', 'compliance_failed')),
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their organization" ON organizations
  FOR UPDATE USING (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Users can view profiles in their org" ON profiles
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can manage their organization's vendors" ON vendors
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their organization's documents" ON documents
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their organization's document types" ON document_types
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view their organization's compliance checks" ON compliance_checks
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their organization's alerts" ON alerts
  FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Storage RLS Policy
CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] IN (SELECT organization_id::text FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view their documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND (storage.foldername(name))[1] IN (SELECT organization_id::text FROM profiles WHERE id = auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_documents_expiry ON documents(expiry_date) WHERE status = 'active';
CREATE INDEX idx_vendors_org ON vendors(organization_id);
CREATE INDEX idx_documents_vendor ON documents(vendor_id);
CREATE INDEX idx_alerts_unresolved ON alerts(organization_id) WHERE resolved = false;
CREATE INDEX idx_profiles_org ON profiles(organization_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create organization for new user
  INSERT INTO organizations (name, slug)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company_name', split_part(NEW.email, '@', 1) || '-org'),
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'company_name', split_part(NEW.email, '@', 1) || '-' || substr(md5(random()::text), 1, 6)), ' ', '-'))
  )
  RETURNING id INTO new_org_id;
  
  -- Create profile
  INSERT INTO profiles (id, email, full_name, organization_id, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    new_org_id,
    'owner'
  );
  
  -- Insert default document types
  INSERT INTO document_types (organization_id, name, required, expiry_required, default_expiry_days)
  VALUES 
    (new_org_id, 'Business License', true, true, 365),
    (new_org_id, 'Insurance Certificate', true, true, 365),
    (new_org_id, 'W9 Form', true, false, null),
    (new_org_id, 'NDA', false, false, null),
    (new_org_id, 'Contract', false, true, 365);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 4. Configure Authentication

In your Supabase dashboard:

1. Go to **Authentication** → **Settings**
2. Set **Site URL** to `http://localhost:3000`
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`

### 5. Start the Application

```bash
npm run dev
```

Your DocuChain application will be available at `http://localhost:3000`

## 🔐 Security Notes

- Never commit your `.env.local` file to version control
- Use different Supabase projects for development and production
- Rotate your API keys regularly
- Enable 2FA on your Supabase account

## 🚀 Next Steps

1. **Test the Application**: Create an account and test all features
2. **Add Stripe Integration**: Set up payment processing for subscriptions
3. **Deploy to Production**: Use Vercel, Netlify, or your preferred platform
4. **Set up Monitoring**: Add error tracking and analytics

## 📞 Support

If you encounter any issues during setup, check:
1. Supabase project is fully provisioned
2. Environment variables are correctly set
3. Database schema was applied successfully
4. Authentication settings are configured
