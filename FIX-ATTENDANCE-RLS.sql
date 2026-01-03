-- ============================================
-- FIX RLS POLICY FOR ATTENDANCE LOGS
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- This fixes the issue where teachers cannot insert attendance records

-- Step 1: Drop existing attendance_logs policies
DROP POLICY IF EXISTS "attendance_logs_select_policy" ON attendance_logs;
DROP POLICY IF EXISTS "attendance_logs_insert_policy" ON attendance_logs;
DROP POLICY IF EXISTS "attendance_logs_update_policy" ON attendance_logs;
DROP POLICY IF EXISTS "attendance_logs_delete_policy" ON attendance_logs;

-- Step 2: Create new policies for attendance_logs

-- Allow ADMIN full access
CREATE POLICY "attendance_logs_admin_all" ON attendance_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- Allow TEACHER to INSERT attendance (critical for QR scanning)
CREATE POLICY "attendance_logs_teacher_insert" ON attendance_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'TEACHER'
    )
  );

-- Allow TEACHER to SELECT their own recorded attendance
CREATE POLICY "attendance_logs_teacher_select" ON attendance_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'TEACHER'
    )
  );

-- Allow PARENT to SELECT their children's attendance
CREATE POLICY "attendance_logs_parent_select" ON attendance_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      JOIN profiles ON profiles.id = auth.uid()
      WHERE students.id = attendance_logs.student_id
      AND students.parent_id = profiles.id
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
WHERE tablename = 'attendance_logs'
ORDER BY policyname;
