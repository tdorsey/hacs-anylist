-- Database initialization script for HACS AnyList
-- This script sets up the initial database schema for the TypeScript conversion project
-- Related to TypeScript conversion issue: #1

-- Create database and user if they don't exist
CREATE DATABASE IF NOT EXISTS hacs_anylist;
CREATE USER IF NOT EXISTS 'hacs_user'@'%' IDENTIFIED BY 'defaultpassword';
GRANT ALL PRIVILEGES ON hacs_anylist.* TO 'hacs_user'@'%';
FLUSH PRIVILEGES;

-- Use the hacs_anylist database
\c hacs_anylist;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create tables for future TypeScript implementation
-- These tables will support the AnyList integration functionality

-- Users table for authentication and settings
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AnyList lists table
CREATE TABLE IF NOT EXISTS anylist_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    external_list_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    sync_enabled BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, external_list_id)
);

-- AnyList items table
CREATE TABLE IF NOT EXISTS anylist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID REFERENCES anylist_lists(id) ON DELETE CASCADE,
    external_item_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    notes TEXT,
    checked BOOLEAN DEFAULT FALSE,
    category VARCHAR(255),
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    priority INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(list_id, external_item_id)
);

-- Home Assistant integration table
CREATE TABLE IF NOT EXISTS hass_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    hass_url VARCHAR(500) NOT NULL,
    access_token VARCHAR(500) NOT NULL,
    webhook_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_connected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API keys table for external integrations
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    permissions JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_anylist_lists_user_id ON anylist_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_anylist_items_list_id ON anylist_items(list_id);
CREATE INDEX IF NOT EXISTS idx_anylist_items_checked ON anylist_items(checked);
CREATE INDEX IF NOT EXISTS idx_hass_integrations_user_id ON hass_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anylist_lists_updated_at BEFORE UPDATE ON anylist_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anylist_items_updated_at BEFORE UPDATE ON anylist_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hass_integrations_updated_at BEFORE UPDATE ON hass_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data (optional)
-- This can be uncommented when the TypeScript implementation is ready

-- INSERT INTO users (username, email, password_hash) VALUES 
-- ('admin', 'admin@example.com', '$2b$12$example_hash_here')
-- ON CONFLICT (email) DO NOTHING;

COMMIT;