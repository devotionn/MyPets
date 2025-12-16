-- ===========================================
-- COMBINED MIGRATION SCRIPT FOR MYPETS PLATFORM
-- Run this in Supabase Dashboard > SQL Editor
-- ===========================================

-- Migration: 001_initial_schema.sql
-- Description: Create initial database schema for MyPets platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (enums)
CREATE TYPE user_role AS ENUM ('user', 'publisher', 'admin');
CREATE TYPE pet_species AS ENUM ('dog', 'cat', 'rabbit', 'bird', 'other');
CREATE TYPE pet_gender AS ENUM ('male', 'female', 'unknown');
CREATE TYPE pet_size AS ENUM ('small', 'medium', 'large');
CREATE TYPE pet_status AS ENUM ('available', 'pending', 'adopted');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');
CREATE TYPE notification_type AS ENUM ('application_received', 'application_status_changed', 'message_received');

-- Create users table (extends auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'user',
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create pets table
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publisher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species pet_species NOT NULL,
    breed TEXT,
    age_years INTEGER NOT NULL DEFAULT 0,
    age_months INTEGER NOT NULL DEFAULT 0,
    gender pet_gender NOT NULL DEFAULT 'unknown',
    size pet_size NOT NULL DEFAULT 'medium',
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    health_status TEXT,
    vaccination_status TEXT,
    adoption_requirements TEXT,
    status pet_status NOT NULL DEFAULT 'available',
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create adoption_applications table
CREATE TABLE adoption_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status application_status NOT NULL DEFAULT 'pending',
    living_situation TEXT NOT NULL,
    has_other_pets BOOLEAN NOT NULL DEFAULT FALSE,
    other_pets_details TEXT,
    experience_with_pets TEXT NOT NULL,
    why_adopt TEXT NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewer_notes TEXT,
    UNIQUE(pet_id, applicant_id)
);

-- Create favorites table
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, pet_id)
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create success_stories table
CREATE TABLE success_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    adopter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    story TEXT NOT NULL,
    photos TEXT[] DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_pets_publisher_id ON pets(publisher_id);
CREATE INDEX idx_pets_species ON pets(species);
CREATE INDEX idx_pets_status ON pets(status);
CREATE INDEX idx_pets_location ON pets(location);
CREATE INDEX idx_pets_created_at ON pets(created_at DESC);

CREATE INDEX idx_applications_pet_id ON adoption_applications(pet_id);
CREATE INDEX idx_applications_applicant_id ON adoption_applications(applicant_id);
CREATE INDEX idx_applications_status ON adoption_applications(status);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_pet_id ON favorites(pet_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
    BEFORE UPDATE ON pets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Migration: 002_rls_policies.sql
-- Description: Configure Row Level Security policies for all tables
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;

-- =====================
-- USERS POLICIES
-- =====================

-- Anyone can view user profiles
CREATE POLICY "Users are viewable by everyone"
    ON users FOR SELECT
    USING (true);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- =====================
-- PETS POLICIES
-- =====================

-- Anyone can view available pets (including non-authenticated users)
CREATE POLICY "Pets are viewable by everyone"
    ON pets FOR SELECT
    USING (true);

-- Authenticated users with publisher/admin role can create pets
CREATE POLICY "Publishers can create pets"
    ON pets FOR INSERT
    WITH CHECK (
        auth.uid() = publisher_id
        AND EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('publisher', 'admin')
        )
    );

-- Publishers can update their own pets, admins can update any
CREATE POLICY "Publishers can update own pets"
    ON pets FOR UPDATE
    USING (
        auth.uid() = publisher_id
        OR EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() = publisher_id
        OR EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Publishers can delete their own pets, admins can delete any
CREATE POLICY "Publishers can delete own pets"
    ON pets FOR DELETE
    USING (
        auth.uid() = publisher_id
        OR EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- =====================
-- ADOPTION APPLICATIONS POLICIES
-- =====================

-- Applicants can view their own applications
-- Pet publishers can view applications for their pets
CREATE POLICY "Users can view relevant applications"
    ON adoption_applications FOR SELECT
    USING (
        auth.uid() = applicant_id
        OR EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = adoption_applications.pet_id
            AND pets.publisher_id = auth.uid()
        )
    );

-- Authenticated users can submit applications
CREATE POLICY "Users can submit applications"
    ON adoption_applications FOR INSERT
    WITH CHECK (
        auth.uid() = applicant_id
        AND EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = pet_id
            AND pets.status = 'available'
            AND pets.publisher_id != auth.uid()
        )
    );

-- Applicants can withdraw, publishers can update status
CREATE POLICY "Users can update applications"
    ON adoption_applications FOR UPDATE
    USING (
        auth.uid() = applicant_id
        OR EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = adoption_applications.pet_id
            AND pets.publisher_id = auth.uid()
        )
    )
    WITH CHECK (
        (auth.uid() = applicant_id AND status = 'withdrawn')
        OR EXISTS (
            SELECT 1 FROM pets
            WHERE pets.id = adoption_applications.pet_id
            AND pets.publisher_id = auth.uid()
        )
    );

-- =====================
-- FAVORITES POLICIES
-- =====================

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can remove own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- =====================
-- NOTIFICATIONS POLICIES
-- =====================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- System inserts notifications (using service role)
-- Users can mark notifications as read
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================
-- MESSAGES POLICIES
-- =====================

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Receivers can mark messages as read
CREATE POLICY "Receivers can update message read status"
    ON messages FOR UPDATE
    USING (auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = receiver_id);

-- =====================
-- SUCCESS STORIES POLICIES
-- =====================

-- Anyone can view published stories
CREATE POLICY "Published stories are viewable by everyone"
    ON success_stories FOR SELECT
    USING (is_published = true OR auth.uid() = adopter_id);

-- Adopters can create their own stories
CREATE POLICY "Adopters can create stories"
    ON success_stories FOR INSERT
    WITH CHECK (auth.uid() = adopter_id);

-- Adopters can update their own stories
CREATE POLICY "Adopters can update own stories"
    ON success_stories FOR UPDATE
    USING (auth.uid() = adopter_id)
    WITH CHECK (auth.uid() = adopter_id);

-- Adopters can delete their own stories
CREATE POLICY "Adopters can delete own stories"
    ON success_stories FOR DELETE
    USING (auth.uid() = adopter_id);

-- ===========================================
-- Storage Bucket Setup (Run after tables are created)
-- ===========================================

-- Create pet-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pet-photos',
    'pet-photos',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for pet-photos bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'pet-photos');

CREATE POLICY "Authenticated users can upload pet photos" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own uploads" ON storage.objects FOR UPDATE 
USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE 
USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
