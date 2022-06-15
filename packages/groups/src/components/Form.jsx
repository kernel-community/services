/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useServices, AutocompleteInput, errorUtils } from '@kernel/common'

import AppConfig from 'App.config'

const MODES = { create: 'create', update: 'update' }
const KEYS = ['name', 'memberIdsText', 'groupMembers']
const STATE_KEYS = ['group', 'groups', 'member', 'members', 'profiles', 'error', 'status', 'taskService']
const INITIAL_STATE = STATE_KEYS.concat(KEYS)
  .reduce((acc, k) => Object.assign(acc, { [k]: '' }), {})

const actions = {}
Object.keys(INITIAL_STATE)
  .forEach((k) => {
    actions[k] = (state, e) => Object.assign({}, state, { [k]: e })
  })
INITIAL_STATE.groupMembers = []
INITIAL_STATE.profiles = []

const reducer = (state, action) => {
  try {
    console.log(action.type, action.payload, state)
    return actions[action.type](state, action.payload)
  } catch (error) {
    const cause = `Unhandled action: ${action.type}`
    console.log(cause)
    throw new Error('UnknownActionError', { cause })
  }
}

const change = (dispatch, type, e) => {
  try {
    e.preventDefault()
    const payload = e.target.value
    dispatch({ type, payload })
  } catch (error) {
    console.log(error)
  }
}

const value = (state, type) => {
  return state[type]
}

// dedupe, sort
const getMemberIds = (groupMembers) => groupMembers.map(groupMember => groupMember.id)
const transformProfiles = (profiles) => Object.values(profiles).map(({ data: { memberId, name } }) => ({ id: memberId, name }))
const resetAlerts = (dispatch) => {
  dispatch({ type: 'error', payload: '' })
  dispatch({ type: 'status', payload: 'submitting' })
}

const create = async (state, dispatch, e) => {
  e.preventDefault()
  resetAlerts(dispatch)
  const { groups, groupMembers, name, taskService } = state
  const memberIds = getMemberIds(groupMembers)
  if (!name.length || !groupMembers.length) {
    dispatch({ type: 'error', payload: 'name and member ids are required' })
    return
  }
  try {
    const group = await groups.create({ name })
    const groupId = group.id
    await groups.updateMeta(groupId, { owner: groupId })
    await taskService.syncGroupMembers({ groupId, memberIds })
    dispatch({ type: 'status', payload: 'Group creation submitted' })
  } catch (error) {
    dispatch({ type: 'error', payload: error.message })
  }
}

const update = async (state, dispatch, e) => {
  e.preventDefault()
  resetAlerts(dispatch)
  const { group, groups, groupMembers, name, taskService } = state
  const groupId = group.id
  const memberIds = getMemberIds(groupMembers)
  try {
    if (group.data.name !== name) {
      await groups.patch(groupId, { name })
    }
    await taskService.syncGroupMembers({ groupId, memberIds })
    dispatch({ type: 'status', payload: 'Group update submitted' })
  } catch (error) {
    dispatch({ type: 'error', payload: error.message })
  }
}

const formClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'

const Form = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const navigate = useNavigate()

  global.state = state

  const { group } = useParams()
  const mode = group ? MODES.update : MODES.create

  const { services, currentUser } = useServices()
  const user = currentUser()
  const { readable } = errorUtils

  useEffect(() => {
    if (!user || user.role > AppConfig.minRole) {
      return navigate('/')
    }
  }, [navigate, user])

  useEffect(() => {
    (async () => {
      dispatch({ type: 'status', payload: 'Loading' })
      const { entityFactory, taskService, queryService } = await services()
      dispatch({ type: 'taskService', payload: taskService })
      const members = await entityFactory({ resource: 'member' })
      const member = await members.get(user.iss)
      const groups = await entityFactory({ resource: 'group' })
      let transformedProfiles = []
      try {
        const { profiles } = await queryService.recommend()
        transformedProfiles = transformProfiles(profiles)
      } catch (error) {
        dispatch({ type: 'error', payload: readable(error.message) })
      }
      dispatch({ type: 'members', payload: members })
      dispatch({ type: 'member', payload: member })
      dispatch({ type: 'groups', payload: groups })
      dispatch({ type: 'profiles', payload: transformedProfiles })
      if (mode === MODES.update) {
        const entity = await groups.get(group)
        dispatch({ type: 'group', payload: entity })
        const data = entity.data
        Object.entries(data)
          .forEach(([k, v]) => {
            let type = k
            let payload = v
            if (k === 'memberIds') {
              type = 'groupMembers'
              payload = transformedProfiles.filter(item => v.includes(item.id))
            }
            dispatch({ type, payload })
          })
      }
      dispatch({ type: 'status', payload: '' })
    })()
  }, [services, user.iss, mode, group, readable])

  return (
    <form className='grid grid-cols-1 gap-6'>
      <label className='block'>
        <span className='text-gray-700'>Name</span>
        <input
          type='text' className={formClass}
          value={value(state, 'name')} onChange={change.bind(null, dispatch, 'name')}
        />
      </label>
      <label className='block'>
        <span className='text-gray-700'>Member Names</span>
        <AutocompleteInput
          items={value(state, 'profiles')}
          selectedItems={value(state, 'groupMembers')}
          setSelectedItems={items => dispatch({ type: 'groupMembers', payload: items })}
        />
      </label>
      <label className='block'>
        <button
          onClick={mode === MODES.create ? create.bind(null, state, dispatch) : update.bind(null, state, dispatch)}
          className='mt-6 mb-4 px-6 py-4 text-kernel-white bg-kernel-green-dark w-full rounded font-bold capitalize'
        >
          {mode}
        </button>
      </label>
      {state && state.status &&
        <label className='block'>
          <span className='text-gray-700'>Status</span>
          <div className={formClass}>
            {state.status}
          </div>
        </label>}
      {state && state.error &&
        <label className='block'>
          <span className='text-gray-700'>Error</span>
          <div className={formClass}>
            {state.error}
          </div>
        </label>}
    </form>
  )
}

export default Form
