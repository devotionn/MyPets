-- Migration: 002_rls_policies.sql
-- Description: Configure Row Level Security policies for all tables

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
