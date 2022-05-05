/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Footer, Navbar } from '@kernel/common'

import AppConfig from 'App.config'

const Page = ({ children }) => {
  return (
    <div className='flex flex-col h-screen justify-between'>
      <Navbar
        title={AppConfig.appTitle}
        logoUrl={AppConfig.logoUrl}
        menuLinks={AppConfig.navbar?.links}
        backgroundColor='bg-kernel-dark' textColor='text-kernel-white'
      />
      <div className='mb-auto'>
        {children}
      </div>
      <Footer backgroundColor='bg-kernel-dark' textColor='text-kernel-white'>
        built at <a href='https://kernel.community/' className='text-kernel-green-light'>KERNEL</a>
      </Footer>
    </div>
  )
}

export default Page
