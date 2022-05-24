/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react'
import { Link } from 'react-router-dom'

export default function NavbarLink (props) {
  const { textColor } = props
  const { url, iconName, title } = props.link

  return (
    <Link
      className={`${textColor} px-3 py-4 lg:px-6 lg:py-2 flex items-center text-sm lowercase font-bold`}
      to={url}
    >
      {iconName &&
        <>
          <i className={`${textColor} ${iconName} text-lg leading-lg mr-2`} />
          {' '}
        </>}
      {title}
    </Link>
  )
}
