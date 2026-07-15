-- 1. Create user roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    email TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Recruiter', 'Evaluator', 'Executive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Initial Users based on roles
-- Admins (Full access to all portals: Master, Recruiter, Executive, Evaluator)
INSERT INTO public.user_roles (email, role) VALUES 
('ggupta@mondee.com', 'Admin'),
('prasad@mondee.com', 'Admin'),
('mgoel@mondee.com', 'Admin'),
('dmohanraj@mondee.com', 'Admin'),

-- Technical Reviewers (Evaluator access only)
('ayalla@mondee.com', 'Evaluator'),
('ashrivastava@mondee.com', 'Evaluator'),
('amungalapara@mondee.com', 'Evaluator'),
('asahu@mondee.com', 'Evaluator'),
('bpatil@mondee.com', 'Evaluator'),
('pbaradkar@mondee.com', 'Evaluator'),
('smehndiratta@mondee.com', 'Evaluator'),
('shanagandi@mondee.com', 'Evaluator'),
('tkambaiahgari@mondee.com', 'Evaluator'),
('vranade@mondee.com', 'Evaluator')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;

-- Enable Row-Level Security on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read of user roles" ON public.user_roles;
CREATE POLICY "Allow public read of user roles" ON public.user_roles FOR SELECT USING (true);

-- 2. Create audit logs table
CREATE TABLE IF NOT EXISTS public.portal_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    action_type TEXT NOT NULL,
    record_id INT NOT NULL,
    changed_by TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on audit logs (Only Admins can read, no one can modify/delete)
ALTER TABLE public.portal_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin read of audit logs" ON public.portal_audit_logs;
CREATE POLICY "Allow admin read of audit logs" ON public.portal_audit_logs FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE email = auth.jwt()->>'email' AND role = 'Admin'));

-- 3. Create Audit Trigger Function
CREATE OR REPLACE FUNCTION public.log_portal_changes()
RETURNS TRIGGER AS $$
DECLARE
    current_user_email TEXT;
BEGIN
    current_user_email := auth.jwt()->>'email';
    
    INSERT INTO public.portal_audit_logs (table_name, action_type, record_id, changed_by, old_data, new_data)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        current_user_email,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Attach trigger to tables
DROP TRIGGER IF EXISTS audit_raw_submissions_trigger ON public.raw_submissions;
CREATE TRIGGER audit_raw_submissions_trigger AFTER INSERT OR UPDATE OR DELETE ON public.raw_submissions FOR EACH ROW EXECUTE FUNCTION public.log_portal_changes();

DROP TRIGGER IF EXISTS audit_round_1_evaluation_trigger ON public.round_1_evaluation;
CREATE TRIGGER audit_round_1_evaluation_trigger AFTER INSERT OR UPDATE OR DELETE ON public.round_1_evaluation FOR EACH ROW EXECUTE FUNCTION public.log_portal_changes();

DROP TRIGGER IF EXISTS audit_round_2_evaluation_trigger ON public.round_2_evaluation;
CREATE TRIGGER audit_round_2_evaluation_trigger AFTER INSERT OR UPDATE OR DELETE ON public.round_2_evaluation FOR EACH ROW EXECUTE FUNCTION public.log_portal_changes();

DROP TRIGGER IF EXISTS audit_round_3_evaluation_trigger ON public.round_3_evaluation;
CREATE TRIGGER audit_round_3_evaluation_trigger AFTER INSERT OR UPDATE OR DELETE ON public.round_3_evaluation FOR EACH ROW EXECUTE FUNCTION public.log_portal_changes();
