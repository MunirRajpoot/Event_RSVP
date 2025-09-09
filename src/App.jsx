import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AuthProvider from './contexts/AuthContext'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import EventDetail from './components/Events/EventDetail'
import CreateEvent from './components/Events/CreateEvent'
import { Box } from '@mui/material'
import { useAuth } from './contexts/AuthContext'
import './App.css'
import EventsPage from './components/Events/EventsPage'
import Navbar from './components/Common/Navbar'

function AppContent() {
  const { user } = useAuth()

  if (!user) {
    return (
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <>
  <Navbar />
      <Box sx={{ p: 3 }}>
        <Routes>
          <Route path="/" element={<EventsPage />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/edit-event/:id" element={<CreateEvent />} /> 
          </Routes>
      </Box>
    </>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
