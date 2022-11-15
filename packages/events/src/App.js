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

const Create = lazy(() => import('views/Create.js'))
const Edit = lazy(() => import('views/Edit.js'))
const Browse = lazy(() => import('views/Browse.js'))
const View = lazy(() => import('views/View.js'))

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
            <Route path='/edit/:event' element={<Edit />} />
            <Route path='/view/:event' element={<View />} />
          </Routes>
        </Suspense>
      </ServicesProvider>
    </BrowserRouter>
  )
}

export default App
