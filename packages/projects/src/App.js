/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { ServicesProvider } from '@kernel/common'

import NotFound from 'views/NotFound'
import 'App.css'

const Login = lazy(() => import('views/Login'))
const Create = lazy(() => import('views/Create'))
const Edit = lazy(() => import('views/Edit'))
const Browse = lazy(() => import('views/Browse'))
const View = lazy(() => import('views/View'))

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <ServicesProvider>
        <Suspense fallback={<NotFound />}>
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/browse' element={<Browse />} />
            <Route path='/create' element={<Create />} />
            <Route path='/edit/' element={<Navigate to='/browse' />} />
            <Route path='/edit/:project' element={<Edit />} />
            <Route path='/view/:project' element={<View />} />
          </Routes>
        </Suspense>
      </ServicesProvider>
    </BrowserRouter>
  )
}

export default App
