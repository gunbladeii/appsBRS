/**
 * Constants untuk MyKehadiran BRS
 */

// Attendance Status Options
export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  LATE: 'LATE',
  ABSENT: 'ABSENT',
  EXCUSED: 'EXCUSED'
}

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  PARENT: 'parent'
}

// MBK Categories (Kategori Murid Berkeperluan Khas)
export const MBK_CATEGORIES = [
  'Autisme',
  'Down Syndrome',
  'ADHD',
  'Cerebral Palsy',
  'Disleksia',
  'Masalah Penglihatan',
  'Masalah Pendengaran',
  'Masalah Pembelajaran',
  'Sindrom Asperger',
  'Lain-lain'
]

// Notification Types
export const NOTIFICATION_TYPES = {
  ATTENDANCE: 'attendance',
  ANNOUNCEMENT: 'announcement',
  ALERT: 'alert'
}

// Mood Options untuk mood_note
export const MOOD_OPTIONS = [
  { value: 'happy', label: 'Gembira 😊', emoji: '😊' },
  { value: 'calm', label: 'Tenang 😌', emoji: '😌' },
  { value: 'excited', label: 'Teruja 😄', emoji: '😄' },
  { value: 'tired', label: 'Letih 😴', emoji: '😴' },
  { value: 'sad', label: 'Sedih 😢', emoji: '😢' },
  { value: 'anxious', label: 'Cemas 😰', emoji: '😰' },
  { value: 'angry', label: 'Marah 😠', emoji: '😠' },
  { value: 'sick', label: 'Tidak Sihat 🤒', emoji: '🤒' }
]

// Routes berdasarkan role
export const ROLE_ROUTES = {
  ADMIN: '/admin/dashboard',
  TEACHER: '/teacher/dashboard',
  PARENT: '/parent/dashboard',
  // Lowercase fallback for compatibility
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  parent: '/parent/dashboard'
}

// Navigation Items untuk setiap role
export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
  { label: 'Murid', path: '/admin/students', icon: 'Users' },
  { label: 'Guru', path: '/admin/teachers', icon: 'GraduationCap' },
  { label: 'Ibu Bapa', path: '/admin/parents', icon: 'UserCircle' },
  { label: 'Kelas', path: '/admin/classes', icon: 'School' },
  { label: 'Kehadiran', path: '/admin/attendance', icon: 'ClipboardCheck' },
  { label: 'Laporan', path: '/admin/reports', icon: 'FileText' },
  { label: 'Tetapan', path: '/admin/settings', icon: 'Settings' }
]

export const TEACHER_NAV_ITEMS = [
  { label: 'Dashboard', path: '/teacher/dashboard', icon: 'LayoutDashboard' },
  { label: 'Imbasan QR', path: '/teacher/scan', icon: 'QrCode' },
  { label: 'Senarai Murid', path: '/teacher/students', icon: 'Users' },
  { label: 'Kehadiran Hari Ini', path: '/teacher/attendance', icon: 'ClipboardCheck' },
  { label: 'Profil', path: '/teacher/profile', icon: 'User' }
]

export const PARENT_NAV_ITEMS = [
  { label: 'Dashboard', path: '/parent/dashboard', icon: 'LayoutDashboard' },
  { label: 'Anak Saya', path: '/parent/children', icon: 'Heart' },
  { label: 'Notifikasi', path: '/parent/notifications', icon: 'Bell' },
  { label: 'Profil', path: '/parent/profile', icon: 'User' }
]

// Date Range Presets untuk filtering
export const DATE_RANGE_PRESETS = [
  { label: 'Hari Ini', value: 'today' },
  { label: 'Semalam', value: 'yesterday' },
  { label: '7 Hari Lepas', value: '7days' },
  { label: '30 Hari Lepas', value: '30days' },
  { label: 'Bulan Ini', value: 'thisMonth' },
  { label: 'Bulan Lepas', value: 'lastMonth' }
]

// Chart Colors
export const CHART_COLORS = {
  present: '#10b981',
  late: '#f59e0b',
  absent: '#ef4444',
  excused: '#3b82f6'
}

// Pagination
export const ITEMS_PER_PAGE = 10
export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

// Scanner Settings
export const SCANNER_SETTINGS = {
  facingMode: 'environment', // Use back camera
  delay: 300, // Delay between scans (ms)
  constraints: {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'environment'
    }
  }
}

// Success Sound (base64 encoded beep sound)
export const SUCCESS_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAo='

// API Endpoints (jika ada external APIs)
export const API_ENDPOINTS = {
  // Add external API endpoints here if needed
}

// Storage Keys untuk localStorage
export const STORAGE_KEYS = {
  USER_ROLE: 'user-role',
  AUTH_TOKEN: 'mykehadiran-auth',
  THEME: 'theme',
  LAST_SCAN: 'last-scan',
  SCANNER_SETTINGS: 'scanner-settings'
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ralat rangkaian. Sila semak sambungan internet anda.',
  UNAUTHORIZED: 'Anda tidak mempunyai kebenaran untuk akses ini.',
  NOT_FOUND: 'Data tidak dijumpai.',
  SERVER_ERROR: 'Ralat pelayan. Sila cuba lagi.',
  VALIDATION_ERROR: 'Sila isi semua medan yang diperlukan.',
  DUPLICATE_ENTRY: 'Rekod sudah wujud.',
  SCAN_ERROR: 'Gagal mengimbas QR code. Sila cuba lagi.',
  CAMERA_ERROR: 'Gagal mengakses kamera. Sila berikan kebenaran kamera.'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  ATTENDANCE_RECORDED: 'Kehadiran berjaya direkod!',
  STUDENT_ADDED: 'Murid berjaya ditambah!',
  STUDENT_UPDATED: 'Maklumat murid berjaya dikemaskini!',
  STUDENT_DELETED: 'Murid berjaya dipadam!',
  PROFILE_UPDATED: 'Profil berjaya dikemaskini!',
  PASSWORD_CHANGED: 'Kata laluan berjaya ditukar!',
  NOTIFICATION_SENT: 'Notifikasi berjaya dihantar!'
}

// Validation Rules
export const VALIDATION_RULES = {
  email: {
    required: 'Email diperlukan',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Format email tidak sah'
    }
  },
  password: {
    required: 'Kata laluan diperlukan',
    minLength: {
      value: 6,
      message: 'Kata laluan mestilah sekurang-kurangnya 6 aksara'
    }
  },
  phone: {
    pattern: {
      value: /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/,
      message: 'Format nombor telefon tidak sah'
    }
  },
  mykid: {
    required: 'MyKid diperlukan',
    pattern: {
      value: /^\d{6}-\d{2}-\d{4}$/,
      message: 'Format MyKid tidak sah (XXXXXX-XX-XXXX)'
    }
  }
}

// App Metadata
export const APP_METADATA = {
  name: 'MyKehadiran BRS',
  version: '1.0.0',
  description: 'Sistem Kehadiran QR Code untuk Murid Berkeperluan Khas',
  developer: 'Jemaah Nazir',
  contact: 'support@mykehadiran.edu.my'
}

export default {
  ATTENDANCE_STATUS,
  USER_ROLES,
  MBK_CATEGORIES,
  NOTIFICATION_TYPES,
  MOOD_OPTIONS,
  ROLE_ROUTES,
  ADMIN_NAV_ITEMS,
  TEACHER_NAV_ITEMS,
  PARENT_NAV_ITEMS,
  DATE_RANGE_PRESETS,
  CHART_COLORS,
  ITEMS_PER_PAGE,
  SCANNER_SETTINGS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  STORAGE_KEYS,
  APP_METADATA
}
