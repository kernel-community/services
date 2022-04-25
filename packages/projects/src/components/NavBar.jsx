/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Link } from 'react-router-dom'

import AppConfig from 'App.config'

const NavBar = ({ project = '' }) => (
  <nav className='flex mx-auto py-4 px-4 justify-between'>
    <button className='basis-1/3 text-sm uppercase'>
      <Link to='/'>{AppConfig.appTitle}</Link>
    </button>
    <button className='block lg:hidden'>
      <i className='fas fa-bars' />
    </button>
    <div className='hidden md:flex grow'>
      <button className='basis-1/3 text-xs uppercase font-bold'>
        <Link to='/browse'>Browse</Link>
      </button>
      <button className='basis-1/3 cursor-pointer text-xs uppercase font-bold'>
        <Link to='/create'>Create</Link>
      </button>
      <button className='basis-1/3 text-xs uppercase font-bold'>
        <Link to={`/edit/${project}`}>Edit</Link>
      </button>
    </div>
  </nav>
)

export default NavBar
