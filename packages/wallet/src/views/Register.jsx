/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Outlet, Link } from 'react-router-dom'
import { Footer, Navbar } from '@kernel/common'

import bgImage from 'assets/images/register_bg.png'

const Register = () => {
  return (
    <div>
      <Navbar transparent />
      <main>
        <section className='absolute md:pt-32 pb-32 w-full h-full'>
          <div
            className='absolute top-0 w-full h-full bg-gray-900'
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: '100%',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className='container mx-auto px-4 py-8 h-full overflow-y-auto'>
            <div className='flex content-center items-center justify-center'>
              <div className='w-full lg:w-4/12 px-4'>
                <div className='relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-300 border-0'>
                  <div className='rounded-t mb-0 px-6 py-6'>
                    <div className='text-center mt-6'>
                      <Link to='/register/create'>
                        <div
                          className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full'
                          type='button'
                          style={{ transition: 'all .15s ease' }}
                        >
                          Create
                        </div>
                      </Link>
                    </div>
                    <div className='text-center mt-6'>
                      <Link to='/register/import'>
                        <div
                          className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full'
                          type='button'
                          style={{ transition: 'all .15s ease' }}
                        >
                          Import
                        </div>
                      </Link>
                    </div>
                  </div>
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
          <Footer absolute />
        </section>
      </main>
    </div>
  )
}

export default Register
