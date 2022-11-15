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

  // {"id":"462778676350550016","owner":"168903741070639104","created":1651607534454,"updated":1651608495207,"kind":"event","uri":"resources/events/462778676350550016","data":{"nickname":"simonstaging","title":"Foo Bar","limit":"0","location":"location","start":"2020","end":"2020","description":"This is a description\n\n"}}

  window.eventEntity = eventEntity

  return (
    <div className='flex flex-col h-screen justify-between'>
      <Navbar
        title={AppConfig.appTitle}
        logoUrl={AppConfig.logoUrl}
        menuLinks={AppConfig.navbar?.links}
        backgroundColor='bg-kernel-dark' textColor='text-kernel-white'
      />
      <div className='grid gap-3 xl:grid-cols-3 mb-auto py-20 px-20 sm:px-40 lg:px-80'>
        {eventEntity &&
          <div>
            <h2 className=''>
              {eventEntity.data.title}
            </h2>
            <p className='mb-4 text-base text-gray-700'>
              {eventEntity.data.description}
            </p>
          </div>}
      </div>
      <Footer />
    </div>
  )
}
export default Page
