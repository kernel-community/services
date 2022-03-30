/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { createContext, useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import NotFound from './views/NotFound.js'
import './App.css'

const Admin = lazy(() => import('./views/Admin.js'))
const Dashboard = lazy(() => import('./views/Dashboard.js'))

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Suspense fallback={<NotFound />}>
        <Routes>
          <Route path='/' element={<Admin />} />
          <Route path='/dashboard' element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
