/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServices, FooterSmall, Navbar } from '@kernel/common'

import AppConfig from 'App.config'
import Sidebar from 'components/Sidebar.js'

const Dashboard = () => {
  const navigate = useNavigate()
  const { currentUser } = useServices()

  const user = currentUser()

  useEffect(() => {
    // TODO: expired token
    if (!user || user.role > AppConfig.adminRole) {
      return navigate('/')
    }
  })

  return (
    <>
      <Sidebar />
      <div className='absoulte h-full w-full md:ml-64'>
        <Navbar title={AppConfig.appTitle} />
        {/* Header */}
        <div className='relative bg-amber-200 md:pt-32 pb-32 pt-12'>
          <div className='px-4 md:px-10 mx-auto w-full' />
        </div>
        <div className='px-4 md:px-10 mx-auto w-full'>
          <div className='flex flex-wrap' />
          <div className='flex flex-wrap mt-4' />
        </div>
        <FooterSmall absolute />
      </div>
    </>
  )
}

export default Dashboard
