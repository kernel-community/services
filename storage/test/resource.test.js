/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import { test } from 'tap'

import storage from '../src/storage.js'
import resource from '../src/resource.js'

test('resource', t => {

  const client = storage.build({
    projectId: 'kernel-community',
    bucket: 'staging.kernel-community.appspot.com'
  })

  test('create', async (t) => {
    const result = await resource.create(client, {
      resource: 'foo',
      uri: 'foos',
      readRoles: ['root'],
      writeRoles: ['root'],
      metaRoles: ['root']
    })
    console.log(result)
    t.ok(result, 'result')
  })

  test('get', async (t) => {
    const result = await resource.get(client, 'foo')
    console.log(result)
    t.ok(result, 'result')
  })

  test('update', async (t) => {
    const result = await resource.update(client, {
      resource: 'foo',
      writeRoles: ['root', 'api'],
    })
    console.log(result)
    t.ok(result, 'result')
  })

  test('exists', async (t) => {
    const result = await resource.exists(client, 'foo')
    console.log(result)
    t.ok(result, 'result')
  })

  test('list', async (t) => {
    const result = await resource.list(client)
    console.log(result)
    t.ok(result, 'result')
  })

  test('init', async (t) => {
    const result = await resource.init(client)
    console.log(result)
    t.ok(result, 'result')
  })

  test('remove', async (t) => {
    const result = await resource.remove(client, 'foo')
    console.log(result)
    t.ok(result, 'result')
  })

  t.end()
})

