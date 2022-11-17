/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useServices, linesVector, getUrl } from '@kernel/common'

import Page from 'components/Page'
import LinkCards from 'components/LinkCards'

const MEMBER_ROLE = 1000

const memberCards = [
  {
    title: 'UnProfile',
    description: 'Unprofile yourself',
    url: getUrl('unprofile'),
    active: true,
    minRole: MEMBER_ROLE
  },
  {
    title: 'Events',
    description: 'Create and register for events',
    url: getUrl('events'),
    active: true,
    minRole: MEMBER_ROLE
  },
  {
    title: 'Adventure',
    description: 'Heed the call to adventure',
    url: getUrl('adventures'),
    active: true,
    minRole: MEMBER_ROLE
  },
  {
    title: 'Explore',
    description: 'Connect with other Fellows',
    url: getUrl('explorer'),
    active: true,
    minRole: MEMBER_ROLE
  },
  {
    title: 'Chat',
    description: 'Horizontal conversations (coming soon)',
    url: getUrl('chat'),
    active: false,
    minRole: MEMBER_ROLE
  },
  {
    title: 'Proposals',
    description: 'Create and vote on proposals',
    url: getUrl('proposals'),
    active: true,
    minRole: MEMBER_ROLE
  },
  {
    title: 'Review',
    description: 'Find the others, welcome them in',
    url: getUrl('review'),
    active: true,
    minRole: MEMBER_ROLE
  },
  {
    title: 'Pages',
    description: 'Create and curate wisdom',
    url: getUrl('www'),
    active: true,
    minRole: MEMBER_ROLE
  },
  {
    title: 'Groups',
    description: 'Create and manage groups',
    url: getUrl('groups'),
    active: true,
    minRole: MEMBER_ROLE
  }
]

const Us = () => {
  const { currentUser } = useServices()
  const user = currentUser()
  return (
    <Page>
      <div className='relative'>
        <div className='hidden lg:block lg:fixed lg:-top-24 lg:-left-52 lg:z-0'>
          <img alt='kernel fingerprint' src={linesVector} width={383} height={412} />
        </div>
        <div className='hidden lg:block lg:fixed lg:-top-12 lg:-right-52 lg:z-0'>
          <img alt='kernel fingerprint' src={linesVector} width={442} height={476} />
        </div>
      </div>
      <div className='mt-32 mx-8 sm:mx-24 xl:mx-48'>
        <div className='text-center'>
          <div className='text-2xl my-4 text-secondary'>
            Welcome home. Love's infinite game begins here...
          </div>
          <hr />
          <div className='my-4 lg:mx-72 text-secondary'>
            This page shows you all the ways you can connect to others, contribute to Kernel, continue creating cool stuff, or find those special Kernel conversations which keep us all coming back to share time with one another.
          </div>
        </div>
        <div>
          <div className='grid grid-cols-1 my-20 md:grid-cols-3 md:gap-x-8 gap-y-8 md:pl-12'>
            <LinkCards user={user} cardConfig={memberCards} />
          </div>
        </div>
      </div>
    </Page>
  )
}

export default Us
