/**
 * App Component - React Router Setup
 */
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage, HomePage, DashboardPage, QuizMateSite } from '@/pages'
import LoginPage from '@/components/ui/LoginPage'
import { useUIStore } from '@/store/useUIStore'

export default function App() {
  const { darkMode, fontSize } = useUIStore()

  // Apply dark mode class to html element on mount and when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Apply font size to html element
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`
  }, [fontSize])

  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Home Page (after login) */}
        <Route path="/home" element={<HomePage />} />

        {/* Dashboard Page */}
        <Route path="/dashboard/:folderId?" element={<DashboardPage />} />

        {/* Quiz Page */}
        <Route path="/quiz" element={<QuizMateSite />} />

        {/* Catch-all redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}