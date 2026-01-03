-- ============================================
-- COMPREHENSIVE RLS FIX - ALL TABLES
-- ============================================
-- Run this ENTIRE script in Supabase SQL Editor
-- This fixes ALL RLS policies to allow proper access

-- =============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- =============================================

-- Drop profiles policies
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Drop students policies
DROP POLICY IF EXISTS "students_select_policy" ON students;
DROP POLICY IF EXISTS "students_insert_policy" ON students;
DROP POLICY IF EXISTS "students_update_policy" ON students;
DROP POLICY IF EXISTS "students_delete_policy" ON students;
DROP POLICY IF EXISTS "students_admin_all" ON students;
DROP POLICY IF EXISTS "students_teacher_select" ON students;
DROP POLICY IF EXISTS "students_parent_select" ON students;

-- Drop attendance_logs policies
DROP POLICY IF EXISTS "attendance_logs_select_policy" ON attendance_logs;
DROP POLICY IF EXISTS "attendance_logs_insert_policy" ON attendance_logs;
DROP POLICY IF EXISTS "attendance_logs_update_policy" ON attendance_logs;
DROP POLICY IF EXISTS "attendance_logs_delete_policy" ON attendance_logs;
DROP POLICY IF EXISTS "attendance_logs_admin_all" ON attendance_logs;
DROP POLICY IF EXISTS "attendance_logs_teacher_insert" ON attendance_logs;
DROP POLICY IF EXISTS "attendance_logs_teacher_select" ON attendance_logs;
DROP POLICY IF EXISTS "attendance_logs_parent_select" ON attendance_logs;

-- Drop classes policies
DROP POLICY IF EXISTS "classes_select_policy" ON classes;
DROP POLICY IF EXISTS "classes_insert_policy" ON classes;
DROP POLICY IF EXISTS "classes_update_policy" ON classes;
DROP POLICY IF EXISTS "classes_delete_policy" ON classes;

-- Drop notifications policies
DROP POLICY IF EXISTS "notifications_select_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_policy" ON notifications;

-- =============================================
-- STEP 2: CREATE NEW SIMPLE POLICIES
-- =============================================

-- PROFILES TABLE
-- Admin: full access
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL
  USING (role = 'ADMIN');

-- All users can read all profiles (needed for lookups)
CREATE POLICY "profiles_read_all" ON profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- STUDENTS TABLE
-- Admin: full access
CREATE POLICY "students_admin_all" ON students
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- Teachers: can read ALL students (CRITICAL for scanning)
CREATE POLICY "students_teacher_read" ON students
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'TEACHER'
    )
  );

-- Parents: can read their own children
CREATE POLICY "students_parent_read" ON students
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'PARENT'
      AND profiles.id = students.parent_id
    )
  );

-- ATTENDANCE_LOGS TABLE
-- Admin: full access
CREATE POLICY "attendance_admin_all" ON attendance_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- Teachers: can INSERT (CRITICAL for scanning)
CREATE POLICY "attendance_teacher_insert" ON attendance_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'TEACHER'
    )
  );

-- Teachers: can SELECT all attendance
CREATE POLICY "attendance_teacher_read" ON attendance_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'TEACHER'
    )
  );

-- Parents: can read their children's attendance
CREATE POLICY "attendance_parent_read" ON attendance_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = attendance_logs.student_id
      AND students.parent_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'PARENT'
      )
    )
  );

-- CLASSES TABLE
-- Admin: full access
CREATE POLICY "classes_admin_all" ON classes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- Teachers and Parents: can read all classes
CREATE POLICY "classes_read_all" ON classes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('TEACHER', 'PARENT')
    )
  );

-- NOTIFICATIONS TABLE
-- Admin: full access
CREATE POLICY "notifications_admin_all" ON notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- Users can read their own notifications
CREATE POLICY "notifications_read_own" ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- =============================================
-- STEP 3: VERIFY ALL POLICIES
-- =============================================
SELECT 
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'students', 'attendance_logs', 'classes', 'notifications')
ORDER BY tablename, policyname;
