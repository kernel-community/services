/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react'

export default function SampleFooter () {
  return (
    <footer className='relative bg-gray-300 pt-8 pb-6'>
      <div
        className='bottom-auto top-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden -mt-20'
        style={{ height: '80px' }}
      >
        <svg
          className='absolute bottom-0 overflow-hidden'
          xmlns='http://www.w3.org/2000/svg'
          preserveAspectRatio='none'
          version='1.1'
          viewBox='0 0 2560 100'
          x='0'
          y='0'
        >
          <polygon
            className='text-gray-300 fill-current'
            points='2560 0 2560 100 0 100'
          />
        </svg>
      </div>
      <div className='container mx-auto px-4'>
        <div className='flex flex-wrap'>
          <div className='w-full lg:w-6/12 px-4'>
            <h4 className='text-3xl font-semibold'>
              Giving First
            </h4>
            <h5 className='text-lg mt-0 mb-2 text-gray-700'>
              We like to share with the world.
            </h5>
            <div className='mt-6'>
              <button
                className='bg-white text-blue-400 shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2 p-3'
                type='button'
              >
                <i className='flex fab fa-twitter' />
              </button>
              <button
                className='bg-white text-gray-900 shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2 p-3'
                type='button'
              >
                <i className='flex fab fa-youtube' />
              </button>
              <button
                className='bg-white text-gray-900 shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2 p-3'
                type='button'
              >
                <i className='flex fab fa-github' />
              </button>
            </div>
          </div>
          <div className='w-full lg:w-6/12 px-4'>
            <div className='flex flex-wrap items-top mb-6'>
              <div className='w-full lg:w-4/12 px-4 ml-auto'>
                <span className='block uppercase text-gray-600 text-sm font-semibold mb-2'>
                  Useful Links
                </span>
                <ul className='list-unstyled'>
                  <li>
                    <a
                      className='text-gray-700 hover:text-gray-900 font-semibold block pb-2 text-sm'
                      href='https://kernel.community/en/start'
                    >About Us
                    </a>
                  </li>
                  <li>
                    <a
                      className='text-gray-700 hover:text-gray-900 font-semibold block pb-2 text-sm'
                      href='https://kernel.community/en/blog'
                    >Blog
                    </a>
                  </li>
                  <li>
                    <a
                      className='text-gray-700 hover:text-gray-900 font-semibold block pb-2 text-sm'
                      href='https://github.com/kernel-community'
                    >Github
                    </a>
                  </li>
                </ul>
              </div>
              <div className='w-full lg:w-4/12 px-4'>
                <span className='block uppercase text-gray-600 text-sm font-semibold mb-2'>
                  Other Resources
                </span>
                <ul className='list-unstyled'>
                  <li>
                    <a
                      className='text-gray-700 hover:text-gray-900 font-semibold block pb-2 text-sm'
                      href='https://github.com/simonkernel/kernel-services/raw/main/LICENSE'
                    >MIT License
                    </a>
                  </li>
                  <li>
                    <a
                      className='text-gray-700 hover:text-gray-900 font-semibold block pb-2 text-sm'
                      href='/#'
                    >Terms & Conditions
                    </a>
                  </li>
                  <li>
                    <a
                      className='text-gray-700 hover:text-gray-900 font-semibold block pb-2 text-sm'
                      href='/#'
                    >Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      className='text-gray-700 hover:text-gray-900 font-semibold block pb-2 text-sm'
                      href='https://kernel.community/en/start/faq/#contact'
                    >Contact Us
                    </a>
                  </li>
                </ul>

              </div>
            </div>
          </div>
        </div>
        <hr className='my-6 border-gray-400' />
        <div className='flex flex-wrap items-center md:justify-between justify-center'>
          <div className='w-full md:w-4/12 px-4 mx-auto text-center'>
            <div className='text-sm text-gray-600 font-semibold py-1'>
              Copyright © {new Date().getFullYear()}{' '} by{' '}
              <a
                href='https://kernel-community.com'
                className='text-gray-600 hover:text-gray-900'
              >
                Kernel
              </a>.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
