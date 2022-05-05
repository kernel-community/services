/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react'

const defaults = {
  backgroundColor: 'bg-gray-900',
  textColor: 'text-white'
}

export default function Footer (props) {
  const { children } = props
  const backgroundColor = props.backgroundColor || defaults.backgroundColor
  const textColor = props.textColor || defaults.textColor

  return (
    <>
      <footer className={backgroundColor}>
        <div className={`px-4 py-6 text-sm ${textColor} font-semibold`}>
          <div className='text-center'>
            {children}
          </div>
        </div>
      </footer>
    </>
  )
}
