/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useServices, linesVector, getUrl } from '@kernel/common'

import { loadWallet } from 'common'

import AppConfig from 'App.config'
import Page from 'components/Page'

const EXTERNAL_ROLE = 2000
const MEMBER_ROLE = 1000

const everyoneCards = [
  {
    title: 'Claim',
    description: 'Get set up with some test ETH',
    url: '/portal/claim',
    active: true,
    minRole: EXTERNAL_ROLE
  },
  {
    title: 'Transact',
    description: 'Understand how transactions work',
    url: '/portal/transact',
    active: true,
    minRole: EXTERNAL_ROLE
  },
  {
    title: 'Deploy',
    description: 'Create your own token now',
    url: '/portal/deploy',
    active: true,
    minRole: EXTERNAL_ROLE
  },
  {
    title: 'Mint',
    description: 'Create an NFT in one go',
    url: '/portal/mint',
    active: true,
    minRole: EXTERNAL_ROLE
  },
  {
    title: 'Contact',
    description: 'Keep your friends\' addresses safe',
    url: '/portal/contact',
    active: false,
    minRole: EXTERNAL_ROLE
  },
  {
    title: 'Contribute',
    description: 'Learn how to improve this with us',
    url: '/portal/contribute',
    active: false,
    minRole: EXTERNAL_ROLE
  },
  {
    title: 'Interact',
    description: 'Explore all the best contracts',
    url: '/portal/interact',
    active: false,
    minRole: EXTERNAL_ROLE
  },
  {
    title: 'Develop',
    description: 'Write your own code!',
    url: '/portal/develop',
    active: false,
    minRole: EXTERNAL_ROLE
  }
]

const memberCards = [
  {
    title: 'UnProfile',
    description: 'Unprofile yourself',
    url: getUrl('unprofile'),
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
    title: 'Groups',
    description: 'Create and manage groups',
    url: getUrl('groups'),
    active: true,
    minRole: MEMBER_ROLE
  },
  {
    title: 'Proposals',
    description: 'Create and vote on Proposals',
    url: getUrl('proposals'),
    active: true,
    minRole: MEMBER_ROLE
  },
  {
    title: 'Apply',
    description: 'Apply to the Kernel Community',
    url: getUrl('apply'),
    active: true,
    minRole: EXTERNAL_ROLE
  },
  {
    title: 'Events',
    description: 'Create and register for Events',
    url: getUrl('events'),
    active: true,
    minRole: MEMBER_ROLE
  },
  {
    title: 'Pages',
    description: 'Create and manage Knowledge',
    url: getUrl('www'),
    active: true,
    minRole: MEMBER_ROLE
  },
  {
    title: 'Chat',
    description: 'Horizontal conversations',
    url: getUrl('chat'),
    active: false,
    minRole: MEMBER_ROLE
  }
]

const LinkCards = ({ user: { role }, cardConfig }) => {
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

const Portal = () => {
  const navigate = useNavigate()

  const { currentUser } = useServices()
  const user = currentUser()

  const [nickname, setNickname] = useState('')

  const wallet = loadWallet()

  useEffect(() => {
    if (!wallet) {
      return navigate('/register/create')
    }
    if (!user || user.role > AppConfig.minRole) {
      return navigate('/login')
    }
    setNickname(wallet.nickname)
  }, [navigate, wallet, user])

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
          <div className='font-heading lg:text-5xl text-5xl text-primary lg:py-5'>
            Welcome, {nickname}.
          </div>
          <hr />
          <div className='text-2xl my-4 text-secondary'>
            You are already valuable, just as you are.
          </div>
          <div className='my-4 text-secondary'>
            This portal will help you learn how to realize some of that value in the
            world of web3. We're so happy you're with us.
          </div>
        </div>

        <div className='my-4 px-4 grid grid-cols-1 md:grid-cols-2 md:my-16 md:px-16'>
          <div>
            <h3 className='font-heading text-center text-3xl text-primary py-5'>For Everyone</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 md:gap-x-8 gap-y-8 border-0 md:border-r border-kernel-grey md:pr-12'>
              <LinkCards user={user} cardConfig={everyoneCards} />
            </div>
          </div>
          <div>
            <h3 className='font-heading text-center text-3xl text-primary py-5'>Kernel Additions</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 md:gap-x-8 gap-y-8 md:pl-12'>
              <LinkCards user={user} cardConfig={memberCards} />
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default Portal
