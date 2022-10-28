/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Link, useParams } from 'react-router-dom'

import { Footer, Navbar, linesVector } from '@kernel/common'

import AppConfig from 'App.config'

const editMenuItem = ({ group }) => {
  return (
    <Link
      key='edit'
      className='text-kernel-white px-3 py-4 lg:px-6 lg:py-2 flex items-center text-sm lowercase font-bold'
      to={`/edit/${group}`}
    >
      Edit
    </Link>
  )
}

const Page = ({ children }) => {
  const { group } = useParams()
  const additionalMenuItems = group ? [editMenuItem({ group })] : []

  return (
    <div className='flex flex-col h-screen justify-between'>
      <Navbar
        title={AppConfig.appTitle}
        logoUrl={AppConfig.logoUrl}
        homeUrl={AppConfig.homeUrl}
        menuLinks={AppConfig.navbar?.links}
        additionalMenuItems={additionalMenuItems}
        backgroundColor='bg-kernel-dark' textColor='text-kernel-white'
      />
      <div className='relative'>
        <div className='hidden lg:block lg:fixed lg:-top-24 lg:-left-52 lg:z-0'>
          <img alt='kernel fingerprint' src={linesVector} width={383} height={412} />
        </div>
        <div className='hidden lg:block lg:fixed lg:-top-12 lg:-right-52 lg:z-0'>
          <img alt='kernel fingerprint' src={linesVector} width={442} height={476} />
        </div>
      </div>
      <div className='mb-auto mx-24 py-24'>
        {children}
      </div>
      <Footer backgroundColor='bg-kernel-dark' textColor='text-kernel-white'>
        built at <a href='https://kernel.community/' className='text-kernel-green-light'>KERNEL</a>
      </Footer>
    </div>
  )
}

export default Page
