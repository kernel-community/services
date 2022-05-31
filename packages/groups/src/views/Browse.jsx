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
  groups: (state, groups) => Object.assign({}, state, { groups })
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
      const members = await entityFactory({ resource: 'member' })
      // note: assigning default value since it may not exist yet
      const { data: { groupIds = [] } } = await members.get(user.iss)
      const groups = await entityFactory({ resource: 'group' })
      const items = await Promise.all(groupIds.map((e) => groups.get(e)))
      dispatch({ type: 'items', payload: items })
    })()
  }, [services, user.iss])

  return (
    <Page>
      <div className='px-2 sm:px-8 lg:px-16'>
        <div className='py-4 text-4xl'>All groups</div>
        <ul>
          {state && state.items && Object.keys(state.items).map((e) => {
            const meta = state.items[e]
            const group = state.items[e].data
            return (
              <li key={e} className='text-gray-700'>
                <Link to={`/view/${meta.id}`}>
                  {group.name} <small> {meta.id} - {group.memberIds.length} members</small>
                </Link>
              </li>
            )
          })}
        </ul>
        {(!Object.keys(state.items).length &&
          <p key='none' className='text-gray-700'>No groups</p>)}
      </div>
    </Page>
  )
}

export default Browse
