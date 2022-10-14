/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { linesVector } from '@kernel/common'

const Fingerprints = () => {
  return (
    <div className='relative'>
      <div className='hidden lg:block lg:fixed lg:-top-24 lg:-left-52 lg:z-0'>
        <img alt='kernel fingerprint' src={linesVector} width={383} height={412} />
      </div>
      <div className='hidden lg:block lg:fixed lg:-top-12 lg:-right-52 lg:z-0'>
        <img alt='kernel fingerprint' src={linesVector} width={442} height={476} />
      </div>
    </div>
  )
}

export default Fingerprints
