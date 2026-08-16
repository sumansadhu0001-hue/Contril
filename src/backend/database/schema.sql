-- ============================================================================
-- CONTRIL AI OS - PRODUCTION ENTERPRISE DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Includes: 32+ Normalized Tables, pgvector Extension, RLS Policies, Indexes
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Users Core Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('super_admin', 'org_admin', 'team_lead', 'user', 'guest')),
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- 2. User Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_type VARCHAR(50) DEFAULT 'business' CHECK (workspace_type IN ('business', 'creator', 'freelancer', 'student', 'personal')),
    company VARCHAR(255),
    title VARCHAR(255),
    bio TEXT,
    timezone VARCHAR(100) DEFAULT 'America/Los_Angeles',
    preferences JSONB DEFAULT '{"theme": "dark", "autonomous_mode": true, "email_notifications": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    domain VARCHAR(255),
    plan_tier VARCHAR(50) DEFAULT 'enterprise',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- 4. Teams
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Members
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    org_role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

-- 6. Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'business',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Folders
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Files
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    uploader_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- 10. Documents (Parsed Document Brain)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    file_id UUID REFERENCES files(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    full_text TEXT,
    risk_level VARCHAR(20) DEFAULT 'Low',
    key_dates JSONB DEFAULT '[]'::jsonb,
    clauses JSONB DEFAULT '[]'::jsonb,
    financials JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Emails (Synced Inbox Items)
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    preview TEXT,
    body TEXT,
    draft_reply TEXT,
    category VARCHAR(50) DEFAULT 'Inbox',
    is_read BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    received_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    attendees JSONB DEFAULT '[]'::jsonb,
    summary TEXT,
    agenda JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 13. Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'Executive',
    priority VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'pending',
    is_auto_completed BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 14. Automations
CREATE TABLE IF NOT EXISTS automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(100) NOT NULL,
    actions JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 15. Automation Runs
CREATE TABLE IF NOT EXISTS automation_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'completed',
    output_summary TEXT,
    executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 16. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 17. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'success',
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 18. Reasoning Logs (AI Orchestration Trace)
CREATE TABLE IF NOT EXISTS reasoning_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id VARCHAR(100) NOT NULL,
    prompt TEXT NOT NULL,
    reasoning_steps JSONB DEFAULT '[]'::jsonb,
    confidence_score NUMERIC(3,2) DEFAULT 0.95,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 19. Knowledge Base
CREATE TABLE IF NOT EXISTS knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 20. Vector Embeddings (pgvector)
CREATE TABLE IF NOT EXISTS vector_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- document, email, memory, note
    content_id UUID NOT NULL,
    text_chunk TEXT NOT NULL,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 21. Memory Engine
CREATE TABLE IF NOT EXISTS memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) DEFAULT 'preference',
    title VARCHAR(255) NOT NULL,
    snippet TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 22. AI Agents Registry
CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    capabilities TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 23. Integrations
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(100) NOT NULL, -- gmail, gcal, slack, notion, github
    status VARCHAR(50) DEFAULT 'connected',
    access_token TEXT,
    refresh_token TEXT,
    connected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 24. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_name VARCHAR(50) DEFAULT 'Enterprise AI OS',
    status VARCHAR(50) DEFAULT 'active',
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 25. Plans
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price_usd NUMERIC(10,2) NOT NULL,
    features JSONB NOT NULL
);

-- 26. Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    amount_usd NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'succeeded',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 27. Usage Metrics
CREATE TABLE IF NOT EXISTS usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    tokens_used BIGINT DEFAULT 0,
    api_calls_count INT DEFAULT 0,
    recorded_date DATE DEFAULT CURRENT_DATE
);

-- 28. Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
    key VARCHAR(100) PRIMARY KEY,
    is_enabled BOOLEAN DEFAULT TRUE,
    description TEXT
);

-- 29. Conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 30. Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender VARCHAR(50) NOT NULL, -- user or assistant
    content TEXT NOT NULL,
    reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 31. API Keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 32. Security & Activity Logs
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 33. Executive Plan Inquiries
CREATE TABLE IF NOT EXISTS plan_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_id VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(100),
    company VARCHAR(255),
    role VARCHAR(100),
    country VARCHAR(100),
    company_size VARCHAR(50),
    selected_plan VARCHAR(50),
    use_case TEXT,
    monthly_usage VARCHAR(50),
    budget VARCHAR(50),
    preferred_contact VARCHAR(50),
    agreed_to_terms BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Rejected')),
    assigned_to VARCHAR(255),
    notes TEXT
);

-- Indexes for ultra-fast query speed
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_content ON vector_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Row Level Security (RLS) Enablement
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory ENABLE ROW LEVEL SECURITY;

-- 34. Custom Email Verification Codes Table
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_verification_codes_email ON email_verification_codes(email);
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- 35. Active Sessions Table
CREATE TABLE IF NOT EXISTS active_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    device VARCHAR(255),
    browser VARCHAR(255),
    operating_system VARCHAR(255),
    ip_address VARCHAR(45),
    location VARCHAR(255),
    login_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    refresh_token_id VARCHAR(255),
    is_revoked BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 36. Login History Table
CREATE TABLE IF NOT EXISTS login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    user_id UUID,
    email VARCHAR(255),
    login_method VARCHAR(50),
    ip_address VARCHAR(45),
    browser VARCHAR(255),
    operating_system VARCHAR(255),
    approximate_location VARCHAR(255),
    timezone VARCHAR(100),
    is_success BOOLEAN DEFAULT TRUE,
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 37. Audit Logs Table (Append-Only)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_email VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    target_resource VARCHAR(255),
    ip_address VARCHAR(45),
    device VARCHAR(255),
    role VARCHAR(50),
    result VARCHAR(50) DEFAULT 'success',
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 38. Support Actions Table
CREATE TABLE IF NOT EXISTS support_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 39. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 40. Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    key VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 41. Workspace Memory Table
CREATE TABLE IF NOT EXISTS workspace_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    type VARCHAR(50) DEFAULT 'preference',
    title VARCHAR(255) NOT NULL,
    snippet TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 42. Queue Jobs Table
CREATE TABLE IF NOT EXISTS queue_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    job_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    retry_count INT DEFAULT 0,
    run_duration_ms INT DEFAULT 0,
    error_log TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 43. Background Jobs Table
CREATE TABLE IF NOT EXISTS background_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'idle',
    last_run TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 44. API Usage Table
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    tokens_used BIGINT DEFAULT 0,
    requests_count INT DEFAULT 0,
    recorded_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 45. System Health Table
CREATE TABLE IF NOT EXISTS system_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Healthy',
    latency_ms INT DEFAULT 0,
    last_check TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- Enable RLS for all new tables
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;

-- 46. Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Open', 'Assigned', 'Investigating', 'Waiting for User', 'Resolved', 'Closed')),
    priority VARCHAR(50) DEFAULT 'Medium',
    assigned_to UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 47. Admin Roles Table
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role_name VARCHAR(100) NOT NULL CHECK (role_name IN ('Owner', 'Super Admin', 'Admin', 'Support', 'Billing', 'Developer', 'Read Only')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 48. Admin Permissions Table
CREATE TABLE IF NOT EXISTS admin_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    permission_key VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 49. OAuth Clients Table
CREATE TABLE IF NOT EXISTS oauth_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    client_secret_hash VARCHAR(255) NOT NULL,
    redirect_uris TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 50. Integration Sync Logs Table
CREATE TABLE IF NOT EXISTS integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    integration_id UUID NOT NULL,
    provider VARCHAR(100) NOT NULL,
    items_synced INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Success',
    error_details TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 51. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- Enable RLS for additional tables
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Workspace Isolation RLS Policies
CREATE POLICY tenant_isolation_active_sessions ON active_sessions FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_login_history ON login_history FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_audit_logs ON audit_logs FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_support_actions ON support_actions FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_notifications ON notifications FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_feature_flags ON feature_flags FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_workspace_memory ON workspace_memory FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_queue_jobs ON queue_jobs FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_background_jobs ON background_jobs FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_api_usage ON api_usage FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_system_health ON system_health FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');

CREATE POLICY tenant_isolation_support_tickets ON support_tickets FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_admin_roles ON admin_roles FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_admin_permissions ON admin_permissions FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_oauth_clients ON oauth_clients FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_integration_sync_logs ON integration_sync_logs FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_system_settings ON system_settings FOR ALL USING (workspace_id = auth.jwt() ->> 'workspace_id');

-- Phase 5.1: Universal AI Engine. These generic records deliberately contain no provider-specific schema.
CREATE TABLE IF NOT EXISTS intent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    intent VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    entities JSONB NOT NULL DEFAULT '[]'::jsonb,
    context JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence NUMERIC(4,3) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tool_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    agent_id VARCHAR(100),
    connector_id VARCHAR(100),
    operation VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS connector_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    connector_id VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, connector_id)
);

CREATE TABLE IF NOT EXISTS connector_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    connector_id VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL,
    last_execution_at TIMESTAMPTZ,
    error TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, connector_id)
);

CREATE TABLE IF NOT EXISTS connector_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    connector_id VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL,
    error TEXT,
    checked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    agent_id VARCHAR(100) NOT NULL,
    intent VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_intent_logs_workspace_created ON intent_logs(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_calls_workspace_created ON tool_calls(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_workspace_created ON agent_logs(workspace_id, created_at DESC);

ALTER TABLE intent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_intent_logs ON intent_logs FOR ALL USING (workspace_id::text = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_tool_calls ON tool_calls FOR ALL USING (workspace_id::text = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_connector_registry ON connector_registry FOR ALL USING (workspace_id::text = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_connector_status ON connector_status FOR ALL USING (workspace_id::text = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_connector_health ON connector_health FOR ALL USING (workspace_id::text = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_agent_logs ON agent_logs FOR ALL USING (workspace_id::text = auth.jwt() ->> 'workspace_id');

-- Phase 5.2 Schema Extensions: Universal Connectors & Cross-Platform Aggregation
CREATE TABLE IF NOT EXISTS connector_authorizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    connector_id VARCHAR(100) NOT NULL,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    expires_at TIMESTAMPTZ,
    granted_scopes TEXT[],
    status VARCHAR(30) NOT NULL DEFAULT 'authorized',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS connector_capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connector_id VARCHAR(100) NOT NULL,
    capability_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS connector_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connector_id VARCHAR(100) NOT NULL,
    permission_key VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS search_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    domain VARCHAR(50) NOT NULL,
    query TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aggregation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_request_id UUID REFERENCES search_requests(id) ON DELETE CASCADE,
    connectors_queried TEXT[],
    total_results INT DEFAULT 0,
    failures JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_request_id UUID REFERENCES search_requests(id) ON DELETE CASCADE,
    ranking_weights JSONB DEFAULT '{}'::jsonb,
    top_result_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS provider_latency (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connector_id VARCHAR(100) NOT NULL,
    operation VARCHAR(50) NOT NULL,
    latency_ms INT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE connector_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE aggregation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_connector_auth ON connector_authorizations FOR ALL USING (workspace_id::text = auth.jwt() ->> 'workspace_id');
CREATE POLICY tenant_isolation_search_requests ON search_requests FOR ALL USING (workspace_id::text = auth.jwt() ->> 'workspace_id');

-- ============================================================================
-- PHASE 5 SUBSCRIPTION SYSTEM & FEATURE ENTITLEMENT ENGINE TABLES
-- ============================================================================

-- Normalized Plan Features Table
CREATE TABLE IF NOT EXISTS plan_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id VARCHAR(50) NOT NULL,
    feature_key VARCHAR(100) NOT NULL,
    limit_value BIGINT DEFAULT -1, -- -1 for unlimited, or specific numerical cap
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(plan_id, feature_key)
);

-- Monthly Usage Tracking Meters
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    ai_messages_count INT DEFAULT 0,
    storage_used_bytes BIGINT DEFAULT 0,
    connected_apps_count INT DEFAULT 0,
    workspaces_count INT DEFAULT 1,
    voice_requests_count INT DEFAULT 0,
    connector_requests_count INT DEFAULT 0,
    shopping_searches_count INT DEFAULT 0,
    food_searches_count INT DEFAULT 0,
    travel_searches_count INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, billing_period_start)
);

-- Audit Log of Feature Execution & Unit Consumption
CREATE TABLE IF NOT EXISTS feature_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL,
    units_consumed INT DEFAULT 1,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security Policies
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_usage_tracking ON usage_tracking FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY tenant_isolation_feature_usage_logs ON feature_usage_logs FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');

-- Seed Data: Official Contril Four Plans
INSERT INTO plans (id, name, price_usd, features) VALUES
('free', 'Free', 0, '{"price_inr": 0, "description": "Core AI OS features for individual productivity"}'::jsonb),
('pro', 'Pro', 6, '{"price_inr": 499, "description": "Designed for students, creators, freelancers and professionals"}'::jsonb),
('business', 'Business', 22, '{"price_inr": 1799, "description": "Designed for startups, agencies, growing businesses and teams"}'::jsonb),
('enterprise', 'Enterprise', -1, '{"price_inr": -1, "description": "Dedicated sovereign AI deployment for enterprise security & compliance"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Feature Limits per Plan
INSERT INTO plan_features (plan_id, feature_key, limit_value, is_enabled) VALUES
-- FREE PLAN
('free', 'ai_messages_monthly', 100, true),
('free', 'max_workspaces', 1, true),
('free', 'max_connected_apps', 2, true),
('free', 'max_storage_bytes', 5368709120, true), -- 5GB
('free', 'gmail', 0, false),
('free', 'gcal', 0, false),
('free', 'gdrive', 0, false),
('free', 'gdocs', 0, false),
('free', 'slack', 0, false),
('free', 'github', 0, false),
('free', 'ai_memory', 0, false),
('free', 'shared_memory', 0, false),
('free', 'ai_agents', 0, false),
('free', 'voice_brief', 0, false),
('free', 'shopping_assistant', 0, false),
('free', 'food_assistant', 0, false),
('free', 'travel_assistant', 0, false),

-- PRO PLAN
('pro', 'ai_messages_monthly', 2000, true),
('pro', 'max_workspaces', 5, true),
('pro', 'max_connected_apps', 10, true),
('pro', 'max_storage_bytes', 21474836480, true), -- 20GB
('pro', 'gmail', 1, true),
('pro', 'gcal', 1, true),
('pro', 'gdrive', 1, true),
('pro', 'gdocs', 1, true),
('pro', 'slack', 0, false),
('pro', 'github', 0, false),
('pro', 'ai_memory', 1, true),
('pro', 'shared_memory', 0, false),
('pro', 'ai_agents', 0, false),
('pro', 'voice_brief', 1, true),
('pro', 'shopping_assistant', 1, true),
('pro', 'food_assistant', 1, true),
('pro', 'travel_assistant', 1, true),

-- BUSINESS PLAN
('business', 'ai_messages_monthly', 10000, true),
('business', 'max_workspaces', -1, true), -- unlimited
('business', 'max_connected_apps', -1, true), -- unlimited
('business', 'max_storage_bytes', 214748364800, true), -- 200GB
('business', 'gmail', 1, true),
('business', 'gcal', 1, true),
('business', 'gdrive', 1, true),
('business', 'gdocs', 1, true),
('business', 'slack', 1, true),
('business', 'github', 1, true),
('business', 'ai_memory', 1, true),
('business', 'shared_memory', 1, true),
('business', 'ai_agents', 1, true),
('business', 'voice_brief', 1, true),
('business', 'shopping_assistant', 1, true),
('business', 'food_assistant', 1, true),
('business', 'travel_assistant', 1, true),

-- ENTERPRISE PLAN
('enterprise', 'ai_messages_monthly', -1, true),
('enterprise', 'max_workspaces', -1, true),
('enterprise', 'max_connected_apps', -1, true),
('enterprise', 'max_storage_bytes', -1, true),
('enterprise', 'gmail', 1, true),
('enterprise', 'gcal', 1, true),
('enterprise', 'gdrive', 1, true),
('enterprise', 'gdocs', 1, true),
('enterprise', 'slack', 1, true),
('enterprise', 'github', 1, true),
('enterprise', 'ai_memory', 1, true),
('enterprise', 'shared_memory', 1, true),
('enterprise', 'ai_agents', 1, true),
('enterprise', 'voice_brief', 1, true),
('enterprise', 'shopping_assistant', 1, true),
('enterprise', 'food_assistant', 1, true),
('enterprise', 'travel_assistant', 1, true),
('enterprise', 'sso', 1, true),
('enterprise', 'rbac', 1, true)
ON CONFLICT (plan_id, feature_key) DO UPDATE SET limit_value = EXCLUDED.limit_value, is_enabled = EXCLUDED.is_enabled;

-- ============================================================================
-- PHASE 5.4 AUTONOMOUS AGENTS, WORKFLOW ENGINE & NOTIFICATION TABLES
-- ============================================================================

-- Workflows Core Table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    goal_prompt TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'waiting', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- DAG Workflow Execution Nodes Table
CREATE TABLE IF NOT EXISTS workflow_execution_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    node_id VARCHAR(100) NOT NULL,
    agent_id VARCHAR(100) NOT NULL,
    connector_id VARCHAR(100),
    operation VARCHAR(100) NOT NULL,
    dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'waiting', 'completed', 'failed', 'cancelled')),
    output_payload JSONB DEFAULT '{}'::jsonb,
    error TEXT,
    duration_ms INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Long-Running Background Tasks & Scheduler Table
CREATE TABLE IF NOT EXISTS background_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- price_monitor, flight_monitor, inbox_triage, sync
    params JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed')),
    schedule_cron VARCHAR(100),
    next_run_at TIMESTAMPTZ,
    retry_count INT DEFAULT 0,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security Policies
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_execution_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_workflows ON workflows FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY tenant_isolation_workflow_nodes ON workflow_execution_nodes FOR ALL USING (
    workflow_id IN (SELECT id FROM workflows WHERE user_id::text = auth.jwt() ->> 'sub')
);
CREATE POLICY tenant_isolation_background_tasks ON background_tasks FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');

-- ============================================================================
-- PHASE 5.5 PERSONAL INTELLIGENCE LAYER, KNOWLEDGE GRAPH & CONTEXT ENGINE TABLES
-- ============================================================================

-- Multi-Entity Knowledge Graph Relationships Table
CREATE TABLE IF NOT EXISTS knowledge_graph_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL, -- person, project, company, meeting, document, task, product, trip, preference
    source_id VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL, -- works_on, authored_by, scheduled_for, located_near, purchased_from, prefers
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    weight NUMERIC(3,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User Category Memory Privacy Settings Table
CREATE TABLE IF NOT EXISTS memory_categories_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    conversation_enabled BOOLEAN DEFAULT TRUE,
    workspace_enabled BOOLEAN DEFAULT TRUE,
    shopping_enabled BOOLEAN DEFAULT TRUE,
    food_enabled BOOLEAN DEFAULT TRUE,
    travel_enabled BOOLEAN DEFAULT TRUE,
    automation_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User-Consented Preference Profiles Table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- shopping, travel, food, workspace, communication
    preference_key VARCHAR(100) NOT NULL,
    preference_value JSONB NOT NULL,
    is_consent_granted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, category, preference_key)
);

-- AI Context Execution Log & Inspector Audit Table
CREATE TABLE IF NOT EXISTS ai_context_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    memories_used JSONB DEFAULT '[]'::jsonb,
    connectors_used JSONB DEFAULT '[]'::jsonb,
    reasoning_summary TEXT,
    confidence_score NUMERIC(4,2) DEFAULT 0.95,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security Policies
ALTER TABLE knowledge_graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_categories_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_context_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_kg_edges ON knowledge_graph_edges FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY tenant_isolation_memory_settings ON memory_categories_settings FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY tenant_isolation_user_preferences ON user_preferences FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY tenant_isolation_context_logs ON ai_context_logs FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');

-- ============================================================================
-- PHASE 5.6 NATIVE AI OPERATING SYSTEM, AMBIENT INTELLIGENCE & CROSS-DEVICE TABLES
-- ============================================================================

-- Connected Devices & Health Table
CREATE TABLE IF NOT EXISTS user_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('android', 'ios', 'windows', 'macos', 'linux', 'web')),
    os_version VARCHAR(100),
    app_version VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    battery_level INT DEFAULT 100,
    last_active_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Centralized Granular Device Permissions Table
CREATE TABLE IF NOT EXISTS device_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES user_devices(id) ON DELETE CASCADE,
    permission_key VARCHAR(100) NOT NULL, -- mic, notifications, calendar, contacts, files, background, location, camera, photos, accessibility, clipboard
    status VARCHAR(50) DEFAULT 'granted' CHECK (status IN ('granted', 'denied', 'prompt')),
    purpose TEXT NOT NULL,
    last_used_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (device_id, permission_key)
);

-- Offline Sync Queue Table
CREATE TABLE IF NOT EXISTS offline_sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'synced', 'failed')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMPTZ
);

-- Universal Share Extension Submissions Table
CREATE TABLE IF NOT EXISTS universal_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- webpage, image, pdf, email, product, location
    content_data TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'processed' CHECK (status IN ('pending', 'processed', 'failed')),
    processed_output JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security Policies
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE universal_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_user_devices ON user_devices FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY tenant_isolation_device_permissions ON device_permissions FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY tenant_isolation_offline_queue ON offline_sync_queue FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY tenant_isolation_universal_shares ON universal_shares FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');

-- ============================================================================
-- PHASE 5.7 ORGANIZATIONS, TEAMS & ENTERPRISE COLLABORATION TABLES
-- ============================================================================

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (org_id, code)
);

-- Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Role-Based Access Control (RBAC) Permissions Policy Matrix Table
CREATE TABLE IF NOT EXISTS org_roles_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role_key VARCHAR(50) NOT NULL, -- owner, super_admin, admin, manager, member, guest, custom
    permission_key VARCHAR(100) NOT NULL, -- manage_billing, invite_users, delete_workspace, manage_ai, approve_automations, view_analytics, export_data
    is_allowed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (org_id, role_key, permission_key)
);

-- Approval Workflows Queue Table
CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    workflow_type VARCHAR(100) NOT NULL, -- expense_approval, document_approval, automation_approval, connector_approval, invite_approval
    title VARCHAR(255) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Shared Memory Governance Policies Table
CREATE TABLE IF NOT EXISTS shared_memory_policies (
    org_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    shared_workspace_memory_enabled BOOLEAN DEFAULT TRUE,
    department_memory_enabled BOOLEAN DEFAULT TRUE,
    team_memory_enabled BOOLEAN DEFAULT TRUE,
    project_memory_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security Policies
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_roles_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_memory_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_departments ON departments FOR ALL USING (
    org_id IN (SELECT organization_id FROM organization_members WHERE user_id::text = auth.jwt() ->> 'sub')
);
CREATE POLICY tenant_isolation_teams ON teams FOR ALL USING (
    org_id IN (SELECT organization_id FROM organization_members WHERE user_id::text = auth.jwt() ->> 'sub')
);
CREATE POLICY tenant_isolation_projects ON projects FOR ALL USING (
    org_id IN (SELECT organization_id FROM organization_members WHERE user_id::text = auth.jwt() ->> 'sub')
);
CREATE POLICY tenant_isolation_approval_workflows ON approval_workflows FOR ALL USING (
    org_id IN (SELECT organization_id FROM organization_members WHERE user_id::text = auth.jwt() ->> 'sub')
);

-- ============================================================================
-- PHASE 5.8 CONTRIL DEVELOPER PLATFORM, SDK & PUBLIC APIS TABLES
-- ============================================================================

-- Developer API Keys Table
CREATE TABLE IF NOT EXISTS developer_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    key_name VARCHAR(255) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(50) NOT NULL, -- e.g. ck_live_8f3a
    scopes TEXT[] DEFAULT ARRAY['read', 'write']::TEXT[],
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Webhook Subscriptions Table
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    target_url VARCHAR(500) NOT NULL,
    secret_key VARCHAR(255) NOT NULL,
    subscribed_events TEXT[] DEFAULT ARRAY['ai.completed', 'workflow.completed']::TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Webhook Delivery Logs Table
CREATE TABLE IF NOT EXISTS webhook_delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    response_code INT DEFAULT 200,
    status VARCHAR(50) DEFAULT 'delivered' CHECK (status IN ('delivered', 'failed', 'retrying')),
    duration_ms INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Developer Extension Registry Table
CREATE TABLE IF NOT EXISTS developer_extensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    developer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('connector', 'agent', 'workflow', 'app')),
    version VARCHAR(50) NOT NULL,
    manifest JSONB DEFAULT '{}'::jsonb,
    is_published BOOLEAN DEFAULT FALSE,
    downloads_count INT DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security Policies
ALTER TABLE developer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_extensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_developer_keys ON developer_keys FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY tenant_isolation_webhooks ON webhook_subscriptions FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY tenant_isolation_webhook_logs ON webhook_delivery_logs FOR ALL USING (
    subscription_id IN (SELECT id FROM webhook_subscriptions WHERE user_id::text = auth.jwt() ->> 'sub')
);

-- ============================================================================
-- PHASE 5.9 CONTRIL MARKETPLACE & EXTENSION ECOSYSTEM TABLES
-- ============================================================================

-- Marketplace Extensions Catalog Table
CREATE TABLE IF NOT EXISTS marketplace_extensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    developer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- ai_agents, workspace, shopping, food, travel, finance, healthcare, education, developer_tools, automations, themes
    type VARCHAR(50) NOT NULL, -- connector, agent, workflow, theme, app
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    description TEXT NOT NULL,
    icon_url VARCHAR(500),
    screenshots TEXT[] DEFAULT ARRAY[]::TEXT[],
    permissions TEXT[] DEFAULT ARRAY['workspace', 'ai']::TEXT[],
    capabilities TEXT[] DEFAULT ARRAY['search', 'execute']::TEXT[],
    downloads_count INT DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 4.90,
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT TRUE,
    is_enterprise_private BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'pending_approval', 'published', 'deprecated', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User Installed Extensions Table
CREATE TABLE IF NOT EXISTS user_installed_extensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    extension_id UUID NOT NULL REFERENCES marketplace_extensions(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'enabled' CHECK (status IN ('enabled', 'disabled', 'failed')),
    granted_permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    installed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, extension_id)
);

-- Extension Reviews & Ratings Table
CREATE TABLE IF NOT EXISTS extension_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    extension_id UUID NOT NULL REFERENCES marketplace_extensions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security Policies
ALTER TABLE marketplace_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_installed_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_read_marketplace_extensions ON marketplace_extensions FOR SELECT USING (
    status = 'published' AND (is_enterprise_private = FALSE OR org_id IN (
        SELECT organization_id FROM organization_members WHERE user_id::text = auth.jwt() ->> 'sub'
    ))
);
CREATE POLICY tenant_isolation_user_installed ON user_installed_extensions FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');
CREATE POLICY tenant_isolation_reviews ON extension_reviews FOR ALL USING (user_id::text = auth.jwt() ->> 'sub');

-- ============================================================================
-- PHASE 6.0 PRODUCTION PERFORMANCE INDICES & OPTIMIZATIONS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_conversations_user_created ON conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memory_user_cat ON memory_categories_settings(user_id, category);
CREATE INDEX IF NOT EXISTS idx_workflows_org_status ON workflows(org_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_developer_keys_hash ON developer_keys(api_key_hash);
CREATE INDEX IF NOT EXISTS idx_offline_queue_user_status ON offline_sync_queue(user_id, status);

-- ============================================================================
-- PHASE 6.1: EXECUTIVE AI, AUTONOMOUS PLANNING & PROACTIVE INTELLIGENCE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS executive_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'business' CHECK (category IN ('career', 'business', 'fitness', 'learning', 'finance', 'projects', 'travel', 'shopping', 'reading', 'health')),
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('draft', 'in_progress', 'completed', 'blocked', 'archived')),
    progress_percentage INT DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    target_completion_date TIMESTAMPTZ,
    ai_suggestions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS goal_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES executive_goals(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    step_order INT NOT NULL DEFAULT 1,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    blockers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_executive_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
    summary TEXT NOT NULL,
    priorities JSONB DEFAULT '[]'::jsonb,
    suggested_schedule JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proactive_nudges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'important' CHECK (priority IN ('urgent', 'important', 'optional', 'low')),
    nudge_type VARCHAR(50) DEFAULT 'general',
    is_dismissed BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decision_matrices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    options JSONB DEFAULT '[]'::jsonb,
    weighted_criteria JSONB DEFAULT '[]'::jsonb,
    recommendation TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE executive_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_executive_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE proactive_nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_matrices ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PHASE 6.2: PUBLIC BETA, USER VALIDATION & PRODUCT REFINEMENT TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_feedback_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('bug_report', 'feature_request', 'ai_feedback', 'connector_issue', 'general')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    user_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_telemetry_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    feature_key VARCHAR(100) NOT NULL,
    session_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crash_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    component_name VARCHAR(255),
    browser_info TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ab_test_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_key VARCHAR(100) UNIQUE NOT NULL,
    rollout_percentage INT DEFAULT 50 CHECK (rollout_percentage BETWEEN 0 AND 100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE user_feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE crash_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_experiments ENABLE ROW LEVEL SECURITY;










