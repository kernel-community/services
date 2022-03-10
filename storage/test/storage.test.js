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

test('storage', (t) => {

  const client = storage.build({
    projectId: 'kernel-community',
    bucket: 'staging.kernel-community.appspot.com'
  })

  test('save', async (t) => {

    t.fail('not yet implemented')

  })
  t.end()
})
