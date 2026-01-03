/**
 * Utility functions untuk MyKehadiran BRS
 */

/**
 * Format date untuk display dalam Bahasa Melayu
 * @param {Date|string} date - Date object atau ISO string
 * @param {string|object} format - 'full' | 'short' | 'time' or { short: true }
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'full') => {
  if (!date) return '-'
  
  const d = new Date(date)
  
  if (isNaN(d.getTime())) return '-'

  // Handle object format { short: true }
  if (typeof format === 'object' && format.short) {
    format = 'short'
  }
  
  const options = {
    full: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }
  }
  
  return new Intl.DateTimeFormat('ms-MY', options[format]).format(d)
}

/**
 * Format time untuk display (12-hour format)
 * @param {Date|string} date - Date object atau ISO string
 * @returns {string} Formatted time string (e.g., "07:45 AM")
 */
export const formatTime = (date) => {
  if (!date) return '-'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Get greeting based on current time
 * @returns {string} Greeting message
 */
export const getGreeting = () => {
  const hour = new Date().getHours()
  
  if (hour < 12) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Tengah Hari'
  if (hour < 18) return 'Selamat Petang'
  return 'Selamat Malam'
}

/**
 * Generate random color untuk avatar
 * @param {string} name - Name untuk generate color
 * @returns {string} Hex color code
 */
export const generateAvatarColor = (name) => {
  if (!name) return '#3b82f6'
  
  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#06b6d4', '#6366f1', '#ef4444'
  ]
  
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

/**
 * Get initials from full name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '??'
  
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Calculate age from date of birth
 * @param {string} dob - Date of birth (ISO format)
 * @returns {number} Age in years
 */
export const calculateAge = (dob) => {
  if (!dob) return 0
  
  const birthDate = new Date(dob)
  const today = new Date()
  
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * Format phone number untuk display
 * @param {string} phone - Raw phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '-'
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as +60 XX-XXX XXXX
  if (cleaned.startsWith('60')) {
    return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)}-${cleaned.substring(4, 7)} ${cleaned.substring(7)}`
  }
  
  // Format as 0XX-XXX XXXX
  if (cleaned.startsWith('0')) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)} ${cleaned.substring(6)}`
  }
  
  return phone
}

/**
 * Validate MyKid format (Malaysian ID for kids)
 * @param {string} mykid - MyKid number
 * @returns {boolean} Is valid
 */
export const validateMyKid = (mykid) => {
  if (!mykid) return false
  
  // MyKid format: XXXXXX-XX-XXXX (12 digits with dashes)
  const regex = /^\d{6}-\d{2}-\d{4}$/
  return regex.test(mykid)
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} Is valid
 */
export const validateEmail = (email) => {
  if (!email) return false
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Generate unique QR code string untuk murid
 * @param {string} mykid - MyKid number
 * @returns {string} Unique QR code string
 */
export const generateQRCode = (mykid) => {
  if (!mykid) return ''
  
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const cleaned = mykid.replace(/-/g, '')
  
  return `MBK-${cleaned}-${random}-${timestamp}`.toUpperCase()
}

/**
 * Get status badge color
 * @param {string} status - Attendance status
 * @returns {string} Tailwind color class
 */
export const getStatusColor = (status) => {
  const colors = {
    PRESENT: 'bg-green-100 text-green-800',
    LATE: 'bg-yellow-100 text-yellow-800',
    ABSENT: 'bg-red-100 text-red-800',
    EXCUSED: 'bg-blue-100 text-blue-800'
  }
  
  return colors[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Get status text in Bahasa Melayu
 * @param {string} status - Attendance status
 * @returns {string} Status text
 */
export const getStatusText = (status) => {
  const texts = {
    PRESENT: 'Hadir',
    LATE: 'Lewat',
    ABSENT: 'Tidak Hadir',
    EXCUSED: 'Cuti/Izin'
  }
  
  return texts[status] || status
}

/**
 * Get role text in Bahasa Melayu
 * @param {string} role - User role
 * @returns {string} Role text
 */
export const getRoleText = (role) => {
  const texts = {
    admin: 'Pentadbir',
    teacher: 'Guru',
    parent: 'Ibu Bapa'
  }
  
  return texts[role] || role
}

/**
 * Calculate attendance percentage
 * @param {number} present - Number of present days
 * @param {number} total - Total days
 * @returns {number} Percentage (0-100)
 */
export const calculateAttendanceRate = (present, total) => {
  if (!total || total === 0) return 0
  return Math.round((present / total) * 100)
}

/**
 * Truncate text dengan ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  
  return text.substring(0, maxLength) + '...'
}

/**
 * Debounce function untuk search input
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Download data as CSV
 * @param {Array} data - Array of objects
 * @param {string} filename - Filename (without extension)
 */
export const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) return
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export const isToday = (date) => {
  if (!date) return false
  
  const d = new Date(date)
  const today = new Date()
  
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear()
}

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '-'
  
  const d = new Date(date)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Baru sahaja'
  if (diffMins < 60) return `${diffMins} minit yang lalu`
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  if (diffDays < 7) return `${diffDays} hari yang lalu`
  
  return formatDate(date, 'short')
}

export default {
  formatDate,
  formatTime,
  getGreeting,
  generateAvatarColor,
  getInitials,
  calculateAge,
  formatPhoneNumber,
  validateMyKid,
  validateEmail,
  generateQRCode,
  getStatusColor,
  getStatusText,
  getRoleText,
  calculateAttendanceRate,
  truncateText,
  debounce,
  downloadCSV,
  isToday,
  getRelativeTime
}
