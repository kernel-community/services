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

// utils
import { getUrl } from './utils/urls'
import timeUtils from './utils/time'
import errorUtils from './utils/errors'

// components
import AutocompleteInput from './components/AutocompleteInput'
import Login from './components/Login'
import Navbar from './components/Navbar'
import NavbarLink from './components/NavbarLink'
import Footer from './components/Footer'
import FooterLink from './components/FooterLink'
import Alert from './components/Alert'
import Loading from './components/Loading'

// images
import linesVector from './assets/images/lines.png'

export {
  jwtService, rpcClient,
  ServicesProvider, useServices,
  getUrl, timeUtils, errorUtils,
  AutocompleteInput, Login, Footer, FooterLink, Navbar, NavbarLink, Alert, Loading,
  linesVector
}
