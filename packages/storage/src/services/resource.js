/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

const BASE = 'resources'
const EXT = '.json'
const DELIMITER = '/'

// 
const ROLE_ALL = 1000
const ROLE_OWNER = 2000
const ROLE_CORE = 100

const ROLE_RESOURCE = {
  resource: 'role',
  uri: 'roles',
  policy: {
    create: ROLE_CORE,
    get: ROLE_CORE,
    list: ROLE_CORE,
    getAll: ROLE_CORE,
    remove: ROLE_CORE,
    exists: ROLE_CORE,
    patch: ROLE_CORE,
    update: ROLE_CORE,
    updateMeta: ROLE_CORE
  }
}
const MEMBER_RESOURCE = {
  resource: 'member',
  uri: 'members',
  policy: {
    create: ROLE_CORE,
    get: ROLE_CORE,
    list: ROLE_CORE,
    getAll: ROLE_CORE,
    remove: ROLE_CORE,
    exists: ROLE_CORE,
    patch: ROLE_CORE,
    update: ROLE_CORE,
    updateMeta: ROLE_CORE
  }
}
const WALLET_RESOURCE = {
  resource: 'wallet',
  uri: 'wallets',
  policy: {
    create: ROLE_CORE,
    get: ROLE_CORE,
    list: ROLE_CORE,
    getAll: ROLE_CORE,
    remove: ROLE_CORE,
    exists: ROLE_CORE,
    patch: ROLE_CORE,
    update: ROLE_CORE,
    updateMeta: ROLE_CORE
  }
}

const build = async (client, { base = BASE } = {}) => {
  const resourceFile = ({ resource }) => `${base}${DELIMITER}${resource}${EXT}`

  const resources = async (user) => {
    return await client.getObjects({
      query: {prefix: `${base}${DELIMITER}`},
      reducer: (acc, e) => {
        acc[e.resource] = e
        return acc
      }
    })
  }

  const list = async (user) => {
    return await client.listObjects({
      query: {prefix: `${base}${DELIMITER}`}
    })
  }

  const create = async (user, resource) => 
      client.save(resourceFile(resource), resource)

  const get = async (user, resource) =>
    client.download(resourceFile(resource))

  const patch = async (user, resource) => {
    const resourceObj = await get(user, resource)
    Object.assign(resourceObj, resource)
    await client.save(resourceFile(resource), resourceObj)
    return resourceObj
  }

  const update = async (user, resource) => {
    await client.save(resourceFile(resource), resource)
    return resource
  }

  const remove = async (user, resource) => {
      await client.remove(resourceFile(resource))
      return { resource }
  }

  const exists = async (user, resource) =>
    client.exists(resourceFile(resource))

  const setup = async (user) => {
    const resources = [ROLE_RESOURCE, MEMBER_RESOURCE, WALLET_RESOURCE]
    await Promise.all(resources
      .map(async (resource) => {
        const backfill = !await exists(user, resource)
        if (backfill) {
          console.debug('creating', resource)
          await create(user, resource)
        }
      })
    )
  }

  return {
    resources,
    list,
    create,
    get,
    patch,
    update,
    remove,
    exists,
    setup
  }
}

const resource = { build }

export default resource
