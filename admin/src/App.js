/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ServicesProvider } from '@kernel/common'

import NotFound from 'views/NotFound.js'
import 'App.css'

const Admin = lazy(() => import('views/Admin.js'))
const Dashboard = lazy(() => import('views/Dashboard.js'))
const Resources = lazy(() => import('views/Resources.js'))
const Entities = lazy(() => import('views/Entities.js'))

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <ServicesProvider>
        <Suspense fallback={<NotFound />}>
          <Routes>
            <Route path='/' element={<Admin />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/resources' element={<Resources />} />
            <Route path='/entities' element={<Entities />} />
          </Routes>
        </Suspense>
      </ServicesProvider>
    </BrowserRouter>
  )
}

export default App
