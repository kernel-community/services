/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import crypto from 'crypto'

// TODO: move to common
const DELIMITER = '/'

const uuid = () => crypto.randomUUID()
const now = () => Date.now()

const entityUri = (uri, id) => `${uri}${DELIMITER}${id}`
const entityFile = (uri) => `${uri}.json`
const entityObject = ({ id, steward, created, updated, kind, uri, data  }) => {
  return { id, steward, created, updated, kind, uri, data }
}

const create = async (client, { resource, uri },
  { steward, id = uuid(), created = now(), updated = now() }, data) => {
    const entity = entityObject({
      id, steward, created, updated, kind: resource, uri: entityUri(uri, id), data
    })
    return client.save(entityFile(entity.uri), entity)
}

const get = async (client, { resource, uri }, id) => {
  return client.download(entityFile(entityUri(uri, id)))
}

//TODO: add pagination support
const list = async (client, { resource, uri }) => {
  return await client.listObjects({
    query: {prefix: `${uri}${DELIMITER}`}
  })
}

//TODO: add pagination support
const getAll = async (client, { resource, uri }) => {
  return await client.getObjects({
    query: {prefix: `${uri}${DELIMITER}`},
    reducer: (acc, e) => {
      acc[e.id] = e
      return acc
    }
  })
}

const remove = async (client, { resource, uri }, id) => {
  await client.remove(entityFile(entityUri(uri, id)))
  return { resource, uri, id }
}

const exists = async (client, { resource, uri }, id) => {
  return client.exists(entityFile(entityUri(uri, id)))
}

const update = async (client, { resource, uri }, id, data) => {
  const entity = await get(client, { resource, uri }, id)
  Object.assign(entity.data, data)
  entity.updated = now()
  return client.save(entityFile(entity.uri), entity)
}

const updateMeta = async (client, { resource, uri }, id, { steward }) => {
  const entity = await get(client, { resource, uri }, id)
  Object.assign(entity, { steward })
  return client.save(entityFile(entity.uri), entity)
}

const entity = {
  uuid, list, create, get, getAll, update, updateMeta, remove, exists
}

export default entity
