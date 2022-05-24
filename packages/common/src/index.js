/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// services
import jwtService from './services/jwt.js'
import rpcClient from './services/rpcClient.js'

// contexts
import { ServicesProvider, useServices } from './contexts/ServicesContext.js'

// components
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import NavbarLink from './components/NavbarLink'
import Alert from './components/Alert'

// images
import linesVector from './assets/images/lines.png'

export {
  jwtService, rpcClient,
  ServicesProvider, useServices,
  Footer, Navbar, NavbarLink, Alert,
  linesVector
}
