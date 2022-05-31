/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react'

export default function FooterLink (props) {
  const { textColor } = props
  const { href, title } = props.link

  return (
    <a
      className={`${textColor} px-3 py-4 lg:px-6 lg:py-2 flex items-center text-sm lowercase font-bold`}
      href={href}
    >
      {title}
    </a>
  )
}
