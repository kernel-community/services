/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useServices, timeUtils, Navbar, Footer, Alert } from '@kernel/common'
import EventCard from 'components/EventCard'

import AppConfig from 'App.config'

const INITIAL_STATE = { items: {} }

const actions = {
  items: (state, items) => Object.assign({}, state, { items }),
  projects: (state, projects) => Object.assign({}, state, { projects })
}

const reducer = (state, action) => {
  try {
    console.log(action.type, action.payload, state)
    return actions[action.type](state, action.payload)
  } catch (error) {
    console.log(error)
    throw new Error('UnknownActionError', { cause: `Unhandled action: ${action.type}` })
  }
}

const { humanize } = timeUtils

const Page = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const navigate = useNavigate()

  const { services, currentUser } = useServices()
  const user = currentUser()

  useEffect(() => {
    if (!user || user.role > AppConfig.minRole) {
      return navigate('/')
    }
  }, [navigate, user])

  useEffect(() => {
    (async () => {
      const { entityFactory } = await services()
      const resource = 'event'
      const events = await entityFactory({ resource })
      const items = await events.getAll()
      dispatch({ type: 'items', payload: items })

    })()
  }, [services])

  return (
    <div className='flex flex-col h-screen justify-between'>
      <Navbar
        title={AppConfig.appTitle}
        logoUrl={AppConfig.logoUrl}
        menuLinks={AppConfig.navbar?.links}
        backgroundColor='bg-kernel-dark' textColor='text-kernel-white'
      />
      <div className='mb-auto py-20 px-20 sm:px-40 lg:px-80'>
        <div className='md:basis-1/2 px-8'>
          <div className='grid grid-cols-1 gap-6'>
            <div className='block'>

            <div class="flex flex-wrap -m-4">
                {state && state.items && Object.keys(state.items).map((e) => {
                  const meta = state.items[e]
                  const eventData = state.items[e].data
                  const updated = humanize(Date.now() - meta.updated)
                  const event = {
                    ...eventData,
                    id: meta.id,
                    updated
                  }

                  return (
                      <EventCard event={event}/>
                  )
                })}
</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

    </div>
  )
}

export default Page
