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

const sortByUpdated = items => Object.values(items).sort(compareByUpdated)

const compareByUpdated = (project1, project2) => {
  if (project1.updated > project2.updated) {
    return -1
  } else if (project1.updated < project2.updated) {
    return 1
  } else {
    return 0
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
      const resource = 'project'
      const projects = await entityFactory({ resource })
      const items = await projects.getAll()
      dispatch({ type: 'items', payload: items })
    })()
  }, [services])

  return (
    <Page>
      <div>
        <ul>
          {state && state.items && sortByUpdated(state.items).map(projectMeta => {
            const project = projectMeta.data
            const updated = Date.now() - projectMeta.updated

            return (
              <li key={projectMeta.id} className='text-gray-700'>
                <Link to={`/view/${project.url}`}>{project.title}</Link>
                <small> {humanize(updated)} ago</small>
              </li>
            )
          })}
        </ul>
      </div>
    </Page>
  )
}

export default Browse
