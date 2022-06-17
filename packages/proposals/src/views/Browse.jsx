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
import Page from 'components/Page'

const INITIAL_STATE = { items: {} }

const actions = {
  items: (state, items) => Object.assign({}, state, { items }),
  proposals: (state, proposals) => Object.assign({}, state, { proposals })
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

const Browse = () => {
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
      const proposals = await entityFactory({ resource: 'proposal' })
      const items = await proposals.getAll()
      dispatch({ type: 'items', payload: items })
    })()
  }, [services, user.iss])

  return (
    <Page>
      <div className='px-2 sm:px-8 lg:px-16'>
        <div className='py-4 text-4xl'>All Proposals</div>
        <ul>
          {state && state.items && Object.keys(state.items).sort().reverse().map((e) => {
            const meta = state.items[e]
            const item = state.items[e].data
            const votes = item.votes?.length || 0
            return (
              <li key={e} className='text-gray-700'>
                <Link to={`/view/${meta.id}`}>
                  {item.title} <small> {votes} votes</small>
                </Link>
              </li>
            )
          })}
        </ul>
        {(!Object.keys(state.items).length &&
          <p key='none' className='text-gray-700'>No proposals</p>)}
      </div>
    </Page>
  )
}

export default Browse
