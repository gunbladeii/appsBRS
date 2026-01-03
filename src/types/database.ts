/**
 * TypeScript Type Definitions untuk MyKehadiran BRS
 * Auto-generated types berdasarkan Supabase schema
 */

// =====================================================
// ENUMS
// =====================================================

export type UserRole = 'admin' | 'teacher' | 'parent'

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'

export type NotificationType = 'attendance' | 'announcement' | 'alert'

export type MBKCategory = 
  | 'Autisme' 
  | 'Down Syndrome' 
  | 'ADHD' 
  | 'Cerebral Palsy'
  | 'Disleksia'
  | 'Masalah Pembelajaran'
  | 'Lain-lain'

// =====================================================
// DATABASE TABLES
// =====================================================

export interface Profile {
  id: string // UUID
  role: UserRole
  full_name: string
  phone_number: string | null
  created_at: string
  updated_at: string
}

export interface Class {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Student {
  id: string // UUID
  full_name: string
  mykid: string
  qr_code_string: string
  class_id: number | null
  parent_id: string | null // UUID
  mbk_category: string | null
  photo_url: string | null
  date_of_birth: string | null // ISO date string
  address: string | null
  emergency_contact: string | null
  medical_notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AttendanceLog {
  id: number
  student_id: string // UUID
  recorded_by: string // UUID
  status: AttendanceStatus
  mood_note: string | null
  health_note: string | null
  scan_time: string // ISO timestamp
  date: string // ISO date
  location: string | null
  created_at: string
}

export interface Notification {
  id: number
  user_id: string // UUID
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  related_student_id: string | null // UUID
  related_attendance_id: number | null
  created_at: string
}

// =====================================================
// JOINED TYPES (untuk queries dengan relations)
// =====================================================

export interface StudentWithClass extends Student {
  class?: Class | null
}

export interface StudentWithParent extends Student {
  parent?: Profile | null
}

export interface StudentComplete extends Student {
  class?: Class | null
  parent?: Profile | null
}

export interface AttendanceLogWithStudent extends AttendanceLog {
  student?: Student
}

export interface AttendanceLogWithRecorder extends AttendanceLog {
  recorder?: Profile
}

export interface AttendanceLogComplete extends AttendanceLog {
  student?: StudentWithClass
  recorder?: Profile
}

export interface NotificationWithStudent extends Notification {
  student?: Student
}

// =====================================================
// FORM INPUT TYPES
// =====================================================

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  full_name: string
  phone_number?: string
  role: UserRole
}

export interface StudentFormData {
  full_name: string
  mykid: string
  class_id?: number
  parent_id?: string
  mbk_category?: MBKCategory | string
  photo_url?: string
  date_of_birth?: string
  address?: string
  emergency_contact?: string
  medical_notes?: string
}

export interface AttendanceFormData {
  student_id: string
  status: AttendanceStatus
  mood_note?: string
  health_note?: string
  location?: string
}

export interface ClassFormData {
  name: string
  description?: string
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  data: T | null
  error: Error | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

// =====================================================
// QR SCANNER TYPES
// =====================================================

export interface QRScanResult {
  text: string
  timestamp: Date
}

export interface ScannedStudentInfo {
  student: StudentComplete
  alreadyScanned: boolean
  previousScanTime?: string
}

// =====================================================
// DASHBOARD STATS TYPES
// =====================================================

export interface DashboardStats {
  totalStudents: number
  presentToday: number
  absentToday: number
  lateToday: number
  attendanceRate: number
}

export interface ClassStats {
  class_id: number
  class_name: string
  total_students: number
  present_count: number
  absent_count: number
  late_count: number
  attendance_rate: number
}

export interface AttendanceTrend {
  date: string
  present: number
  absent: number
  late: number
}

// =====================================================
// CONTEXT TYPES
// =====================================================

export interface AuthContextType {
  user: Profile | null
  loading: boolean
  signIn: (credentials: LoginCredentials) => Promise<void>
  signUp: (data: SignupData) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

export interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: number) => Promise<void>
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

// =====================================================
// SUPABASE TYPES (untuk type safety dengan Supabase)
// =====================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      classes: {
        Row: Class
        Insert: Omit<Class, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Class, 'id' | 'created_at'>>
      }
      students: {
        Row: Student
        Insert: Omit<Student, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Student, 'id' | 'created_at'>>
      }
      attendance_logs: {
        Row: AttendanceLog
        Insert: Omit<AttendanceLog, 'id' | 'created_at' | 'scan_time' | 'date'>
        Update: Partial<Omit<AttendanceLog, 'id' | 'created_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>
      }
    }
    Views: {
      daily_attendance_summary: {
        Row: {
          date: string
          total_present: number
          unique_students: number
          late_count: number
          absent_count: number
        }
      }
      student_attendance_rate: {
        Row: {
          id: string
          full_name: string
          mykid: string
          class_name: string
          total_days: number
          days_present: number
          attendance_percentage: number
        }
      }
    }
  }
}

export default Database
