/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useServices, linesVector } from '@kernel/common'

import Page from 'components/Page'
import LinkCards from 'components/LinkCards'

const EXTERNAL_ROLE = 2000

const everyoneCards = [
  {
    title: '1. Claim',
    description: 'Begin here with "test" money',
    url: '/portal/claim',
    active: true,
    minRole: EXTERNAL_ROLE
  },
  {
    title: '2. Transact',
    description: 'Send money to your friends',
    url: '/portal/transact',
    active: true,
    minRole: EXTERNAL_ROLE
  },
  {
    title: '3. Deploy',
    description: 'Make your own money!',
    url: '/portal/deploy',
    active: true,
    minRole: EXTERNAL_ROLE
  },
  {
    title: '4. Craft',
    description: 'Create an NFT in one go',
    url: '/portal/mint',
    active: true,
    minRole: EXTERNAL_ROLE
  }
]

const Overview = () => {
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
            Making money free
          </div>
          <hr />
          <div className='my-4 lg:mx-72 text-secondary'>
            This page will you help you start learning about all the things you can do with a non-custodial wallet. Begin by claiming some "test" Ether so that you can learn how to sign and understand transactions, create your own tokens, and mint your own on-chain NFTs!
          </div>
        </div>
        <div>
          <div className='grid grid-cols-1 md:grid-cols-2 my-20 md:gap-x-20 gap-y-8 md:px-24'>
            <LinkCards user={user} cardConfig={everyoneCards} />
          </div>
        </div>
      </div>
    </Page>
  )
}

export default Overview
