/**
 * 다크모드 토글 버튼 컴포넌트
 */
import { useUIStore } from '@/store'
import { cn } from '@/utils'

export function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useUIStore()

  return (
    <button
      onClick={toggleDarkMode}
      className={cn(
        'dark-mode-toggle',
        'relative w-14 h-14',
        'flex items-center justify-center',
        'rounded-lg',
        'transition-all',
        'bg-white dark:bg-gray-800',
        'border-2 border-gray-300 dark:border-gray-600',
        'shadow-md hover:shadow-lg',
        'hover:scale-105',
        'active:scale-95'
      )}
      title={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
      aria-label="다크 모드 전환"
    >
      {/* Light Mode Icon (Sun) */}
      <svg
        className={cn(
          'dark-mode-icon light-icon',
          'w-6 h-6',
          'transition-all',
          'text-yellow-500',
          darkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
        )}
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>

      {/* Dark Mode Icon (Moon) */}
      <svg
        className={cn(
          'dark-mode-icon dark-icon',
          'absolute w-6 h-6',
          'transition-all',
          'text-indigo-400',
          darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
        )}
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  )
}
