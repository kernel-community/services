/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import crypto from 'crypto'
import merge from 'deepmerge'
import { Worker } from 'snowflake-uuid'

// TODO: move to common
const BASE = 'resources'
const DELIMITER = '/'

const build = async (client, resourceService, { base = BASE } = {}) => {

  // load known resources
  const resources = await resourceService.resources()

  //TODO: worker opts
  const generator = new Worker()
  const uuid = () => generator.nextId().toString()
  const now = () => Date.now()

  const entityUri = (uri, id) => `${base}${DELIMITER}${uri}${DELIMITER}${id}`
  const entityFile = (uri) => `${uri}.json`
  const entityObject = ({ id, owner, created, updated, kind, uri, data  }) => {
    return { id, owner, created, updated, kind, uri, data }
  }

  const create = async ({ iss, roles}, { resource }, data,
    { owner = iss, id = uuid(), created = now(), updated = now() }) => {
      const { uri } = resources[resource]
      const entity = entityObject({
        id, owner, created, updated, kind: resource, uri: entityUri(uri, id), data
      })
      return client.save(entityFile(entity.uri), entity)
  }

  const intersection = (e, f) => e.filter((g) => f.includes(g))
  const contains = (e, f) => intersection(e, f).length > 0

  const get = async ({ iss, roles }, { resource }, id) => {
    const { uri, readRoles } = resources[resource]
    if (!contains(readRoles, roles) && !readRoles.includes('owner')) {
      throw new Error(`${iss} cannot read ${resource}`)
    }
    const entity = await client.download(entityFile(entityUri(uri, id)))
    if (readRoles.includes('owner') && entity.owner != iss && !contains(readRoles, roles)) {
      throw new Error(`${iss} cannot read ${resource}`)
    }
    return entity
  }

  //TODO: add pagination support
  const list = async ({ iss, roles }, { resource }) => {
    const { uri, readRoles } = resources[resource]
    if (!contains(readRoles, roles)) {
      throw new Error(`${iss} cannot read ${resource}`)
    }
    const entities = await client.listObjects({
      query: {prefix: `${base}${DELIMITER}${uri}${DELIMITER}`}
    })
    return entities.map((e) => e.split(DELIMITER).slice(-1)[0])
  }

  //TODO: add pagination support
  const getAll = async ({ iss, roles }, { resource }) => {
    const { uri, readRoles } = resources[resource]
    if (!contains(readRoles, roles)) {
      throw new Error(`${iss} cannot read ${resource}`)
    }
    return await client.getObjects({
      query: {prefix: `${base}${DELIMITER}${uri}${DELIMITER}`},
      reducer: (acc, e) => {
        acc[e.id] = e
        return acc
      }
    })
  }

  const remove = async (user, { resource }, id) => {
    const { uri, writeRoles } = resources[resource]
    if (!contains(writeRoles, roles)) {
      throw new Error(`${iss} cannot read ${resource}`)
    }
    await client.remove(entityFile(entityUri(uri, id)))
    return { resource, uri, id }
  }

  const exists = async ({ iss, roles }, { resource }, id) => {
    const { uri, readRoles } = resources[resource]
    if (!contains(readRoles, roles)) {
      throw new Error(`${iss} cannot read ${resource}`)
    }
    return client.exists(entityFile(entityUri(uri, id)))
  }

  const update = async (user, { resource }, id, data) => {
    const { uri } = resources[resource]
    const entity = await get(user, { resource, uri }, id)
    Object.assign(entity.data, merge(entity.data, data))
    entity.updated = now()
    return client.save(entityFile(entity.uri), entity)
  }

  const updateMeta = async ({ iss, roles }, { resource }, id, { owner }) => {
    const { uri, metaRoles } = resources[resource]
    if (!contains(metaRoles, roles)) {
      throw new Error(`${iss} cannot read ${resource}`)
    }
    const entity = await get({ iss, roles }, { resource, uri }, id)
    Object.assign(entity, merge(entity, { owner }))
    return client.save(entityFile(entity.uri), entity)
  }

  return {
    uuid, list, create, get, getAll, update, updateMeta, remove, exists
  }
}

const entity = {
  build
}

export default entity
