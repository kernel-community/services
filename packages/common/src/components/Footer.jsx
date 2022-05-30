/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react'
import { FooterLink } from '@kernel/common'

const defaults = {
  backgroundColor: 'bg-kernel-dark',
  textColor: 'text-white',
  footerLinks: [
    { app: 'explorer', title: 'explorer' },
    { app: 'unprofile', title: 'unprofile' },
    { app: 'adventures', title: 'adventures' },
    { app: 'wallet', title: 'portal' },
  ]
}

export default function Footer({ children, backgroundColor = defaults.backgroundColor, textColor = defaults.textColor, footerLinks = defaults.footerLinks }) {
  return (
    <>
      <footer className={backgroundColor}>
        <div className={`px-4 py-6 text-sm ${textColor}`}>
          <div className='text-center'>
            {children}
            <ul className='flex justify-center flex-col lg:flex-row list-none ml-3 mt-3 lg:mt-0 font-semibold'>
              {!children && footerLinks.map((link, idx) => {
                return (
                  <li key={idx} className='flex items-center'>
                    <FooterLink link={link} textColor={textColor} />
                  </li>
                )
              })}
            </ul>
            <div className='mt-5'>
              built at <a href='https://kernel.community/' className='text-kernel-green-light'>KERNEL</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
