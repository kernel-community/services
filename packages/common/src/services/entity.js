/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

const build = async ({ rpcClient }, { resource }) => {
  const serviceName = 'entityService'
  const method = rpcClient.method.bind(null, serviceName)
  const call = (methodName, ...args) => rpcClient.call({
    method: method(methodName),
    params: [{ resource }].concat(args)
  })

  const create = async (data, meta = {}) => call('create', data, meta)

  const get = async (id) => call('get', id)

  const exists = async (id) => call('exists', id)

  // TODO: add pagination support
  const getAll = async (path = '') => call('getAll', path)
  const list = async (path = '') => call('list', path)

  const remove = async (id) => call('remove', id)

  const patch = async (id, data) => call('patch', id, data)

  const update = async (id, data) => call('update', id, data)

  const updateMeta = async (id, data) => call('updateMeta', id, data)

  return { create, exists, get, getAll, list, remove, patch, update, updateMeta }
}

const entityService = {
  build
}

export default entityService
