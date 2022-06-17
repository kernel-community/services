/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useServices } from '@kernel/common'

import AppConfig from 'App.config'
import Page from 'components/Page'

const REFRESH_INTERVAL = 3000
const VOTED = 'Voted'

const vote = async (setStatus, setError, taskService, entity, choice, e) => {
  setError('')
  setStatus('Voting ...')
  try {
    const proposalId = entity.id
    await taskService.voteProposal({ proposalId, choice })
    setStatus(VOTED)
  } catch (e) {
    setError(e.message)
  }
}

const formClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'

const Tally = ({ votes, choices }) => {
  console.log(votes, choices)
  const init = choices.reduce((acc, e) => ({ ...acc, [e]: 0 }), {})
  const sum = !votes
    ? init
    : Object.values(votes).reduce((acc, e) => {
      return { ...acc, [choices[e]]: (acc[choices[e]] + 1) }
    }, init)
  return (
    <div>
      {Object.entries(sum).map(([vote, cnt]) => (<p key={vote}><b>{vote}:</b>{cnt}</p>))}
    </div>
  )
}

const View = () => {
  const navigate = useNavigate()

  const { id } = useParams()

  const { services, currentUser } = useServices()
  const user = currentUser()

  useEffect(() => {
    if (!user || user.role > AppConfig.minRole) {
      return navigate('/')
    }
  }, [navigate, user])

  const [entity, setEntity] = useState()
  const [taskService, setTaskService] = useState()
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      const { entityFactory, taskService } = await services()
      const resource = 'proposal'
      const proposals = await entityFactory({ resource })
      const entity = await proposals.get(id)
      if (entity.data.votes &&
        Object.keys(entity.data.votes).includes(user.iss)) {
        setStatus(VOTED)
      }
      setTaskService(taskService)
      setEntity(entity)
      const refreshFn = async () => {
        if (!window.location.pathname.includes(id)) {
          console.log('cancel refresh')
          return
        }
        console.log('refreshing')
        const updatedEntity = await proposals.get(id)
        setEntity(updatedEntity)
        const refreshMs = Math.floor(Math.random() * REFRESH_INTERVAL) + REFRESH_INTERVAL
        setTimeout(refreshFn, refreshMs)
      }
      setTimeout(refreshFn, REFRESH_INTERVAL)
    })()
    return () => {
      console.log('cleanup')
    }
  }, [services, id, user.iss])

  return (
    <Page>
      <div className='mb-24 px-0 lg:px-24 xl:px-48'>
        <div>
          {entity &&
            <>
              <p><b>Title:</b> {entity.data.title}</p>
              <p><b>Description:</b> {entity.data.description}</p>
              <p><b>Choices:</b> {entity.data.choices.map((choice, i) =>
                <button
                  key={i}
                  onClick={vote.bind(null, setStatus, setError, taskService, entity, i)}
                  disabled={!!(!error.length && status.length)}
                  className={`${!error.length && status.length ? 'bg-gray-300' : 'bg-kernel-green-dark'} mt-6 mb-4 px-6 py-4 text-kernel-white w-full rounded font-bold capitalize`}
                >
                  {choice}
                </button>)}
              </p>
              <Tally choices={entity.data.choices} votes={entity.data.votes} />
              <p />
              <hr />
            </>}
          {status &&
            <label className='block'>
              <span className='text-gray-700'>Status</span>
              <div className={formClass}>
                {status}
              </div>
            </label>}
          {error &&
            <label className='block'>
              <span className='text-gray-700'>Error</span>
              <div className={formClass}>
                {error}
              </div>
            </label>}
        </div>
      </div>
    </Page>
  )
}

export default View
