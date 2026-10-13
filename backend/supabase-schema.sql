-- ==============================================================================
-- MULTIMODAL AI STUDYMATE - SUPABASE DATABASE SCHEMA & STORAGE SETUP
-- ==============================================================================
-- Run this script in your Supabase project's SQL Editor (Dashboard > SQL Editor)
-- It will create all necessary tables, indexes, storage buckets, and policies.

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CREATE TABLES
-- ==============================================================================

-- Documents Table: Stores uploaded PDFs and image metadata
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    mimetype TEXT NOT NULL,
    size BIGINT DEFAULT 0,
    page_count INTEGER DEFAULT 1,
    word_count INTEGER DEFAULT 0,
    text_preview TEXT,
    storage_path TEXT,
    public_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Chat History Table: Saves student questions and AI multimodal answers
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id TEXT REFERENCES public.documents(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Summaries Table: Saves AI generated document summaries & key takeaways
CREATE TABLE IF NOT EXISTS public.summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id TEXT REFERENCES public.documents(id) ON DELETE CASCADE,
    style TEXT DEFAULT 'detailed',
    focus_topic TEXT,
    summary_text TEXT NOT NULL,
    key_takeaways JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Quiz Results Table: Saves interactive quizzes and student scores
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id TEXT REFERENCES public.documents(id) ON DELETE CASCADE,
    difficulty TEXT DEFAULT 'medium',
    score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    questions JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==============================================================================
-- 3. CREATE INDEXES FOR FAST RETRIEVAL
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_document_id ON public.chat_history(document_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_summaries_document_id ON public.summaries(document_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_document_id ON public.quiz_results(document_id, created_at DESC);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) & PUBLIC POLICIES
-- ==============================================================================
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Allow read/write access with Supabase anon key
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public select documents" ON public.documents;
    CREATE POLICY "Public select documents" ON public.documents FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public insert documents" ON public.documents;
    CREATE POLICY "Public insert documents" ON public.documents FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Public update documents" ON public.documents;
    CREATE POLICY "Public update documents" ON public.documents FOR UPDATE USING (true);

    DROP POLICY IF EXISTS "Public select chat_history" ON public.chat_history;
    CREATE POLICY "Public select chat_history" ON public.chat_history FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public insert chat_history" ON public.chat_history;
    CREATE POLICY "Public insert chat_history" ON public.chat_history FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Public select summaries" ON public.summaries;
    CREATE POLICY "Public select summaries" ON public.summaries FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public insert summaries" ON public.summaries;
    CREATE POLICY "Public insert summaries" ON public.summaries FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Public select quiz_results" ON public.quiz_results;
    CREATE POLICY "Public select quiz_results" ON public.quiz_results FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public insert quiz_results" ON public.quiz_results;
    CREATE POLICY "Public insert quiz_results" ON public.quiz_results FOR INSERT WITH CHECK (true);
END $$;

-- ==============================================================================
-- 5. STORAGE BUCKET CONFIGURATION ('study-materials')
-- ==============================================================================
-- Create the public storage bucket for uploaded study files if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies: allow anyone with anon key to upload and view documents
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access to study-materials" ON storage.objects;
    CREATE POLICY "Public access to study-materials" ON storage.objects
        FOR SELECT USING (bucket_id = 'study-materials');

    DROP POLICY IF EXISTS "Public insert to study-materials" ON storage.objects;
    CREATE POLICY "Public insert to study-materials" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'study-materials');

    DROP POLICY IF EXISTS "Public update to study-materials" ON storage.objects;
    CREATE POLICY "Public update to study-materials" ON storage.objects
        FOR UPDATE USING (bucket_id = 'study-materials');
END $$;
