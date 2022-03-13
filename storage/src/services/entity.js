/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import crypto from 'crypto'
import { Worker } from 'snowflake-uuid'

// TODO: move to common
const DELIMITER = '/'

const build = async (client) => {

  //TODO: worker opts
  const generator = new Worker()
  const uuid = () => generator.nextId().toString()
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
    const entities = await client.listObjects({
      query: {prefix: `${uri}${DELIMITER}`}
    })
    return entities.map((e) => e.split(DELIMITER).slice(-1)[0])
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

  const exists = async (client, { resource, uri }, id) =>
    client.exists(entityFile(entityUri(uri, id)))

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

  return {
    uuid, list, create, get, getAll, update, updateMeta, remove, exists
  }
}

const entity = {
  //uuid, list, create, get, getAll, update, updateMeta, remove, exists
  build
}

export default entity
