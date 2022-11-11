/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useServices, Navbar, Footer } from '@kernel/common'

import AppConfig from 'App.config'
import NavBar from 'components/NavBar'

const Page = () => {
  const navigate = useNavigate()
  const { event } = useParams()

  const { services, currentUser } = useServices()
  const user = currentUser()

  useEffect(() => {
    if (!user || user.role > AppConfig.minRole) {
      return navigate('/')
    }
  }, [navigate, user])

  const [eventEntity, setEventEntity] = useState()
  useEffect(() => {
    (async () => {
      const { entityFactory } = await services()
      const resource = 'event'
      const events = await entityFactory({ resource })
      const entity = await events.get(event)
      setEventEntity(entity)
    })()
  }, [services, event])

  return (
    <div className='flex flex-col h-screen justify-between'>
      <Navbar
        title={AppConfig.appTitle}
        logoUrl={AppConfig.logoUrl}
        menuLinks={AppConfig.navbar?.links}
        backgroundColor='bg-kernel-dark' textColor='text-kernel-white'
      />
      <div className='mb-auto py-20 px-20 sm:px-40 lg:px-80'>
        <div className='md:basis-1/2 grow px-8 rounded-md border-gray-800 shadow-lg min-h-screen'>
          <p>
            {eventEntity && JSON.stringify(eventEntity)}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Page
