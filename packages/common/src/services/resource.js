/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

const build = async ({ rpcClient }) => {
  const serviceName = 'resourceService'
  const method = rpcClient.method.bind(null, serviceName)
  const call = (methodName, ...args) => rpcClient.call({
    method: method(methodName),
    params: args
  })

  const resources = async () => call('resources')

  const list = async () => call('list')

  const create = async (resource) => call('create', resource)

  const get = async (resource) => call('get', resource)

  const patch = async (resource) => call('patch', resource)

  const update = async (resource) => call('update', resource)

  const remove = async (resource) => call('remove', resource)

  const exists = async (resource) => call('exists', resource)

  return {
    resources,
    list,
    create,
    get,
    patch,
    update,
    remove,
    exists
  }
}

const resourceService = {
  build
}

export default resourceService
