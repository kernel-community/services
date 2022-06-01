/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useServices, timeUtils } from '@kernel/common'

import AppConfig from 'App.config'

import Page from 'components/Page'

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

const sortByUpdated = items => {
  return Object.values(items).sort((a, b) => b.updated - a.updated)
}

const ProjectCard = ({ meta }) => {
  const project = meta.data
  const updated = Date.now() - meta.updated

  return (
    <Link to={`/view/${project.url}`}>
      <div className='my-4 px-4 py-3 w-fit border-2 border-kernel-eggplant-light/50 rounded shadow'>
        <span className='text-kernel-eggplant-light'>{project.title}</span>
        <span className='text-gray-700 text-xs'> {humanize(updated)}</span>
      </div>
    </Link>
  )
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
      const resource = 'project'
      const projects = await entityFactory({ resource })
      const items = await projects.getAll()
      dispatch({ type: 'items', payload: items })
    })()
  }, [services])

  return (
    <Page>
      <div className='px-2 sm:px-8 lg:px-16'>
        <div className='py-4 text-4xl'>All adventures</div>
        <ul>
          {state && state.items && sortByUpdated(state.items).map(projectMeta => {
            return (
              <li key={projectMeta.id} className='text-gray-700'>
                <ProjectCard meta={projectMeta} />
              </li>
            )
          })}
        </ul>
      </div>
    </Page>
  )
}

export default Browse
