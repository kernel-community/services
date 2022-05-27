/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import NotFound from 'views/NotFound.jsx'
import 'App.css'

const Wallet = lazy(() => import('views/Wallet.jsx'))
const Home = lazy(() => import('views/Home.jsx'))
const Register = lazy(() => import('views/Register.jsx'))
const Create = lazy(() => import('components/Create.jsx'))
const Import = lazy(() => import('components/Import.jsx'))
const Auth = lazy(() => import('components/Auth.jsx'))

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Suspense fallback={<NotFound />}>
        <Routes>
          <Route path='/' element={<Wallet />} />
          <Route path='/home' element={<Home />} />

          <Route path='/home/transactions' element={<Navigate to='/home' replace />} />
          <Route path='/home/nfts' element={<Navigate to='/home' replace />} />
          <Route path='/home/tokens' element={<Navigate to='/home' replace />} />
          <Route path='/home/contracts' element={<Navigate to='/home' replace />} />

          <Route path='/register' element={<Register />}>
            <Route path='create' element={<Create />} />
            <Route path='import' element={<Import />} />
          </Route>
          <Route path='/auth' element={<Auth />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
