/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useServices } from '@kernel/common'

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
    <div className='md:container md:mx-auto'>
      <NavBar event={event} />
      <div className='flex md:flex-row flex-wrap py-4 justify-center justify-between'>
        <div className='md:basis-1/2 grow px-8 rounded-md border-gray-800 shadow-lg min-h-screen'>
          <p>
            {eventEntity && JSON.stringify(eventEntity)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Page
