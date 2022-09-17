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

const CHOICES = [
  { emoji: 'unicorn', code: '129412', weight: 5 },
  { emoji: 'ok_hand', code: '128076', weight: 4 },
  { emoji: 'clap', code: '128079', weight: 3 },
  { emoji: 'thumbs up', code: '128077', weight: 2 },
  { emoji: 'thumbs down', code: '128078', weight: 1 }
]
const WEIGHTS = CHOICES.reduce((acc, { code, weight }) => ({ ...acc, [code]: weight }), {})

const VOTED = 'Voted'

const vote = async (setStatus, setError, taskService, entity, choice, e) => {
  setError('')
  setStatus('Voting ...')
  try {
    const reviewId = entity.id
    await taskService.voteReview({ reviewId, choice })
    setStatus(VOTED)
  } catch (e) {
    setError(e.message)
  }
}

const formClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'

const Tally = ({ votes }) => {
  const init = CHOICES.reduce((acc, { code, weight }) => ({ ...acc, [code]: 0 }), {})
  const sum = !votes
    ? init
    : Object.values(votes).reduce((acc, e) => {
      return { ...acc, [e]: (acc[e] + 1) }
    }, init)
  const score = Object.entries(sum)
    .reduce((acc, [code, cnt]) => acc + WEIGHTS[code] * cnt, 0)
  return (
    <div>
      {CHOICES.map(({ code }) => (<p key={code}><b>{String.fromCodePoint(code)}: </b>{sum[code]}</p>))}
      <p><b>Total: </b>{score}</p>
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

  const [application, setApplication] = useState()
  const [entity, setEntity] = useState()
  const [taskService, setTaskService] = useState()
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      const { entityFactory, taskService } = await services()
      const reviews = await entityFactory({ resource: 'review' })
      const applications = await entityFactory({ resource: 'application' })
      const entity = await reviews.get(id)
      const application = await applications.get(entity.data.applicationId)
      setApplication(application)
      if (entity.data.votes &&
        Object.keys(entity.data.votes).includes(user.iss)) {
        setStatus(VOTED)
      }
      setTaskService(taskService)
      setEntity(entity)
      global.entity = entity
    })()
  }, [services, id, user])

  return (
    <Page>
      <div className='mb-24 px-0 lg:px-24 xl:px-48'>
        <div>
          {entity &&
            <>
              {Object.entries(application.data)
                .filter(([key, _]) => !key.includes('Id'))
                .map(([key, value]) => (<p key={key}><b>{key}: </b>{value}</p>))}
              <p>{CHOICES.map(({ code, weight }, i) =>
                <button
                  key={i}
                  onClick={vote.bind(null, setStatus, setError, taskService, entity, code)}
                  disabled={!!(!error.length && status.length)}
                  className={`${!error.length && status.length ? 'bg-gray-300' : 'bg-kernel-green-dark'} mt-6 mb-4 px-6 py-4 text-kernel-white w-full rounded font-bold capitalize`}
                >
                  {String.fromCodePoint(code)}
                </button>)}
              </p>
              <Tally votes={entity.data.votes} />
              <p />
              <hr />
            </>}
          {status &&
            <label className='py-8 block'>
              <span className='text-gray-700'>Status</span>
              <div className={formClass}>
                {status}
              </div>
            </label>}
          {error &&
            <label className='py-8 block'>
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
