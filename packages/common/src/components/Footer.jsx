/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react'
import { FooterLink } from '@kernel/common'

const env = process.env.REACT_APP_DEPLOY_TARGET || 'PROD'
const prefix = env === 'STAGING' ? 'staging.' : ''
const defaults = {
  backgroundColor: 'bg-gray-900',
  textColor: 'text-white',
  footerLinks: [
    { href: 'https://' + prefix + 'explore.kernel.community', title: 'explorer' },
    { href: 'https://' + prefix + 'unprofile.kernel.community', title: 'unprofile' },
    { href: 'https://' + prefix + 'adventures.kernel.community', title: 'adventures' },
    { href: 'https://' + prefix + 'wallet.kernel.community', title: 'portal' },
  ]
}

export default function Footer(props) {
  const { children } = props
  /* TODO: address when Footer has a single child which is not a link */
  const links = children ?
    children.length > 1 ?
      children
        .filter(link => link.props !== undefined)
        .map((link) => ({ href: link.props.href, title: link.props.children }))
      : [{ href: children.props.href, title: children.props.children }]
    : defaults.footerLinks
  const backgroundColor = props.backgroundColor || defaults.backgroundColor
  const textColor = props.textColor || defaults.textColor

  return (
    <>
      <footer className={backgroundColor}>
        <div className={`px-4 py-6 text-sm ${textColor}`}>
          <div className='text-center'>
            <ul className='flex justify-center flex-col lg:flex-row list-none ml-3 mt-3 lg:mt-0 font-semibold'>
              {links.map((link, idx) => {
                return (
                  <li key={idx} className='flex items-center'>
                    <FooterLink link={link} textColor={textColor} />
                  </li>
                )
              })}
            </ul>
            <div className='mt-5'>
              built at <a href='https://kernel.community/' className='text-kernel-green-light'>KERNEL</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
