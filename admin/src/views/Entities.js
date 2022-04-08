/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ethers } from 'ethers'
import { useEffect, useReducer, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import { useServices } from './../ServicesContext.js'

import Navbar from './../components/Navbar.js'
import FooterSmall from './../components/FooterSmall.js'
import Sidebar from './../components/Sidebar.js'

const ADMIN_ROLE = 100 

const INITIAL_STATE = {resources: {}, clients: {}, entity: {}}

const actions = {
  service: (state, service) => Object.assign({}, state, { service }),
  resources: (state, resources) => Object.assign({}, state, { resources }),
  entity: (state, entity) => Object.assign({}, state, { entity }),
  clients: (state, clients) => Object.assign({}, state, { clients }),
  items: (state, { entity, items }) => Object.assign({}, state, { [entity]: items }),
  updated: (state, entity) => {
    const items = state[entity.kind]
    items[entity.id] = entity
    return Object.assign({}, state, { [entity.kind]: items })
  },
  removed: (state, entity) => {
    const items = state[entity.kind]
    delete items[entity.id]
    return Object.assign({}, state, { [entity.kind]: items })
  }
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

const value = (state) => {
  const { entity } = state
  return entity ? JSON.stringify(entity, null, 2) : '' 
}

const change = (dispatch, e) => {
  try {
    e.preventDefault()
    const payload = JSON.parse(e.target.value)
    dispatch({ type: 'entity', payload })
  } catch (error) {
    console.log(error)
  }
}

const EditComponent = ({ state, dispatch }) => {
  return <textarea rows="15" className="w-full" value={ value(state) } onChange={ change.bind(null, dispatch) } />
}

const update = async (state, dispatch, e) => {
  e.preventDefault()
  const { clients, entity } = state 
  const client = clients[entity.kind]
  const updated = await client.update(entity.id, entity.data)
  dispatch({ type: 'updated', payload: updated })
  console.log(updated)
}

const create = async (state, dispatch, e) => {
  e.preventDefault()
  const { clients, entity } = state 
  const client = clients[entity.kind]
  const updated = await client.create(entity.data, { id: entity.id })
  dispatch({ type: 'updated', payload: updated })
  console.log(updated)
}

const remove = async (state, dispatch, e) => {
  e.preventDefault()
  const { clients, entity } = state 
  const client = clients[entity.kind]
  const updated = await client.remove(entity.id)
  dispatch({ type: 'removed', payload: entity })
  console.log(updated)
}

const Entity = ({ title, items, dispatch }) => {
  return (
    <div className="w-full mb-12 xl:mb-0 px-4">
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-base text-blueGray-700">
                { title } 
              </h3>
            </div>
            <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
              <Link
                className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1"
                type="button"
                target="_blank"
                style={{ transition: "all .15s ease" }}
                to="/entities/roles"
              >
                See all
              </Link>
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          {/* Projects table */}
          <div className="items-center w-full bg-transparent border-collapse">
              { Object.keys(items).map((e) => {
                  const item = items[e]
                  const s = JSON.stringify(item, null, 2)
                  console.log(item.id)
                  return (
                    <div key={ item.id }
                      onDoubleClick={ (e) => { dispatch({ type: 'entity', payload: item }) } }>
                      <div className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <pre>
                          { s } 
                        </pre>
                      </div>
                    </div>
                  )
                })
              }
          </div>
        </div>
      </div>
    </div>)
}

const Entities = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE) 
  const navigate = useNavigate()
  const { services, currentUser } = useServices()
  const user = currentUser()

  useEffect(() => {
    //TODO: expired token
    if (!user || user.role > ADMIN_ROLE) {
      return navigate('/')
    }

    (async () => {
      const { resourceService, entityFactory } = await services()
      const resources = await resourceService.resources()
      dispatch({ type: 'resources', payload: resources })
      const clients = await Promise.all(
        Object.keys(resources)
          .map((resource) => Promise.all([resource, entityFactory({ resource })]))
      ).then((e) =>
        e.reduce((acc, [resource, client]) => {
        acc[resource] = client
        return acc
      }, {}))
      dispatch({ type: 'clients', payload: clients })
      Object.keys(clients)
        .map((e) => clients[e].getAll()
          .then((items) => dispatch({ type: 'items', payload: { entity: e, items } })))
    })()
  }, [])

  return (
    <>
      <Sidebar /> 
      <div className="relative md:ml-64 bg-blueGray-100">
        <Navbar />
        {/* Header */}
        <div className="relative bg-amber-200 md:pt-32 pb-32 pt-12">
          <div className="px-4 md:px-10 mx-auto w-full">
            <div>
              {/* Card stats */}
              <div className="flex flex-wrap">
                <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                  <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
                    <div className="flex-auto p-4">
                      <div className="flex flex-wrap">
                        <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                          <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                            Total Resources
                          </h5>
                          <span className="font-semibold text-xl text-blueGray-700">
                            { Object.keys(state.resources).length } 
                          </span>
                        </div>
                        <div className="relative w-auto pl-4 flex-initial">
                          <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-red-500">
                            <i className="fas fa-chart-line"></i>
                          </div>
                        </div>
                      </div>
                        <p className="text-sm text-blueGray-400 mt-4">
                        <span className="text-emerald-500 mr-2">
                          <i className="fas fa-arrow-up"></i> 0.0%
                        </span>
                        <span className="whitespace-nowrap">
                          Since last month
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                  <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
                    <div className="flex-auto p-4">
                      <div className="flex flex-wrap">
                        <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                          <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                            Total Members
                          </h5>
                          <span className="font-semibold text-xl text-blueGray-700">
                          </span>
                        </div>
                        <div className="relative w-auto pl-4 flex-initial">
                          <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-orange-500">
                            <i className="fas fa-chart-simple"></i>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-blueGray-400 mt-4">
                        <span className="text-red-500 mr-2">
                          <i className="fas fa-arrow-down"></i> 0.0%
                        </span>
                        <span className="whitespace-nowrap">
                          Since last week
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                  <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
                    <div className="flex-auto p-4">
                      <div className="flex flex-wrap">
                        <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                          <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                            Total Applications 
                          </h5>
                          <span className="font-semibold text-xl text-gray-700">
                            0 
                          </span>
                        </div>
                        <div className="relative w-auto pl-4 flex-initial">
                          <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-pink-500">
                            <i className="fas fa-chart-pie"></i>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-blueGray-400 mt-4">
                        <span className="text-orange-500 mr-2">
                          <i className="fas fa-arrow-down"></i> 0.0%
                        </span>
                        <span className="whitespace-nowrap">
                          Since yesterday
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                  <div className="relative flex flex-col min-w-0 break-words bg-white rounded mb-6 xl:mb-0 shadow-lg">
                    <div className="flex-auto p-4">
                      <div className="flex flex-wrap">
                        <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
                          <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                            Total Interviews 
                          </h5>
                          <span className="font-semibold text-xl text-blueGray-700">
                            0 
                          </span>
                        </div>
                        <div className="relative w-auto pl-4 flex-initial">
                          <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full bg-sky-500">
                            <i className="fas fa-percent"></i>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-blueGray-400 mt-4">
                        <span className="text-emerald-500 mr-2">
                          <i className="fas fa-arrow-up"></i> 0%
                        </span>
                        <span className="whitespace-nowrap">
                          Since last month
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 md:px-10 mx-auto w-full">
          <div className="flex flex-wrap mt-4">
            { Object.keys(state.resources).map((resource) => {
              const items = state[resource] ? Object.values(state[resource]) : []
              return <Entity title={ resource } items={ items } dispatch={ dispatch } />
            }) }

            <div className="w-full mb-12 xl:mb-0 px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
                <div className="rounded-t mb-0 px-4 py-3 border-0">
                  <div className="flex flex-wrap items-center">
                    <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                      <h3 className="font-semibold text-base text-blueGray-700">
                        Edit 
                      </h3>
                    </div>
                    <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                    </div>
                  </div>
                </div>
                <div className="block w-full overflow-x-auto">
                  <div className="items-center w-full bg-transparent border-collapse">
                    <form>
                      <EditComponent state={ state } dispatch={ dispatch } />
                      <button
                        onClick={ (e) => update(state, dispatch, e) }
                        className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1">
                        Update
                      </button>
                      <button
                        onClick={ (e) => create(state, dispatch, e) }
                        className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1">
                        Create
                      </button>
                      <button
                        onClick={ (e) => remove(state, dispatch, e) }
                        className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1">
                        Remove 
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative md:pt-32">
          <FooterSmall absolute />
        </div>
      </div>
    </>
  )
}

export default Entities
