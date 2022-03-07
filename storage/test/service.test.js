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

test('root route', async (t) => {
  const app = service()
  const response = await app.inject({
    method: 'GET',
    url: '/'
  })
  t.equal(response.statusCode, 200, 'ok')
})
