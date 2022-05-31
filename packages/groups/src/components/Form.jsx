/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useServices } from '@kernel/common'

import AppConfig from 'App.config'

const MODES = { create: 'create', update: 'update' }
const KEYS = ['name', 'memberIds']
const STATE_KEYS = ['group', 'groups', 'member', 'members', 'error']
const INITIAL_STATE = STATE_KEYS.concat(KEYS)
  .reduce((acc, k) => Object.assign(acc, { [k]: '' }), {})

const actions = {}
Object.keys(INITIAL_STATE)
  .forEach((k) => {
    actions[k] = (state, e) => Object.assign({}, state, { [k]: e })
  })

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
  console.log(type, state)

  return state[type]
}

const create = async (state, dispatch, e) => {
  e.preventDefault()
  const { groups, memberIds, member, members, name } = state
  const data = {
    name,
    memberIds: memberIds.split(',').map((e) => e.trim())
  }
  console.log(data)
  try {
    const group = await groups.create(data)
    await groups.updateMeta(group.id, { owner: group.id })
    await members.patch(member.id, { groupIds: [group.id] })
  } catch (error) {
    dispatch({ type: 'error', payload: error })
  }
}

const update = async (state, dispatch, e) => {
  e.preventDefault()
  dispatch({ type: 'error', payload: '' })
  const { group, groups, memberIds, name } = state
  const data = {
    name,
    memberIds: memberIds.split(',').map((e) => e.trim())
  }
  console.log(data)
  try {
    await groups.update(group.id, data)
  } catch (error) {
    dispatch({ type: 'error', payload: error })
  }
}

const formClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'

const Form = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const navigate = useNavigate()

  const { group } = useParams()
  const mode = group ? MODES.update : MODES.create

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
      const member = await members.get(user.iss)
      const groups = await entityFactory({ resource: 'group' })
      dispatch({ type: 'members', payload: members })
      dispatch({ type: 'member', payload: member })
      dispatch({ type: 'groups', payload: groups })
      if (mode === MODES.edit) {
        const entity = await groups.get(group)
        dispatch({ type: 'group', payload: entity })
        const data = entity.data
        Object.entries(data)
          .forEach(([type, v]) => {
            const payload = Array.isArray(v) ? v.join(', ') : v
            dispatch({ type, payload })
          })
      }
    })()
  }, [services, user.iss, mode, group])

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
        <span className='text-gray-700'>Member Ids (comma separated)</span>
        <input
          type='text' multiple className={formClass}
          value={value(state, 'memberIds')} onChange={change.bind(null, dispatch, 'memberIds')}
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
      {state && state.error &&
        <label className='block'>
          <span className='text-gray-700'>Error</span>
          <div className={formClass}>
            {state.error.message}
          </div>
        </label>}
    </form>
  )
}

export default Form
