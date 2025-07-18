-- PostgreSQL initialization script for Razgazdayson
-- ai_context_v3
-- 🎯 main_goal: Initialize database with pgvector extension for AI dream analysis
-- ⚡ critical_requirements: pgvector for semantic search, proper indexing
-- 📥 inputs_outputs: None -> Configured database
-- 🔧 functions_list: Extension creation, schema setup, initial tables
-- 🚫 forbidden_changes: Do not drop existing data
-- 🧪 tests: Verify extensions and indexes exist

-- Create required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For fuzzy text search

-- Create schema for vector storage
CREATE SCHEMA IF NOT EXISTS vector_store;

-- Grant permissions
GRANT ALL ON SCHEMA vector_store TO postgres;
GRANT ALL ON SCHEMA public TO postgres;

-- Create main tables
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    language_code VARCHAR(10) DEFAULT 'ru',
    timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT unique_telegram_id UNIQUE (telegram_id)
);

-- Dreams table
CREATE TABLE IF NOT EXISTS dreams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    voice_url TEXT,
    language VARCHAR(10) DEFAULT 'ru',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    CONSTRAINT check_text_length CHECK (char_length(text) >= 20 AND char_length(text) <= 4000)
);

-- Dream interpretations table
CREATE TABLE IF NOT EXISTS dream_interpretations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
    main_symbol VARCHAR(255),
    main_symbol_emoji VARCHAR(10),
    interpretation TEXT NOT NULL,
    emotions JSONB DEFAULT '[]',
    advice TEXT,
    ai_model VARCHAR(50) DEFAULT 'gpt-4-turbo-preview',
    prompt_version VARCHAR(20) DEFAULT 'v1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processing_time_ms INTEGER
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('free', 'trial', 'pro', 'yearly')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    payment_provider VARCHAR(50),
    payment_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dream tags table
CREATE TABLE IF NOT EXISTS dream_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_dream_tag UNIQUE (dream_id, tag)
);

-- User statistics table
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_dreams INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_dream_date DATE,
    favorite_symbol VARCHAR(255),
    favorite_symbol_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vector embeddings table for semantic search
CREATE TABLE IF NOT EXISTS vector_store.dream_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
    embedding vector(1536), -- OpenAI embeddings dimension
    model VARCHAR(50) DEFAULT 'text-embedding-ada-002',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_dream_embedding UNIQUE (dream_id, model)
);

-- Cached AI responses table
CREATE TABLE IF NOT EXISTS ai_response_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_hash VARCHAR(64) NOT NULL,
    response JSONB NOT NULL,
    model VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT unique_prompt_hash UNIQUE (prompt_hash, model)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_dreams_created_at ON dreams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dream_interpretations_dream_id ON dream_interpretations(dream_id);
CREATE INDEX IF NOT EXISTS idx_dream_tags_tag ON dream_tags(tag);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Create text search indexes
CREATE INDEX IF NOT EXISTS idx_dreams_text_search ON dreams USING gin(to_tsvector('russian', text));
CREATE INDEX IF NOT EXISTS idx_dream_interpretations_search ON dream_interpretations USING gin(to_tsvector('russian', interpretation));

-- Create vector similarity index
CREATE INDEX IF NOT EXISTS dream_embeddings_vector_idx 
ON vector_store.dream_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dreams_updated_at BEFORE UPDATE ON dreams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to find similar dreams
CREATE OR REPLACE FUNCTION find_similar_dreams(
    query_embedding vector(1536),
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    dream_id UUID,
    similarity FLOAT,
    dream_text TEXT,
    interpretation TEXT
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        de.dream_id,
        1 - (de.embedding <=> query_embedding) as similarity,
        d.text as dream_text,
        di.interpretation
    FROM vector_store.dream_embeddings de
    JOIN dreams d ON d.id = de.dream_id
    LEFT JOIN dream_interpretations di ON di.dream_id = d.id
    WHERE d.is_deleted = false
    ORDER BY de.embedding <=> query_embedding
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default free subscription for new users trigger
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO subscriptions (user_id, type, status)
    VALUES (NEW.id, 'free', 'active');
    
    INSERT INTO user_stats (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_user_default_subscription
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- Verify installation
DO $$
BEGIN
    RAISE NOTICE 'pgvector extension installed: %', 
        EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector');
    RAISE NOTICE 'Database initialization completed successfully';
END $$;