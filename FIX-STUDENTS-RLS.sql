-- ============================================
-- FIX RLS POLICY FOR STUDENTS TABLE
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- This fixes the issue where teachers cannot scan students with parent_id

-- Step 1: Drop existing students policies
DROP POLICY IF EXISTS "students_select_policy" ON students;
DROP POLICY IF EXISTS "students_insert_policy" ON students;
DROP POLICY IF EXISTS "students_update_policy" ON students;
DROP POLICY IF EXISTS "students_delete_policy" ON students;

-- Step 2: Create new policies for students table

-- Allow ADMIN full access
CREATE POLICY "students_admin_all" ON students
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- Allow TEACHER to SELECT all students (including those with parent_id)
-- This is CRITICAL for QR scanning to work
CREATE POLICY "students_teacher_select" ON students
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'TEACHER'
    )
  );

-- Allow PARENT to SELECT only their own children
CREATE POLICY "students_parent_select" ON students
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.id = students.parent_id
      AND profiles.role = 'PARENT'
    )
  );

-- Step 3: Verify policies were created
SELECT 
  schemaname,
  tablename, 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'students'
ORDER BY policyname;
