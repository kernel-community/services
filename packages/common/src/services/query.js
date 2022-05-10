/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

const build = async ({ rpcClient }) => {
  const serviceName = 'queryService'
  const method = rpcClient.method.bind(null, serviceName)
  const call = (methodName, ...args) => rpcClient.call({
    method: method(methodName),
    params: args
  })

  const recommend = async (opts = {}) => call('recommend', opts)

  return { recommend }
}

const queryService = {
  build
}

export default queryService
