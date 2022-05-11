/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useServices } from '@kernel/common'

import AppConfig from 'App.config'
import NavBar from 'components/NavBar'

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

// Credits: https://stackoverflow.com/a/68121710
const timeScalars = [1000, 60, 60, 24, 7, 52]
const timeUnits = ['ms', 'secs', 'min(s)', 'hr(s)', 'day(s)', 'week(s)', 'year(s)']

const humanize = (ms, dp = 0) => {
  let timeScalarIndex = 0; let scaledTime = ms

  while (scaledTime > timeScalars[timeScalarIndex]) {
    scaledTime /= timeScalars[timeScalarIndex++]
  }

  return `${scaledTime.toFixed(dp)} ${timeUnits[timeScalarIndex]}`
}

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
    <div className='md:container md:mx-auto'>
      <NavBar />
      <div className='flex md:flex-row flex-wrap py-4 justify-center justify-between'>
        <div className='md:basis-1/2 px-8'>
          <div className='grid grid-cols-1 gap-6'>
            <div className='block'>
              <ul>
                {state && state.items && Object.keys(state.items).map((e) => {
                  const meta = state.items[e]
                  const event = state.items[e].data
                  const updated = Date.now() - meta.updated
                  return (
                    <li key={e} className='text-gray-700'>
                      <Link to={`/view/${meta.id}`}>{event.title}</Link>
                      <small> {humanize(updated)} ago</small>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
