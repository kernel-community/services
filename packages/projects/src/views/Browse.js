/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer } from 'react'
import { useNavigate, Link } from "react-router-dom"
import { useServices } from "@kernel/common"

import AppConfig from "App.config"
import NavBar from 'components/NavBar'

const INITIAL_STATE = {items: {}}

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
    throw {name: 'UnknownActionError', message: `Unhandled action: ${action.type}`}
  }
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
      const resource = 'project'
      const projects = await entityFactory({ resource })
      const items = await projects.getAll()
      dispatch({ type: 'items', payload: items })
    })()
  }, [services])

  return (
    <div className="md:container md:mx-auto">
      <NavBar />
      <div className="flex md:flex-row flex-wrap py-4 justify-center justify-between">
        <div className="md:basis-1/2 px-8">
         <div className="grid grid-cols-1 gap-6"> 
          <div className="block">
            <ul>
              { state && state.items && Object.keys(state.items).map((e) => {
                const project = state.items[e].data
                return (
                  <li key={ e } className="text-gray-700">
                    <Link to={`/view/${project.url}`}>{ project.title }</Link>
                  </li>
                )
                })
              }
            </ul>
          </div>
         </div> 
        </div>
      </div>
    </div>
  )
}

export default Page

