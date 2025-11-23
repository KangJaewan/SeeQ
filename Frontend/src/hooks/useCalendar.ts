/**
 * Calendar 관련 Custom Hook
 */
import { useState } from 'react'
import { getDaysInMonth, getFirstDayOfMonth } from '@/utils'

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    )
  }

  return {
    year,
    month,
    daysInMonth,
    firstDayOfMonth,
    currentDate,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    isToday,
  }
}
