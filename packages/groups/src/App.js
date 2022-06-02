/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { ServicesProvider, Loading, Login } from '@kernel/common'

import 'App.css'

const Create = lazy(() => import('views/Create.jsx'))
const Edit = lazy(() => import('views/Edit.jsx'))
const Browse = lazy(() => import('views/Browse.jsx'))
const View = lazy(() => import('views/View.jsx'))

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <ServicesProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/browse' element={<Browse />} />
            <Route path='/create' element={<Create />} />
            <Route path='/edit/' element={<Navigate to='/browse' />} />
            <Route path='/edit/:group' element={<Edit />} />
            <Route path='/view/:group' element={<View />} />
          </Routes>
        </Suspense>
      </ServicesProvider>
    </BrowserRouter>
  )
}

export default App
