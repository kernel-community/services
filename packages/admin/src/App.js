/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ServicesProvider, Loading, Login } from '@kernel/common'

import 'App.css'

const Dashboard = lazy(() => import('views/Dashboard'))
const Resources = lazy(() => import('views/Resources'))
const Entities = lazy(() => import('views/Entities'))
const Email = lazy(() => import('views/Email'))

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <ServicesProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/resources' element={<Resources />} />
            <Route path='/entities' element={<Entities />} />
            <Route path='/email' element={<Email />} />
          </Routes>
        </Suspense>
      </ServicesProvider>
    </BrowserRouter>
  )
}

export default App
