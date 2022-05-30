/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const env = process.env.REACT_APP_DEPLOY_TARGET || 'PROD'
const prefix = env === 'STAGING' ? 'staging.' : ''

export function getUrl (app) {
  return `https://${prefix}${app}.kernel.community`
}
