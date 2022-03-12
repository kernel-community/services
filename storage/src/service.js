/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import fastify from 'fastify'
import sensible from 'fastify-sensible'
import storageService from './storage.js'
import resourceService from './resource.js'
import entityService from './entity.js'

const VERSION = 'v1'

const build = async ({ projectId, bucket }, opts={}) => {

  const service = fastify(opts)
  const client = storageService.build({ projectId, bucket })
  const resources = await resourceService.init(client)
  const baseUri = `/${VERSION}/resources`

  service.register(sensible)

  service.get('/healthz', async (req, rep) => {
    return { status: 'ok' }
  })

  // resources
  service.get(baseUri, async (req, rep) => {
    return { resources }
  })

  service.post(baseUri, async (req, rep) =>
    resourceService.create(client, req.body)
  )

  service.delete(`${baseUri}/:resource`, async (req, rep) =>
    resourceService.remove(client, req.params.resource)
  )

  service.put(`${baseUri}/:resource`, async (req, rep) =>
    resourceService.update(client, req.params.resource, req.body)
  )

  // register entities
  Object.keys(resources).forEach((k) => {
    let resource = resources[k]
    let uri = `${baseUri}/${resource.uri}`

    service.get(`${uri}`, async (req, rep) =>
      req.query.expand && req.query.expand.length ?
        entityService.getAll(client, resource, req.params.id) :
        entityService.list(client, resource, req.params.id)
    )

    service.post(`${uri}`, async (req, rep) =>
      //TODO: JWT
      entityService.create(client, resource, req.query, req.body)
    )

    service.get(`${uri}/:id`, async (req, rep) =>
      entityService.get(client, resource, req.params.id)
    )

    service.head(`${uri}/:id`, async (req, rep) => {
      const exists = await entityService.exists(client, resource, req.params.id)
      if (!exists) {
        return rep.notFound(`entity not found: ${req.params.id}`)
      }
      return {}
    })

    service.delete(`${uri}/:id`, async (req, rep) =>
      entityService.remove(client, resource, req.params.id)
    )

    service.put(`${uri}/:id`, async (req, rep) =>
      entityService.update(client, resource, req.params.id, req.body)
    )

    service.patch(`${uri}/:id`, async (req, rep) =>
      entityService.updateMeta(client, resource, req.params.id, req.body)
    )
  })

  return service
}

export default build
