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
import logo from './logo.svg'
import './App.css'
//import Create from './components/Create.js'
//import Import from './components/Import.js'

const Wallet = lazy(() => import('./views/Wallet.js'))
const Assets = lazy(() => import('./views/Assets.js'))
const Register = lazy(() => import('./views/Register.js'))
const Create = lazy(() => import('./components/Create.js'))
const Import = lazy(() => import('./components/Import.js'))
const Auth = lazy(() => import('./components/Auth.js'))

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Suspense fallback={<NotFound />}>
        <Routes>
          <Route path='/' element={<Wallet />} />
          <Route path='/assets' element={<Navigate to='/assets/overview' replace={true} />} />
					<Route path='/assets/overview' element={<Assets />} />

          <Route path='/assets/transactions' element={<Navigate to='/assets/overview' replace={true} />} />
          <Route path='/assets/nfts' element={<Navigate to='/assets/overview' replace={true} />} />
          <Route path='/assets/tokens' element={<Navigate to='/assets/overview' replace={true} />} />
          <Route path='/assets/contracts' element={<Navigate to='/assets/overview' replace={true} />} />

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
