/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Link } from 'react-router-dom'

import Page from 'components/Page'
import Fingerprints from 'components/Fingerprints'

const Register = () => {
  return (
    <Page>
      <Fingerprints />
      <div className='mt-32 mx-8 sm:mx-24 xl:mx-48'>
        <div className='text-center'>
          <div className='font-heading lg:text-5xl text-5xl text-primary lg:py-5'>
            Welcome
          </div>
          <hr />
          <div className='text-2xl my-4 text-secondary'>
            We are greatful you are here.
          </div>
          <div className='my-4 text-secondary'>
            <p className='m-4'>Here you can create or import your very own non-custodial Kernel Wallet.</p>
          </div>
        </div>
        <div className='my-4 px-4 grid grid-cols-1 md:grid-cols-2 md:my-16 md:px-16'>
          <div>
            <h3 className='text-center font-heading text-center text-3xl text-primary py-5'>First Time User</h3>
            <div className='text-center m-8 p-5'>
              <Link className='bg-kernel-dark text-kernel-white text-center w-full p-5 rounded shadow-md' to='/register/create'>
                Create
              </Link>
            </div>
            <p className='text-center m-4'>If this is the first time visiting us, you should first <strong>Create</strong> a new Kernel Wallet.</p>
          </div>
          <div>
            <h3 className='text-center font-heading text-center text-3xl text-primary py-5'>Returning User</h3>
            <div className='text-center m-8 p-5'>
              <Link className='bg-kernel-dark text-kernel-white text-center w-full p-5 rounded shadow-md' to='/register/import'>Import</Link>
            </div>
            <p className='text-center m-4'>
              You should <strong>Import</strong> an existing Kernel Wallet on a different devices such
              as Mobile phones, Laptops, etc.
            </p>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default Register
