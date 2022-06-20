
/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const readable = (error) => {
  if (error.toLowerCase().indexOf('consent') > 0) {
    return 'You need to share your profile data in order to view recommendations.'
  }
  if (error.toLowerCase().indexOf('profile') > 0) {
    return 'You need to create your profile first in order to view recommendations.'
  }
  return 'You need to refresh your auth token by reloading this page.'
}

export default { readable }
