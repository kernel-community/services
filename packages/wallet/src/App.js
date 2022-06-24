/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ServicesProvider, Loading, Login } from '@kernel/common'

import 'App.css'

const Wallet = lazy(() => import('views/Wallet'))
const Home = lazy(() => import('views/Home'))
const Claim = lazy(() => import('views/Claim'))

const Register = lazy(() => import('views/Register'))
const Create = lazy(() => import('components/Create'))
const Import = lazy(() => import('components/Import'))
const Auth = lazy(() => import('components/Auth'))

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <ServicesProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path='/' element={<Wallet />} />
            <Route path='/home' element={<Home />} />

            <Route path='/home/claim' element={<Claim />} />

            <Route path='/home/transactions' element={<Navigate to='/home' replace />} />
            <Route path='/home/nfts' element={<Navigate to='/home' replace />} />
            <Route path='/home/tokens' element={<Navigate to='/home' replace />} />
            <Route path='/home/contracts' element={<Navigate to='/home' replace />} />

            <Route path='/register' element={<Register />}>
              <Route path='create' element={<Create />} />
              <Route path='import' element={<Import />} />
            </Route>
            <Route path='/auth' element={<Auth />} />
            <Route path='/login' element={<Login />} />
          </Routes>
        </Suspense>
      </ServicesProvider>
    </BrowserRouter>
  )
}

export default App
