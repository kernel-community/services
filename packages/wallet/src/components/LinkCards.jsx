/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Link } from 'react-router-dom'

const EXTERNAL_ROLE = 2000

const LinkCards = ({ user, cardConfig }) => {
  const role = user ? user.role : EXTERNAL_ROLE
  return cardConfig
    .filter(({ minRole }) => role <= minRole)
    .map((card, index) => {
      const relative = card.url.startsWith('/')
      const Tag = relative ? Link : 'a'
      const link = `${card.active ? card.url : '#'}`
      const props = relative ? { to: link } : { href: link }
      return (
        <Tag key={index} {...props}>
          <div className={
                `${card.active ? 'bg-kernel-dark text-kernel-white' : 'bg-kernel-grey'} p-5 rounded shadow-md`
            }
          >
            <div className='text-xl mb-2'>{card.title}</div>
            <div className='text-base mb-1'>{card.description}</div>
          </div>
        </Tag>
      )
    })
}

export default LinkCards
