import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Home from '../pages/Home'
import Login from '../pages/Login'
import Map from '../pages/Map'

export default function AppRouter() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' , margin: 0 , padding: 0 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Map" element={<Map />} />
          {/* <Route path="/register" element={<Register />} /> */}
        </Routes>
      </div>
    </Router>
  )
}