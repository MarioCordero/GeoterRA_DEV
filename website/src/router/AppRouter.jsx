import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PrivateRoute from './PrivateRoute';
import Home from '../pages/Home'
import Login from '../pages/Login'
import Map from '../pages/Map'
import Logged from '../pages/Logged';
import Register from '../pages/Register'
import PointDetails from '../components/mapComponents/PointDetails'
import LoggedAdmin from '../pages/LoggedAdmin'

export default function AppRouter() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' , margin: 0 , padding: 0 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Map" element={<Map />} />
          <Route path="/Logged" element={<PrivateRoute><Logged /></PrivateRoute>} />
          <Route path="/Register" element={<Register />} />
          <Route path="/point-details/:pointId" element={<PointDetails />} />
          <Route path="/LoggedAdmin" element={<PrivateRoute requireAdmin={true}><LoggedAdmin /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  )
}