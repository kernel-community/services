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
const Portal = lazy(() => import('views/Portal'))

const Claim = lazy(() => import('views/Claim'))
const Deploy = lazy(() => import('views/Deploy'))
const Mint = lazy(() => import('views/Mint'))
const Transact = lazy(() => import('views/Transact'))

const Register = lazy(() => import('views/Register'))
const Create = lazy(() => import('components/Create'))
const Import = lazy(() => import('components/Import'))
const Auth = lazy(() => import('components/Auth'))
const Send = lazy(() => import('components/Send'))

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <ServicesProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path='/' element={<Wallet />} />
            <Route path='/portal' element={<Portal />} />

            <Route path='/portal/claim' element={<Claim />} />
            <Route path='/portal/deploy' element={<Deploy />} />
            <Route path='/portal/mint' element={<Mint />} />
            <Route path='/portal/transact' element={<Transact />} />

            <Route path='/portal/nfts' element={<Navigate to='/portal' replace />} />
            <Route path='/portal/tokens' element={<Navigate to='/portal' replace />} />
            <Route path='/portal/contracts' element={<Navigate to='/portal' replace />} />

            <Route path='/register' element={<Register />}>
              <Route path='create' element={<Create />} />
              <Route path='import' element={<Import />} />
            </Route>
            <Route path='/auth' element={<Auth />} />
            <Route path='/login' element={<Login />} />
            <Route path='/send' element={<Send />} />
          </Routes>
        </Suspense>
      </ServicesProvider>
    </BrowserRouter>
  )
}

export default App
