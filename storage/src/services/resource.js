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
const ROLE_RESOURCE = {
  resource: 'role',
  uri: 'roles',
  readRoles: ['api', 'root'],
  writeRoles: ['api', 'root'],
  metaRoles: ['api', 'root']
}
const MEMBER_RESOURCE = {
  resource: 'member',
  uri: 'members',
  readRoles: ['api', 'owner', 'root'],
  writeRoles: ['api', 'owner', 'root'],
  metaRoles: ['api', 'root']
}
const WALLET_RESOURCE = {
  resource: 'wallet',
  uri: 'wallets',
  readRoles: ['api', 'owner', 'root'],
  writeRoles: ['api', 'owner', 'root'],
  metaRoles: ['api', 'root']
}

const build = async (client, { base = BASE } = {}) => {
  const resourceObject = ({ resource, uri, readRoles, writeRoles, metaRoles }) => {
    return { resource, uri, readRoles, writeRoles, metaRoles }
  }
  const resourceFile = (resource) => `${base}${DELIMITER}${resource}${EXT}`

  const init = async (user) => {
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

  const create = async (user, { resource, uri, readRoles,
    writeRoles, metaRoles }) => 
      client.save(resourceFile(resource),
        resourceObject({
          resource, uri, readRoles, writeRoles, metaRoles
        })
      )

  const get = async (user, resource) =>
    client.download(resourceFile(resource))

  const update = async (user, { resource, uri, readRoles,
    writeRoles, metaRoles }) => {
      const resourceObj = await get(user, resource)
      Object.assign(resourceObj, resourceObject({ readRoles, writeRoles, metaRoles }))
      await client.save(resourceFile(resource), resourceObj)
      return resourceObj
  }

  const remove = async (user, resource) => {
      await client.remove(resourceFile(resource))
      return { resource }
  }

  const exists = async (user, resource) =>
    client.exists(resourceFile(resource))

  const resources = await init({}, client)
  return {
    init,
    list,
    create,
    get,
    update,
    remove,
    exists,
    resources: async () => resources
  }
}

const resource = { build }

export default resource
