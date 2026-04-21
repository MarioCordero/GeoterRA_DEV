import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PrivateRoute from './PrivateRoute';
import Home from '../pages/Home'
import Login from '../pages/Login'
import Map from '../pages/Map'
import Register from '../pages/Register'
import PointDetails from '../components/mapComponents/PointDetails'
import Dashboard from '../pages/Dashboard'

export default function AppRouter() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' , margin: 0 , padding: 0 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Map" element={<Map />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/point-details/:pointId" element={<PointDetails />} />
        </Routes>
      </div>
    </Router>
  )
}