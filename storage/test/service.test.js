/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import { test } from 'tap'
import service from '../src/service.js'


test('testing routes', async (t) => {

  const projectId = 'kernel-community'
  const bucket = 'staging.kernel-community.appspot.com'
  const app = await service({ projectId, bucket }, {
    logger: { level: 'debug', prettyPrint: true }
  })

  //TODO: find out why this does not work
  //t.teardown(() => app.close())

  test('healthz', async (t) => {
    const response = await app.inject({
      method: 'GET',
      url: '/healthz'
    })
    t.equal(response.statusCode, 200, 'ok')
  })

  test('resources', async (t) => {
    const response = await app.inject({
      method: 'GET',
      url: '/resources'
    })
    t.equal(response.statusCode, 200, 'ok')
  })

  test('createResources', async (t) => {
    const RESOURCE = {
      resource: 'test',
      uri: 'tests',
      readRoles: ['test'],
      writeRoles: ['test'],
      metaRoles: ['test']
    }
    const response = await app.inject({
      method: 'POST',
      url: '/resources',
      payload: RESOURCE
    })
    t.equal(response.statusCode, 200, 'ok')
    t.same(response.json(), RESOURCE)
  })

  test('deleteResource', async (t) => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/resources/test'
    })
    t.equal(response.statusCode, 200, 'ok')
  })

  test('roles', async (t) => {
    const response = await app.inject({
      method: 'GET',
      url: '/resources/roles'
    })
    t.equal(response.statusCode, 200, 'ok')
  })

  t.end()
})
