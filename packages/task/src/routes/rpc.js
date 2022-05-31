/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import taskBuilder from './../services/task.js'
import taskQueueBuilder from './../services/taskQueue.js'
import rpcBuilder from './../services/rpc.js'

//TODO: move to common
import jwtService from './../../../auth/src/services/jwt.js'
import rpcClientBuilder from './../../../auth/src/services/rpcClient.js'

const VERSION = '2.0'
const BEARER_TYPE = 'Bearer'

const authServiceAddress = process.env.AUTH_ADDRESS

const ROLE_ALL = 1000
const ROLE_CORE = 100

const SERVICE_POLICY = {
  taskService: {
    listQueues: ROLE_CORE,
    createQueue: ROLE_CORE,
    listTasks: ROLE_CORE,
    createTask: ROLE_CORE,
    enqueueTask: ROLE_ALL
  },
  taskQueueService: {
    sendEmail: ROLE_CORE,
    emailMember: ROLE_CORE,
    emailMembers: ROLE_CORE,
    rsvpCalendarEvent: ROLE_ALL,
    followProject: ROLE_ALL,
    syncGroupMembers: ROLE_ALL
  }
}

const register = async (server, rpcPath, tasksPath, { seed, serviceAccount, authMemberId, rpcEndpoint, projectId }) => {

  const taskService = await taskBuilder.build({ projectId, relativeUri: tasksPath })
  const taskQueueService = await taskQueueBuilder.build({ seed, serviceAccount, authMemberId, rpcEndpoint })
  const services = { taskService, taskQueueService }
  const rpcService = await rpcBuilder.build(services)

  const now = () => Date.now()
  const auth = async (request, reply) => {
    if (!authServiceAddress) {
      return reply.serviceUnavailable()
    }
    const header = request.raw.headers.authorization
    if (!header) {
      return reply.unauthorized()
    }
    const jwt = header.substring(BEARER_TYPE.length).trim()
    try {
      const { payload, signature } = jwtService.decode(jwt)
      const { iss, nickname, iat, exp, aud } = payload
      if (!iss || !nickname || !iat || !exp || !aud) {
        console.debug(`malformed jwt error: ${payload}`)
        return reply.unauthorized()
      }
      if (iat >= exp || now() >= exp) {
        console.debug(`expiration error: ${payload}`)
        return reply.unauthorized()
      }
      if (!jwtService.verify(jwtService.AUTH_JWT, payload, authServiceAddress, signature)) {
        console.debug(`signature error: ${payload}`)
        return reply.unauthorized()
      }
      request.user = payload
    } catch (e) {
      console.debug('authorization error', e)
      return reply.unauthorized()
    }
  }

  server.options(`${rpcPath}`, async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*")
    reply.header("Access-Control-Allow-Headers", "*")
    reply.header("Access-Control-Allow-Methods", "POST, OPTIONS")
    return {}
  })

  server.post(`${rpcPath}`, { onRequest: auth }, async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*")
    reply.header("Access-Control-Allow-Headers", "*")
    reply.header("Access-Control-Allow-Methods", "POST")
    console.debug('rpc call: ', request.body, request.user)
    const user = request.user
    const { jsonrpc, id, method, params } = request.body
    if (!jsonrpc || !id || !method) {
      return reply.badRequest()
    }
    if (!method.length || method.indexOf('.') < 0) {
      return reply.badRequest()
    }
    const [service, fn] = method.split('.') 
    // rpc level auth
    const policy = SERVICE_POLICY[service][fn] || 0
    console.debug('service policy', policy)
    if (user.role > policy) {
      return reply.unauthorized()
    }
    try {
      const result = await rpcService.call(service, fn, [user].concat(params))
      console.debug('rpc result', result)
      return { jsonrpc, id, result }
    } catch (e) {
      console.debug('error', e)
      const error = { code: e.code, message: e.message }
      return { jsonrpc, id, error }
    }
  })

  // this gets called from cloud tasksPath
  server.post(`${tasksPath}`, async (request, reply) => {
    console.debug('task call: ', request.body)
    // task specific headers
    // TODO: abort if retry count limit reached
    const headers = request.headers
    const taskname =  headers['x-appengine-taskname']
    const queuename =  headers['x-appengine-queuename']
    const taskRetryCount =  headers['x-appengine-taskretrycount']
    const taskExecutionCount =  headers['x-appengine-taskexecutioncount']
    const taskEta =  headers['x-appengine-tasketa']
    const taskTimeout =  headers['x-appengine-timeout-ms']
    const {task: [fn, ...params], user} = request.body

    if (!fn || !user) {
      console.log('taskQueueService: missing arg fn or user')
      return {}
    }
    const service = 'taskQueueService'
    // rpc level auth
    const policy = SERVICE_POLICY[service][fn] || 0
    console.debug('service policy', policy)
    if (user.role > policy) {
      console.log(`user not authorized to call task: ${user.iss} ${fn}`)
      return {}
    }
    try {
      const result = await rpcService.call(service, fn, [user].concat(params))
      console.debug('rpc result', result)
      return { result }
    } catch (e) {
      console.debug('error', e)
      const error = { code: e.code, message: e.message }
      return reply.internalServerError()
    }
  })

  return {listen: () => ''}
}

const rpc = { register }

export default rpc
