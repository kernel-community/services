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

const Login = lazy(() => import('views/Login.js'))
const Browse = lazy(() => import('views/Browse.js'))
const View = lazy(() => import('views/View.js'))

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <ServicesProvider>
        <Suspense fallback={<NotFound />}>
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/browse' element={<Browse />} />
            <Route path='/view/:event' element={<View />} />
          </Routes>
        </Suspense>
      </ServicesProvider>
    </BrowserRouter>
  )
}

export default App
