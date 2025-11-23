/**
 * 달력 컴포넌트
 */
import { useCalendar } from '@/hooks'
import { CalendarGrid } from './CalendarGrid'

export function Calendar() {
  const {
    year,
    month,
    daysInMonth,
    firstDayOfMonth,
    goToPreviousMonth,
    goToNextMonth,
    isToday,
  } = useCalendar()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="calendar-section bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transition-colors">
      {/* Calendar Header */}
      <div className="calendar-header flex justify-between items-center mb-4">
        <div className="library-title-main flex items-center gap-2">
          <div className="calendar-icon-main w-6 h-6 bg-indigo-600 rounded" />
          <span className="library-text text-lg font-semibold text-gray-900 dark:text-white">
            달력
          </span>
        </div>

        {/* Calendar Navigation */}
        <div className="calendar-nav flex items-center gap-3">
          <button
            onClick={goToPreviousMonth}
            className="calendar-nav-btn w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ‹
          </button>
          <span className="calendar-month-year text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={goToNextMonth}
            className="calendar-nav-btn w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="calendar-container">
        <CalendarGrid
          daysInMonth={daysInMonth}
          firstDayOfMonth={firstDayOfMonth}
          isToday={isToday}
        />
      </div>
    </div>
  )
}
