import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { WatchProvider } from './context/WatchContext'
import SeniorHome from './pages/SeniorHome'
import FamilyDashboard from './pages/FamilyDashboard'
import RoleSelect from './pages/RoleSelect'
import Settings from './pages/Settings'
import PWAInstallPrompt from './components/PWAInstallPrompt'

function App() {
  const [userRole, setUserRole] = useState<'senior' | 'family' | null>(null)

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as 'senior' | 'family' | null
    if (savedRole) {
      setUserRole(savedRole)
    }
  }, [])

  const handleRoleSelect = (role: 'senior' | 'family') => {
    setUserRole(role)
    localStorage.setItem('userRole', role)
  }

  const handleLogout = () => {
    setUserRole(null)
    localStorage.removeItem('userRole')
  }

  return (
    <WatchProvider>
      <BrowserRouter>
        <Routes>
          {!userRole ? (
            <Route path="*" element={<RoleSelect onSelect={handleRoleSelect} />} />
          ) : userRole === 'senior' ? (
            <>
              <Route path="/" element={<SeniorHome onLogout={handleLogout} />} />
              <Route path="/settings" element={<Settings onLogout={handleLogout} role="senior" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<FamilyDashboard onLogout={handleLogout} />} />
              <Route path="/settings" element={<Settings onLogout={handleLogout} role="family" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
        <PWAInstallPrompt />
      </BrowserRouter>
    </WatchProvider>
  )
}

export default App
