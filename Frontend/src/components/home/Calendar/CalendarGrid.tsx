/**
 * 달력 그리드
 */
interface CalendarGridProps {
  daysInMonth: number
  firstDayOfMonth: number
  isToday: (day: number) => boolean
}

export function CalendarGrid({ daysInMonth, firstDayOfMonth, isToday }: CalendarGridProps) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // 빈 셀 배열 생성 (첫 날 이전)
  const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  // 날짜 배열 생성
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="calendar-grid">
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells before first day */}
        {emptyCells.map((i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days */}
        {days.map((day) => (
          <div
            key={day}
            className={`
              aspect-square flex items-center justify-center rounded-lg text-sm
              ${isToday(day)
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
              cursor-pointer transition-colors
            `}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  )
}
